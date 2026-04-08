const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// Get patient profile (Doctor or self)
router.get('/:userId', auth(['doctor', 'patient', 'admin']), async (req, res) => {
    try {
        // If patient, they can only view their own profile
        if (req.user.role === 'patient' && req.user.id !== req.params.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const profile = await Patient.findOne({ user: req.params.userId }).populate('user', 'name email image');
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update profile (Patient only)
router.put('/profile', auth(['patient']), async (req, res) => {
    try {
        const { age, gender, bloodGroup, medicalHistory } = req.body;
        const profile = await Patient.findOneAndUpdate(
            { user: req.user.id },
            { age, gender, bloodGroup, medicalHistory },
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
