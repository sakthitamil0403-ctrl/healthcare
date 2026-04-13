const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runRealtimeTest() {
    try {
        console.log('--- Real-time Clinical Alert & Distress Verification ---\n');
        
        // 1. Login as Patient
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'patient@healthhub.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Logged in as Patient.');

        // 2. Fetch Doctor
        const doctorRes = await axios.get(`${BASE_URL}/doctors`, config);
        const doctorId = doctorRes.data[0].user._id;

        // 3. Book Emergency with Distress
        const randomHour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
        const randomDay = Math.floor(Math.random() * 20) + 1;
        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + randomDay);
        apptDate.setHours(randomHour, 0, 0, 0);

        console.log(`\nBooking Emergency with high distress for ${apptDate.toLocaleDateString()} at ${randomHour}:00...`);
        const apptRes = await axios.post(`${BASE_URL}/appointments`, {
            doctor: doctorId,
            date: apptDate.toISOString(),
            reason: 'HELP ME! I am having intense chest pain and I am scared I am dying!'
        }, config);

        console.log('✅ Appointment created.');
        console.log(`   Urgency: ${apptRes.data.urgency}`);
        console.log(`   Priority Score: ${apptRes.data.priorityScore} (Should be 100+)`);
        console.log(`   Recommendation: ${apptRes.data.aiRecommendation}`);

        if (apptRes.data.priorityScore >= 100) {
            console.log('✅ AI correctly identified EXTREME DISTRESS.');
        } else {
            console.log('❌ AI failed to boost priority for distress.');
        }

        console.log('\n--- End-to-End Verification Complete ---');
        console.log('Note: Check the Admin Dashboard browser for the real-time "Critical Clinical Alert" toast.');
    } catch (error) {
        console.error('\n❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

runRealtimeTest();
