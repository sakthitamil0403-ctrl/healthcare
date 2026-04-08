const express = require('express');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all doctors (with user info)
router.get('/', auth(), async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('user', 'name email image');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
