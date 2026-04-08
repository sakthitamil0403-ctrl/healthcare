const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: String,
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    medicalHistory: [String]
});

module.exports = mongoose.model('Patient', patientSchema);
