require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Donor = require('./models/Donor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Clear existing
        await User.deleteMany({});
        await Doctor.deleteMany({});
        await Donor.deleteMany({});
        await Patient.deleteMany({});
        await Appointment.deleteMany({});

        // Create Admin
        const admin = new User({
            name: 'Admin User',
            email: 'admin@healthhub.com',
            password: 'password123',
            role: 'admin'
        });
        await admin.save();

        // Create Doctor
        const doctorUser = new User({
            name: 'Dr. John Smith',
            email: 'doctor@healthhub.com',
            password: 'password123',
            role: 'doctor',
            image: '/assets/profiles/doctor.png'
        });
        await doctorUser.save();
        const doctor = new Doctor({
            user: doctorUser._id,
            specialization: 'Cardiology',
            experience: 10
        });
        await doctor.save();

        // Create Patient 1
        const patientUser = new User({
            name: 'Alice Patient',
            email: 'patient@healthhub.com',
            password: 'password123',
            role: 'patient',
            image: '/assets/profiles/patient.png'
        });
        await patientUser.save();
        const patient = new Patient({
            user: patientUser._id,
            bloodGroup: 'O+',
            age: 30,
            gender: 'Female',
            medicalHistory: ['Asthma', 'Seasonal Allergies']
        });
        await patient.save();

        // Create Patient 2
        const patientUser2 = new User({
            name: 'Bob Richards',
            email: 'bob@example.com',
            password: 'password123',
            role: 'patient',
            image: '/assets/profiles/avatar_1.png'
        });
        await patientUser2.save();
        const patient2 = new Patient({
            user: patientUser2._id,
            bloodGroup: 'A-',
            age: 45,
            gender: 'Male',
            medicalHistory: ['Type 2 Diabetes', 'Hypertension']
        });
        await patient2.save();

        // Create Donor
        const donorUser = new User({
            name: 'Bob Donor',
            email: 'donor@healthhub.com',
            password: 'password123',
            role: 'donor'
        });
        await donorUser.save();
        const donor = new Donor({
            user: donorUser._id,
            bloodType: 'A+',
            lastDonationDate: new Date(),
            location: {
                type: 'Point',
                coordinates: [77.5946, 12.9716] // Bangalore
            }
        });
        await donor.save();

        // Create Appointment 1
        const appointment = new Appointment({
            patient: patientUser._id,
            doctor: doctorUser._id,
            date: new Date(),
            status: 'approved',
            reliabilityScore: 85,
            reason: 'Routine checkup and asthma follow-up'
        });
        await appointment.save();

        // Create Appointment 2 (Pending)
        const appointment2 = new Appointment({
            patient: patientUser2._id,
            doctor: doctorUser._id,
            date: new Date(Date.now() + 86400000), // Tomorrow
            status: 'pending',
            reliabilityScore: 45,
            riskLevel: 'high',
            reason: 'General consultation for diabetes management'
        });
        await appointment2.save();

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err.message || err);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    }
};

seedData();
