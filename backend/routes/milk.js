const express = require('express');
const auth = require('../middleware/auth');
const Donor = require('../models/Donor');
const { calculateMilkPriority } = require('../utils/priority');
const { sendEmail } = require('../utils/notifications');
const router = express.Router();

router.get('/nearby', auth(), async (req, res) => {
    try {
        const { longitude, latitude, radius = 5000, urgency = 'routine' } = req.query;
        
        // Find nearby donors filtered for milk
        const donors = await Donor.find({
            donationType: { $in: ['milk', 'both'] },
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('user', 'name email');

        // Map for priority calculation
        const urgencyScore = urgency === 'emergency' ? 90 : urgency === 'urgent' ? 70 : 30;
        const prioritized = calculateMilkPriority(donors.map(d => ({
            donorId: d._id,
            name: d.user?.name,
            email: d.user?.email,
            distance: 5, // Mocked distance for now, though $near handles it
            urgency: urgencyScore
        })));

        res.json(prioritized);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/request-milk', auth(['patient']), async (req, res) => {
    const { urgency, location } = req.body;
    
    // In a real app, find nearby available donors
    const priorityList = calculateMilkPriority([{ name: req.user.name, urgency, distance: 5 }], 100);
    
    // Notify admin or donor
    await sendEmail('admin@healthhub.com', 'New Milk Request', `Urgent request from ${req.user.name}`);
    
    res.json({ message: 'Request submitted', priority: priorityList[0] });
});

module.exports = router;
