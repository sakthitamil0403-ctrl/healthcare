const express = require('express');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all donors
router.get('/', auth(), async (req, res) => {
    try {
        const donors = await Donor.find().populate('user', 'name email');
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

module.exports = router;
