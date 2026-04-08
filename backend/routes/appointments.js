const express = require('express');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get all appointments for a user
router.get('/', auth(), async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'doctor') {
            query = { doctor: req.user.id };
        } else if (req.user.role === 'patient') {
            query = { patient: req.user.id };
        }
        // If admin, query remains empty {} to fetch all
        
        let appointments = await Appointment.find(query)
            .populate('patient doctor', 'name email')
            .sort({ date: -1 });

        // If doctor, populate clinical data from Patient model
        if (req.user.role === 'doctor') {
            const patientIds = appointments.map(a => a.patient?._id).filter(id => id);
            const clinicalProfiles = await Patient.find({ user: { $in: patientIds } });
            
            appointments = appointments.map(appt => {
                const profile = clinicalProfiles.find(cp => cp.user.toString() === appt.patient?._id?.toString());
                if (profile) {
                    const apptObj = appt.toObject();
                    apptObj.patientClinical = profile;
                    return apptObj;
                }
                return appt;
            });
        }
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Book an appointment
router.post('/', auth(['patient']), async (req, res) => {
    try {
        const { doctor, date, reason } = req.body;
        const apptDate = new Date(date);

        // Overlap Validation (30 minute buffer)
        const start = new Date(apptDate.getTime() - 29 * 60000);
        const end = new Date(apptDate.getTime() + 29 * 60000);
        const overlap = await Appointment.findOne({
            doctor,
            date: { $gte: start, $lte: end },
            status: { $in: ['pending', 'approved'] }
        });

        if (overlap) {
            return res.status(400).json({ message: 'Doctor has an overlapping appointment at this time.' });
        }

        // AI Analysis Layer
        let reliabilityScore = 80;
        let riskLevel = 'low';
        let urgency = 'routine';
        let priorityScore = 30;
        let aiRecommendation = 'Standard automated reminder';

        try {
            // 1. Perform Clinical Triage
            const triageResponse = await axios.post(`${process.env.AI_SERVICE_URL}/ai/triage`, {
                reason: reason || 'Routine checkup'
            });
            urgency = triageResponse.data.urgency;
            priorityScore = triageResponse.data.priority_score;
            aiRecommendation = triageResponse.data.recommendation;

            // 2. Predict Reliability using real patient data
            const patientProfile = await Patient.findOne({ user: req.user.id });
            const pastAttendance = await Appointment.countDocuments({ patient: req.user.id, status: 'completed' });

            const reliabilityResponse = await axios.post(`${process.env.AI_SERVICE_URL}/ai/predict-reliability`, {
                past_attendance: pastAttendance,
                age: patientProfile?.age || 30,
                appointment_type: urgency === 'emergency' ? 'urgent' : 'routine',
                location_id: 1,
                urgency: urgency
            });
            reliabilityScore = reliabilityResponse.data.reliability_score;
            riskLevel = reliabilityScore >= 60 ? 'low' : 'high';
        } catch (err) {
            console.error('AI Service down or error:', err.message);
        }

        const appointment = new Appointment({
            patient: req.user.id,
            doctor,
            date,
            reason: reason || '',
            reliabilityScore,
            riskLevel,
            urgency,
            priorityScore,
            aiRecommendation
        });

        await appointment.save();
        const populated = await appointment.populate('patient doctor', 'name email');

        // Real-time Clinical Alert
        if (urgency === 'emergency') {
            const io = req.app.get('io');
            if (io) {
                io.emit('clinical-alert', {
                    message: `🚨 CRITICAL: Emergency appointment booked by ${populated.patient?.name}`,
                    appointment: populated,
                    timestamp: new Date()
                });
            }
        }

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cancel an appointment
router.put('/:id/cancel', auth(['patient']), async (req, res) => {
    try {
        const appt = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });
        if (!['pending', 'approved'].includes(appt.status)) {
            return res.status(400).json({ message: 'Cannot cancel this appointment' });
        }
        appt.status = 'cancelled';
        await appt.save();
        res.json(appt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reschedule an appointment
router.put('/:id/reschedule', auth(['patient']), async (req, res) => {
    try {
        const { date, time } = req.body;
        if (!date) return res.status(400).json({ message: 'New date is required' });
        const appt = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });
        if (appt.status === 'cancelled' || appt.status === 'completed') {
            return res.status(400).json({ message: 'Cannot reschedule this appointment' });
        }
        const newDate = new Date(`${date}T${time || '09:00'}`);
        appt.date = newDate;
        appt.status = 'pending';
        await appt.save();
        res.json(appt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update status (doctor only: approve, reject, complete)
router.patch('/:id/status', auth(['doctor', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['approved', 'rejected', 'completed'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const query = req.user.role === 'admin' 
            ? { _id: req.params.id } 
            : { _id: req.params.id, doctor: req.user.id };

        const appt = await Appointment.findOneAndUpdate(
            query,
            { status },
            { new: true }
        ).populate('patient doctor', 'name email');
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Voice-Encoded Appointment Booking
router.post('/voice-booking', auth(['patient']), upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        const { language } = req.body;

        // 1. Forward to AI Service for Transcription & Intent
        const form = new FormData();
        form.append('audio', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        form.append('language', language || 'en-US');

        const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/ai/process-voice`, form, {
            headers: { ...form.getHeaders() }
        });

        const { parsed_data, transcript, translated_text } = aiResponse.data;

        // 2. Resolve Doctor from parsed name
        let doctorId = null;
        const doctorUser = await User.findOne({ 
            name: { $regex: parsed_data.doctor_name, $options: 'i' },
            role: 'doctor' 
        });
        
        if (doctorUser) {
            doctorId = doctorUser._id;
        } else {
            // Fallback to first available doctor or return specific response
            const defaultDoctor = await User.findOne({ role: 'doctor' });
            doctorId = defaultDoctor?._id;
        }

        // 3. Resolve Date
        let apptDate = new Date();
        if (parsed_data.date_hint === 'tomorrow') {
            apptDate.setDate(apptDate.getDate() + 1);
        }
        apptDate.setHours(10, 0, 0, 0); // Default to 10 AM

        // 4. Reuse standard booking logic (Clinical Triage & Reliability)
        // For simplicity, we directly create the appointment here
        const appointment = new Appointment({
            patient: req.user.id,
            doctor: doctorId,
            date: apptDate,
            reason: parsed_data.reason,
            status: 'pending',
            urgency: 'routine', // AI could also triage the transcript here
            aiRecommendation: `Voice booked: ${transcript}`
        });

        await appointment.save();
        const populated = await appointment.populate('patient doctor', 'name email');
        
        res.status(201).json({
            message: 'Appointment booked via voice!',
            appointment: populated,
            transcript,
            translated: translated_text
        });

    } catch (err) {
        console.error('Voice booking error:', err.message);
        res.status(500).json({ message: 'Failed to process voice booking: ' + err.message });
    }
});

module.exports = router;
