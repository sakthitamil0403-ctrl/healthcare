const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    reason: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    reliabilityScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['low', 'high'], default: 'low' },
    urgency: { type: String, enum: ['emergency', 'urgent', 'routine'], default: 'routine' },
    priorityScore: { type: Number, default: 0 },
    aiRecommendation: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
