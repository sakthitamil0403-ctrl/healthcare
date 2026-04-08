const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function testSave() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        await User.deleteMany({ email: 'test@test.com' });
        
        const user = new User({
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            role: 'admin'
        });
        
        console.log('Saving user...');
        await user.save();
        console.log('User saved successfully');
        
        process.exit(0);
    } catch (err) {
        console.error('Error during test save:', JSON.stringify(err, null, 2));
        console.error('Error Message:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

testSave();
