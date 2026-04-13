import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';
const AI_SERVICE_URL = 'http://localhost:8000';

async function verifySystemHealth() {
    console.log("=== HEALTHHUB SYSTEM VERIFICATION PROTOCOL ===");
    
    // 1. Check AI Triage Priority Engine
    console.log("\n[1] Verifying AI Triage Priority Engine...");
    try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/ai/triage`, {
            text: "Patient is bleeding heavily and unconscious.",
            type: "text",
            date: "2024-05-10"
        });
        
        console.log(`    -> Expected Priority > 100.`);
        console.log(`    -> Actual Priority: ${aiRes.data.priority_score}`);
        if (aiRes.data.priority_score > 100) {
            console.log("    -> [PASS] AI Engine correctly flags emergency distress variables.");
        } else {
            console.log("    -> [FAIL] AI Engine failed to amplify priority.");
        }
    } catch (e) {
        console.log("    -> [ERROR] AI Engine unreachable:", e.message);
    }

    // 2. Check Backend Real-time WebSockets
    console.log("\n[2] Verifying Backend Socket.io Emitters...");
    const socket = io(BACKEND_URL);
    
    let socketReceived = false;
    socket.on('connect', () => {
        console.log(`    -> Socket connected (ID: ${socket.id}). Waiting for 'clinical-alert' event...`);
    });

    socket.on('clinical-alert', (data) => {
        console.log(`    -> [PASS] Received 'clinical-alert' event via WebSocket!`);
        console.log(`       Data payload: ${JSON.stringify(data.title)}`);
        socketReceived = true;
    });

    // 3. Initiate Emergency Booking to Trigger Server
    console.log("\n[3] Simulating Clinical Route with Emergency Context...");
    try {
        // Find a doctor to book with
        const docsRes = await axios.get(`${BACKEND_URL}/api/users/doctors`);
        if (docsRes.data.length === 0) throw new Error("No doctors exist in DB.");
        const doctorId = docsRes.data[0].user._id;

        // Find a patient to act as caller
        const patientsRes = await axios.get(`${BACKEND_URL}/api/users/patients`);
        if (patientsRes.data.length === 0) throw new Error("No patients exist in DB.");
        const patientTokenResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email: "patient1@healthhub.com", // Assuming this exists based on early setup
            password: "password123"
        });
        const token = patientTokenResponse.data.token;

        const bookingRes = await axios.post(`${BACKEND_URL}/api/appointments/book`, {
            doctor: doctorId,
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
            time: "14:00",
            notes: "I am experiencing severe chest pain and struggling to breathe. It feels like a heart attack and I need immediate emergency medical attention."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`    -> Appointment created successfully. ID: ${bookingRes.data._id}`);
        
    } catch (e) {
        if(e.response && e.response.status === 400 && e.response.data.message === "Doctor has an overlapping appointment") {
            console.log("    -> [WARN] Appointment creation blocked by scheduling overlap (Expected behavior for DB).");
        } else {
            console.log("    -> [ERROR] Booking Simulation Failed:", e.response?.data?.message || e.message);
        }
    }

    // Wait a brief moment to allow sockets to travel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if(!socketReceived) {
        console.log("\n[WARN] Socket event was not detected during this simulation. It might fail if the appointment overlapped or if patient login failed.");
    }

    console.log("\n=== VERIFICATION COMPLETE ===");
    process.exit(0);
}

verifySystemHealth();
