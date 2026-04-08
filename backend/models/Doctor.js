const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, default: 'General Practitioner' },
    experience: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 4.5 }
});

module.exports = mongoose.model('Doctor', doctorSchema);
