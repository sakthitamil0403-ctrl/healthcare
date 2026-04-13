const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth(), async (req, res) => {
    try {
        const { actions } = req.body; // Array of { type, data, offlineId }
        const results = [];

        for (const action of actions) {
            if (action.type === 'BOOK_APPOINTMENT') {
                const appointment = new Appointment({
                    ...action.data,
                    patient: req.user.id,
                    offlineId: action.offlineId,
                    isSynced: true
                });
                await appointment.save();
                results.push({ offlineId: action.offlineId, status: 'success', serverId: appointment._id });
            }
            // Add other sync actions like UPDATE_APPOINTMENT, etc.
        }

        res.json({ results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
