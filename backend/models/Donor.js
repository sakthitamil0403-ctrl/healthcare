const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodType: String,
    donationType: { type: String, enum: ['blood', 'milk', 'both'], default: 'blood' },
    lastDonationDate: Date,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    }
});

donorSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Donor', donorSchema);
