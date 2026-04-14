# 🏥 HealthHub: Healthcare Management System

A high-performance, **full-stack, offline-first** healthcare ecosystem designed for seamless patient care, intelligent appointment management, and real-time donor matching. Powered by AI-driven reliability scoring.

---

## 🚀 Core Features

### 🩺 Smart Patient Portal
- **AI Reliability Score**: Predicts patient attendance probability for every visit based on history and demographics.
- **Voice-Powered Booking**: Schedule appointments using natural language voice commands in multiple languages (English/Tamil).
- **One-Click Actions**: Quick rescheduling, secure cancellation, and streamlined rebooking for missed visits.
- **Health Journey Timeline**: A centralized dashboard tracking all upcoming and past medical activities.
- **Personalized Identity**: Editable user profiles with native custom file upload support for personal avatars (utilizing `expo-image-picker`). Includes AES-256 encrypted contact data.

### 📈 Clinical & Admin Insights
- **Quick Stats**: Comprehensive metrics for clinical throughput (Total) and operational risks (High Risk Alerts).
- **Smart Schedule**: Prioritized upcoming visits with integrated AI reliability scores for every patient.
- **Analytical Dashboard**: Advanced system overviews with positive/negative data trends and live mock server logs.
- **Admin Onboarding**: Dedicated workflow for administrators to securely onboard and verify medical professionals (Doctors).

### 🤖 AI-Powered Reliability (ScoreCard)
- **Attendance Prediction**: AI-calculated percentage scores for every appointment.
- **No-Show Tracking**: Clinical memory that tracks missed appointments and penalizes future reliability scores.
- **Risk Classification**: Instant visual badges for **Low Risk** and **High Risk** assessments (using Random Forest algorithms).
- **Proactive Management**: Enables clinics to optimize schedules based on predicted no-show rates.

### 🩸 Donor Network (SmartMatch)
- **Geolocation-Based Discovery**: Real-time donor tracking within a specific radius using MongoDB 2dsphere indexing.
- **Multi-Donation Support**: Focused modules for both **Blood** and **Breast Milk** donation.
- **Secure Inquiry Handshake**: Privacy-first inquiry protocol that allows patients to contact donors/banks without exposing PII.
- **Interactive Map View**: Includes a fully functional `react-native-maps` integration that securely plots nearby available donors onto an interactive native map view.
- **Precision Filtering**: Search by blood group, donation proximity, and availability with instant List/Map View toggles.

### 🔄 Multi-Platform & Offline-First Architecture
- **Web & Mobile Feature Parity**: The system delivers identical features whether rendering on the React-Vite built PWA or the native React Native Expo application. 
- **Seamless Sync**: A custom sync engine that queues actions during connectivity gaps and auto-syncs when online.
- **Local Persistence**: Uses SQLite/AsyncStorage (Mobile) and IndexedDB (Web) for core stability.

---

## 🛠 Tech Stack

| Layer | Frontend | Backend | Database/Tools |
| :--- | :--- | :--- | :--- |
| **Web** | React, Vite, Tailwind CSS | Node.js, Express | MongoDB, Zustand |
| **Mobile** | React Native, Expo, React Maps| Node.js, Express | SQLite, AsyncStorage |
| **AI Layer** | - | Python, FastAPI | Scikit-learn, Random Forest |
| **Real-time** | Socket.IO | Socket.IO | - |

---

## 📦 Project Structure

```bash
/backend        # Express API & Socket.IO server (Port: 5000)
/frontend-web   # React PWA dashboard (Port: 3000)
/mobile-app     # Expo mobile application (Fully featured Native/Web app)
/ai-service     # Python ML microservice (Port: 8000)
```

---

## 🏃 Getting Started

### 1. Backend API
```bash
cd backend
npm install
# Create .env based on .env.example
# For MONGODB_URI, use your MongoDB Atlas connection string:
# mongodb+srv://<username>:<password>@cluster0.mongodb.net/healthhub?retryWrites=true&w=majority
node seed.js  # Optional: Seed cloud demo data
npm start     # Runs on http://localhost:5000
```

### 2. AI Microservice
```bash
cd ai-service
# Requires Python 3.8+
pip install -r requirements.txt
python train_model.py  # Generate initial model
python main.py         # Runs on http://localhost:8000
```

### 3. Web Dashboard
```bash
cd frontend-web
npm install
npm run dev   # Runs on http://localhost:3000
```

### 4. Mobile Application (iOS/Android)
```bash
cd mobile-app
npm install
npx expo start
```
*Tip: For physical device testing, ensure `API_URL` in `utils/config.js` points to your machine's local IP.*

---

## 🧠 Model Details
The AI Reliability system leverages a **Random Forest Classifier** trained on:
- 📅 Historical attendance patterns
- 👤 Patient demographics & urgency
- 📍 Geographic proximity
- ⏰ Appointment lead time

---

## 🔑 Authentication & Security
- **Role-Based Access Control (RBAC)**: Secure isolation for Patients, Doctors, Donors, and Admins.
- **JWT-Based Sessions**: Industry-standard session management.
- **AES-256 Symmetric Encryption**: Industry-standard encryption at rest for sensitive contact information using node's `crypto` module.
- **2dsphere Indexing**: Optimized geospatial queries for donor location services.

---

*Built with ❤️ for a healthier future.*
"# healthcare" 
