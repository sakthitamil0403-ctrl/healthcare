const express = require('express');
const Donor = require('../models/Donor');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail, sendSMS } = require('../utils/notifications');
const router = express.Router();

// Get donors (with optional SmartMatch radius filtering)
router.get('/', auth(), async (req, res) => {
    try {
        const { lat, lng, radius } = req.query; // radius in KM
        let query = {};

        if (lat && lng) {
            const radiusInMeters = (parseInt(radius) || 50) * 1000;
            query.location = {
                $near: {
                    $geometry: { 
                        type: 'Point', 
                        coordinates: [parseFloat(lng), parseFloat(lat)] 
                    },
                    $maxDistance: radiusInMeters
                }
            };
        }

        const donors = await Donor.find(query).populate('user', 'name email');
        res.json(donors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/nearby', auth(), async (req, res) => {
    try {
        const { longitude, latitude, radius = 5000 } = req.query; // radius in meters
        
        const donors = await Donor.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('user', 'name email');
        
        res.json(donors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/location', auth(['donor']), async (req, res) => {
    try {
        const { longitude, latitude } = req.body;
        await Donor.findOneAndUpdate(
            { user: req.user.id },
            { location: { type: 'Point', coordinates: [longitude, latitude] } },
            { upsert: true }
        );
        res.json({ message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/emergency-alert', auth(), async (req, res) => {
    try {
        const { bloodType, latitude, longitude, radius = 5000, message } = req.body;
        
        // 1. Find donors with matching blood type within the radius
        const nearbyDonors = await Donor.find({
            bloodType,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('user', 'name email phone');

        if (nearbyDonors.length === 0) {
            return res.status(404).json({ message: 'No matching donors found within the radius.' });
        }

        // 2. Prepare the alert message
        const alertBody = `EMERGENCY ALERT: ${bloodType} blood needed immediately. ${message || 'Please report to the nearest hospital.'}`;
        const alertSubject = `HEALTHHUB EMERGENCY: ${bloodType} Donor Required`;

        // 3. Send notifications (Parallel execution)
        const notificationPromises = nearbyDonors.map(async (donor) => {
            const promises = [];
            if (donor.user.email) {
                promises.push(sendEmail(donor.user.email, alertSubject, alertBody));
            }
            if (donor.user.phone) {
                promises.push(sendSMS(donor.user.phone, alertBody));
            }
            return Promise.all(promises);
        });

        await Promise.all(notificationPromises);

        res.json({ 
            message: `Emergency alert broadcasted to ${nearbyDonors.length} donors.`,
            count: nearbyDonors.length
        });
    } catch (err) {
        console.error('Emergency alert error:', err);
        res.status(500).json({ message: 'Failed to broadcast emergency alert.' });
    }
});

module.exports = router;
