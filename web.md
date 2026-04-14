# 🌐 HealthHub AI: Web Ecosystem

The HealthHub AI Web platform is a high-performance, responsive clinical dashboard designed for doctors, patients, and administrators. Built with a focus on **real-time intelligence** and **premium aesthetics**, it serves as the central command center for the entire healthcare network.

## 🛠 Technical Stack
- **Framework**: React 18 with Vite (for lightning-fast HMR and build times).
- **State Management**: Zustand (lightweight, decoupled store for global app state).
- **Styling**: Vanilla CSS + Tailwind CSS (using a custom "Glassmorphism" design system).
- **Icons**: Lucide React (feather-style premium icons).
- **Real-time**: Socket.io-client for live clinical alerts and synchronization.
- **Auth**: JWT-based sessions with integrated **Google OAuth 2.0**.

---

## 🏗 Core Modules & Pages

### 1. 📈 Admin Intelligence Monitor
The premium command center for platform governance.
- **Tabbed Infrastructure**: Toggle between Overview, Users, Appointments, and the new **Broadcast Hub**.
- **Smart Advisory**: AI-driven insights suggesting platform optimizations based on clinical load.
- **Triage Matrix**: Visual distribution of appointment severity (Emergency vs. Routine).
- **Emergency Broadcast**: Execute proximity-based alerts to donors via encrypted mail/SMS.

### 2. 🩺 Smart Patient Dashboard
Tailored for healthcare consumers.
- **Appointment Lifecycle**: Track status from "Pending" through "AI-Approved" to "Completed".
- **AI Reliability Score**: Every appointment shows a percentage chance of attendance calculated by the ML service.
- **Voice-Driven Booking**: AI-powered hands-free scheduling with English and Tamil support.
- **Missed Visit Tracking**: Integrated "No-Show" logging that automatically updates the AI Reliability Score.
- **Profile Identity**: Manage clinical data, contact info (AES-256 encrypted), and avatars.

### 🩸 Donor SmartMatch (Blood & Milk)
- **Geospatial Discovery**: Search for donors within a specific kilometer radius.
- **Secure Inquiry Handshake**: Privacy-first contact protocol that allows inquiries without exposing donor PII (Email/Phone).
- **Privacy Guard**: Automatic masking of sensitive phone numbers in donor lists.
- **Role-Switching**: Seamlessly switch between Patient and Donor identities.

---

## 🎨 UI/UX Philosophy: "Glassmorphism"
The web interface utilizes a sophisticated design system:
- **Depth & Blur**: `backdrop-blur-2xl` on cards and headers for a modern, futuristic look.
- **Vibrant Accents**: Teal and Indigo gradients representing "Clinical Accuracy" and "AI Intelligence".
- **Micro-animations**: Smooth transitions using CSS `animate-in` and hover-scale transformations.

---

## 🔐 Security Standards
- **Standardized OAuth**: Integration of Google Signup for passwordless entry.
- **Encrypted Handshakes**: All sensitive data (Phone, Latitude, Longitude) is encrypted at rest in MongoDB.
- **Session Isolation**: Role-based access control (RBAC) ensuring Patients cannot access Admin/Doctor terminals.

---
*HEALTHHUB AI CORE v1.0 • Browser Terminal*
