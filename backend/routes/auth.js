const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Donor = require('../models/Donor');
const { sendWelcomeEmail } = require('../utils/notifications');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone, ...extraInfo } = req.body;
        
        if (role === 'doctor') {
            return res.status(403).json({ message: 'Doctors cannot register publicly. Please contact administration for onboarding.' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, role, phone });
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

        // Send Welcome Email
        sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));

        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                email: user.email,
                phone: user.phone,
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
                email: user.email,
                phone: user.phone,
                image: user.image,
                ...extraFields
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ 
            $or: [{ googleId }, { email }] 
        });

        if (user) {
            // Update googleId if it wasn't set (account linking)
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // New user registration via Google
            const { role, ...extraInfo } = req.body;
            
            // Security: Don't allow doctor/admin registration via public Google OAuth
            const assignedRole = (role === 'doctor' || role === 'admin') ? 'patient' : (role || 'patient');

            user = new User({
                name,
                email,
                googleId,
                image: picture,
                role: assignedRole
            });
            await user.save();
            
            // Create role-specific profile
            if (assignedRole === 'patient') {
                const patient = new Patient({ user: user._id, ...extraInfo });
                await patient.save();
            } else if (assignedRole === 'donor') {
                const donor = new Donor({ user: user._id, ...extraInfo });
                await donor.save();
            }

            // Send Welcome Email (New Google User only)
            sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
        }

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        let extraFields = {};
        if (user.role === 'donor') {
            const donorData = await Donor.findOne({ user: user._id });
            if (donorData) {
                extraFields = { bloodType: donorData.bloodType, donationType: donorData.donationType };
            }
        }

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
                phone: user.phone,
                image: user.image,
                ...extraFields
            }
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ message: 'Google authentication failed', error: err.message });
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
        if (req.body.phone !== undefined) user.phone = req.body.phone;

        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            phone: user.phone,
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
            phone: user.phone,
            image: user.image,
            ...extraFields
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
