# Features Overview: Healthcare Management System (HealthHub)

This document provides a comprehensive list of features implemented and integrated across the HealthHub platform.

## 🔑 Authentication & Security
- **Role-Based Access Control (RBAC)**: Distinct portals for Patients, Doctors, Donors, and Admins.
- **JWT-Based Authentication**: Secure session management and API protection across Web and Mobile.
- **Password Hashing**: Industry-standard encryption for user credentials.
- **AES-256 Symmetric Encryption**: All patient and donor contact data (Phone Numbers) is encrypted at rest using node's `crypto` module.
- **Privacy Guard (Masking)**: Public donor lists employ dynamic phone number masking (e.g., `+91 ******1234`) to prevent illicit data harvesting.

## 🩺 Patient Features
- **Smart Appointments**: 
    - **Advanced Booking**: Rich doctor selector with avatars, specialization, experience, and ratings.
    - **Appointment Lifecycle**: Fully managed states (Pending, Approved, Rejected, Completed, Cancelled).
    - **One-Click Rescheduling**: Quickly change appointment dates and times.
    - **Inline Cancellation**: Secure, dialog-free cancellation with inline confirmation.
    - **Reason for Visit**: Patients can provide medical context during booking.
- **AI Reliability Scoring**: 
    - **Attendance Prediction**: AI-calculated percentage score for every appointment.
    - **Risk Classification**: Visual **Low Risk** and **High Risk** (Random Forest) badges for quick assessment.
- **Health Journey Tracking**: 
    - **Timeline View**: Integrated dashboard section showing upcoming and past medical activities.
    - **Quick Status**: At-a-glance view of Dr. name, status, and AI score on the home screen.
- **Personalized Profiles**: 
    - **Editable Identity**: Update display name directly from the dashboard.
    - **Custom Avatars**: Upload local profile images (Base64-backed) or choose from professional presets.

## 🩸 Donor Network (SmartMatching)
- **Geolocation-Based Discovery**: Find donors within a specific radius using MongoDB 2dsphere indexing.
- **Precision Filtering**: Search donors by blood type (A+, O-, etc.) and donation proximity.
- **Multi-Donation Support**: Support for both **Blood** and **Breast Milk** donation.
- **Registration Enhancements**:
    - **One-Click Location Detection**: Browser-based geolocation during sign-up.
    - **Blood Group Selection**: Donors specify their group for emergency availability.
    - **Donation Preference**: Choose between Blood, Milk, or both to personalize the platform experience.
- **Emergency Broadcast Integration**: Supports automated SMS/Email alerts to matching donors during critical shortages using unmasked contact data.

## 📊 Tailored Dashboards
- **Dynamic UI Adaptation**: The dashboard automatically adjusts its "Quick Access" cards based on the user's role and specific donor preferences.
- **Live Badges**: Real-time display of Donor status (e.g., "MILK DONOR", "AB+ BLOOD GROUP") on the home screen.
- **Professional Overview**: Specialized views for Doctors to manage patient schedules and AI scores.
    - **Quick Stats**: Real-time counters for Total Appointments, Pending Actions, and High-Risk alerts.
    - **Smart Schedule**: Prioritized list of upcoming visits with inline AI reliability predictions.

## 📱 Mobile-First Capabilities
- **Cross-Platform Support**: Full-featured React Native (Expo) app for on-the-go access.
- **Offline-First Synchronization**: Interactive sync engine to handle data entry during connectivity gaps and auto-sync when back online.
- **Mobile Geocoding**: (Planned) Map-based donor discovery on iOS and Android devices.

## 🤖 AI & Analytics Layer
- **Reliability Prediction**: RESTful FastAPI layer that calculates "Reliability Percentages" for scheduled visits.
- **Donor Priority Algorithm**: (Planned) Advanced matching based on donation frequency and urgent patient needs.

## 🛠 Admin & Oversight
- **System Monitoring**: Master dashboard to oversee all donor and patient activity.
- **Network Health**: Track system throughput and data synchronization status.
- **Secure Medical Onboarding**: Administrators manage the exclusive creation and verification of Doctor accounts, ensuring full clinical oversight.
