const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Donor = require('../models/Donor');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, ...extraInfo } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, role });
        await user.save();

        if (role === 'patient') {
            const patient = new Patient({ user: user._id, ...extraInfo });
            await patient.save();
        } else if (role === 'doctor') {
            const doctor = new Doctor({ user: user._id, ...extraInfo });
            await doctor.save();
        } else if (role === 'donor') {
            const donor = new Donor({ user: user._id, ...extraInfo });
            await donor.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        let extraFields = {};
        if (role === 'donor') {
            const donorData = await Donor.findOne({ user: user._id });
            extraFields = { bloodType: donorData.bloodType, donationType: donorData.donationType };
        }

        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                image: user.image,
                ...extraFields
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        let extraFields = {};
        if (user.role === 'donor') {
            const donorData = await Donor.findOne({ user: user._id });
            if (donorData) {
                extraFields = { bloodType: donorData.bloodType, donationType: donorData.donationType };
            }
        }

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                image: user.image,
                ...extraFields
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Profile
const auth = require('../middleware/auth');
router.put('/profile', auth(), async (req, res) => {
    try {
        const { name, image } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (image) user.image = image;

        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            image: user.image
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Current User
router.get('/me', auth(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        let extraFields = {};
        if (user.role === 'donor') {
            const donorData = await Donor.findOne({ user: user._id });
            if (donorData) {
                extraFields = { bloodType: donorData.bloodType, donationType: donorData.donationType };
            }
        }

        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            image: user.image,
            ...extraFields
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
