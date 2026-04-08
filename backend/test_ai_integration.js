const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    try {
        console.log('--- AI Integration Verification ---\n');
        
        // 1. Login as Patient
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'patient@healthhub.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Logged in as Patient.');

        // 2. Test Standard Booking with AI
        console.log('\nTesting Standard Booking AI Analysis...');
        const doctorRes = await axios.get(`${BASE_URL}/doctors`, config);
        const doctorId = doctorRes.data[0].user._id;

        const apptRes = await axios.post(`${BASE_URL}/appointments`, {
            doctor: doctorId,
            date: new Date(Date.now() + 10 * 86400000).toISOString(), // 10 days from now
            reason: 'I have severe chest pain and shortness of breath'
        }, config);

        console.log('✅ Appointment created.');
        console.log(`   Urgency: ${apptRes.data.urgency}`);
        console.log(`   Priority Score: ${apptRes.data.priorityScore}`);
        console.log(`   Reliability Score: ${apptRes.data.reliabilityScore}`);
        console.log(`   Recommendation: ${apptRes.data.aiRecommendation}`);

        if (apptRes.data.urgency === 'emergency') {
            console.log('✅ Triage correctly identified EMERGENCY.');
        } else {
            console.log('❌ Triage failed to identify emergency.');
        }

        // 3. Test Voice Booking (Mock Buffer)
        console.log('\nTesting Voice Booking (Mock Buffer)...');
        const form = new FormData();
        // Just a dummy buffer, the AI service uses recognizer.recognize_google which might fail on random noise, 
        // but we want to check if the multipart delivery works.
        const dummyBuffer = Buffer.from('RIFF....WAVEfmt ....data....', 'binary'); 
        form.append('audio', dummyBuffer, { filename: 'test.wav', contentType: 'audio/wav' });
        form.append('language', 'en-US');

        try {
            const voiceRes = await axios.post(`${BASE_URL}/appointments/voice-booking`, form, {
                headers: { 
                    ...config.headers,
                    ...form.getHeaders() 
                }
            });
            console.log('✅ Voice booking request processed.');
            console.log(`   Transcript: ${voiceRes.data.transcript || 'No transcript generated'}`);
        } catch (err) {
            // It might fail transcription because the buffer is garbage, but we check if it reached the AI service
            if (err.response && err.response.data.message.includes('transcribe')) {
                console.log('✅ Voice booking reached AI service (Transcription failed as expected for dummy buffer).');
            } else {
                console.log('❌ Voice booking failed:', err.response ? err.response.data : err.message);
            }
        }

        console.log('\n--- AI Verification Completed ---');
    } catch (error) {
        console.error('\n❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

runTests();
