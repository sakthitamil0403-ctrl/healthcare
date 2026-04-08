const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    try {
        console.log('--- Starting Verification ---\n');
        
        // 1. Login as Patient
        const patientLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'patient@healthhub.com',
            password: 'password123'
        });
        const patientToken = patientLogin.data.token;
        const patientId = patientLogin.data.user.id;
        console.log('✅ Patient (Alice) logged in.');

        // 2. Update Patient Profile (Clinical Data)
        const profileUpdate = await axios.put(`${BASE_URL}/patients/profile`, {
            age: 32,
            gender: 'Female',
            bloodGroup: 'O+',
            medicalHistory: ['Asthma', 'Nut Allergy']
        }, { headers: { Authorization: `Bearer ${patientToken}` } });
        console.log(`✅ Patient clinical profile updated: Age ${profileUpdate.data.age}, History: [${profileUpdate.data.medicalHistory}]`);

        // 3. Login as Doctor to get Doctor ID
        const doctorLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'doctor@healthhub.com',
            password: 'password123'
        });
        const doctorToken = doctorLogin.data.token;
        const doctorId = doctorLogin.data.user.id;
        console.log('✅ Doctor (Dr. Smith) logged in.');

        // 4. Test Overlapping Appointment
        const targetDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
        
        // Book first appointment
        const appt1 = await axios.post(`${BASE_URL}/appointments`, {
            doctor: doctorId,
            date: targetDate,
            reason: 'Routine Checkup'
        }, { headers: { Authorization: `Bearer ${patientToken}` } });
        console.log('✅ First appointment booked successfully.');

        // Try booking overlapping appointment (15 mins later)
        const overlapDate = new Date(new Date(targetDate).getTime() + 15 * 60000).toISOString();
        try {
            await axios.post(`${BASE_URL}/appointments`, {
                doctor: doctorId,
                date: overlapDate,
                reason: 'Follow up'
            }, { headers: { Authorization: `Bearer ${patientToken}` } });
            console.log('❌ Overlap validation failed (allowed booking).');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log(`✅ Overlapping appointment correctly blocked: "${err.response.data.message}"`);
            } else {
                console.log('❌ Unexpected error on overlap check:', err.message);
            }
        }

        // 5. Doctor views appointments and clinical data
        const doctorAppts = await axios.get(`${BASE_URL}/appointments`, {
            headers: { Authorization: `Bearer ${doctorToken}` }
        });
        
        const aliceAppt = doctorAppts.data.find(a => a.patient._id === patientId && a._id === appt1.data._id);
        if (aliceAppt && aliceAppt.patientClinical) {
            console.log(`✅ Doctor successfully retrieved patient clinical data: Age ${aliceAppt.patientClinical.age}, History: [${aliceAppt.patientClinical.medicalHistory}]`);
        } else {
            console.log('❌ Failed to retrieve clinical data for doctor.');
        }

        // 6. Doctor marks appointment as completed
        const completeAppt = await axios.patch(`${BASE_URL}/appointments/${appt1.data._id}/status`, {
            status: 'completed'
        }, { headers: { Authorization: `Bearer ${doctorToken}` } });
        console.log(`✅ Appointment status successfully updated to: ${completeAppt.data.status.toUpperCase()}`);

        console.log('\n--- All API verifications passed successfully! ---');
    } catch (error) {
        console.error('\n❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

runTests();
