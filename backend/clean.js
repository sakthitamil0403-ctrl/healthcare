const mongoose = require('mongoose');
const User = require('./models/User');
const Donor = require('./models/Donor');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');

async function cleanDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/hema-connect');
        console.log('Connected to DB. Scanning for corrupted zombie accounts...');

        const users = await User.find({});
        let deleted = 0;

        for (let u of users) {
            let recordExists = true;
            if (u.role === 'donor') recordExists = await Donor.findOne({ user: u._id });
            if (u.role === 'patient') recordExists = await Patient.findOne({ user: u._id });
            if (u.role === 'doctor') recordExists = await Doctor.findOne({ user: u._id });

            if (!recordExists) {
                await User.deleteOne({ _id: u._id });
                console.log(`Deleted corrupted orphaned user: ${u.email}`);
                deleted++;
            }
        }
        
        console.log(`Successfully purged ${deleted} zombie accounts from the database.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanDB();
