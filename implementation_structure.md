# Implementation Structure: Healthcare Management System (HealthHub)

This document outlines the architecture and directory structure of the HealthHub platform.

## 🏗 System Architecture

The project follows a **Microservices-inspired Monorepo** structure, separating concerns across distinct services:

1.  **Backend (Node.js/Express)**: The core API and business logic.
2.  **AI Service (Python/FastAPI)**: Machine learning service for appointment reliability prediction.
3.  **Web Frontend (React/Vite)**: Admin and User dashboard interface.
4.  **Mobile App (React Native/Expo)**: Cross-platform mobile application for donors and patients.

---

## 📂 Directory Structure

### 1. `/backend` (API Service)
The central hub for data management and authentication.
- `models/`: Mongoose schemas for `User`, `Patient`, `Donor`, `Doctor`, and `Appointment`.
- `routes/`: Express routers for `auth`, `donors`, `appointments`, and `sync`.
- `middleware/`: Authentication (JWT) and validation logic.
- `server.js`: Entry point for the Express server (Port 5000).

### 2. `/ai-service` (Intelligence Layer)
A high-performance Python service for specialized computations.
- `main.py`: FastAPI implementation of the prediction API (Port 8000).
- `model.py`: Random Forest model logic and training/inference pipeline.
- `requirements.txt`: Python dependencies.

### 3. `/frontend-web` (Web Portal)
A modern, responsive dashboard built with React.
- `src/pages/`: Core views such as `Dashboard`, `Register`, `Login`, and `BloodDonation`.
- `src/components/`: Reusable UI elements (`DonorMap`, `QuickCard`, etc.).
- `src/store/`: State management using **Zustand**.
- `src/services/`: API integration layer using **Axios**.

### 4. `/mobile-app` (Cross-Platform Mobile)
Mobile-first experience for field usage.
- `App.js`: Main navigation and entry point.
- `utils/config.js`: Environment-specific configurations (e.g., API base URLs).
- Uses **Expo** for rapid development and testing.

---

## 🔄 Interaction Flow

1.  **Authentication**: Users register on Web/Mobile -> Backend hashes password -> Stores in MongoDB -> Returns JWT.
2.  **Donor Discovery**: Web/Mobile requests nearby donors -> Backend queries MongoDB using `$near` (GeoJSON) -> Returns localized results.
3.  **Appointment Booking**: Patient books appointment -> Backend sends data to AI Service -> AI Service returns reliability score -> Backend stores score and notifies Doctor/Patient.
4.  **Offline Sync**: Mobile app caches data locally during offline usage -> Syncs with `/api/sync` endpoint when connectivity is restored.

---

## 🛠 Tech Stack Summary

- **Database**: MongoDB (NoSQL)
- **Backend Runtime**: Node.js (Express)
- **AI Runtime**: Python (FastAPI/Scikit-learn)
- **Web**: React (Vite, Tailwind CSS, Lucide icons)
- **Mobile**: React Native (Expo)
- **State Management**: Zustand
- **Utility**: Axios, Socket.IO (planned)
