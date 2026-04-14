# 🗺️ HealthHub AI: Process Flows

This document visualizes the core logic and user journeys within the HealthHub AI ecosystem. These flows ensure seamless interaction between the **Web Dashboard**, **Mobile App**, **Backend API**, and **AI Service**.

---

## 1. 📂 Identity Onboarding Flow
Standard and Google OAuth registration journeys.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant Backend
    participant DB

    User->>Frontend: Select Role (Patient/Donor)
    User->>Frontend: Click "Sign up with Google"
    Frontend->>Google: Request Identity Token
    Google-->>Frontend: ID Token (Email, Name, Image)
    Frontend->>Backend: POST /auth/google (Token + Role + Location)
    Backend->>Google: Verify Token
    Backend->>DB: Check if User exists
    alt New User
        Backend->>DB: Create User & Role-specific Profile
        Backend-->>User: Trigger Welcome Email
    else Existing User
        Backend->>DB: Fetch User Identity
    end
    Backend-->>Frontend: JWT Token + Identity Data
    Frontend->>User: Redirect to Dashboard
```

---

## 2. 🩺 Smart Triage & Appointment Flow
From symptom selection to AI-verified booking.

```mermaid
graph TD
    A[Patient: Select Symptoms] --> B[System: Identify Specialty]
    B --> C[Patient: Choose Doctor]
    C --> D[AI Service: Analyze History]
    D --> E{Calculate Reliability}
    E -->|High Store| F[Visual Badge: Low Risk]
    E -->|Low Score| G[Visual Badge: High Risk]
    F --> H[POST /api/appointments]
    G --> H
    H --> I[Admin: Dashboard Alert]
    I --> J{Status Update}
    J -->|Approve| K[Live Notification to Patient]
    J -->|Decline| L[Cancellation Alert]
```

---

## 3. 🚨 Emergency Donor Alert Flow
Geospatial matching and broadcast logic.

```mermaid
graph LR
    A[Admin: Open Broadcast Hub] --> B[Enter Blood Type & Radius]
    B --> C[POST /api/donors/emergency-alert]
    C --> D[Backend: Geospatial Query]
    D --> E[DB: Find Donors in 2dsphere Radius]
    E --> F[Privacy Layer: Secure Contact Info]
    F --> G[Notification Engine]
    G --> H[Parallel Broadcast]
    H --> I[Mail: HTML Template]
    H --> J[SMS: Twilio Gateway]
    I --> K[Donor: Notification Received]
    J --> K
```

---

## 4. 🔄 Offline Data Sync Flow
Maintaining clinical persistence without connectivity.

```mermaid
stateDiagram-v2
    [*] --> Online
    Online --> Offline: Connectivity Lost
    Offline --> ActionQueue: User performs action
    ActionQueue --> SQLite: SAVE to sync_queue table
    SQLite --> Offline: Awaiting Signal
    Offline --> Online: Connectivity Restored
    Online --> SyncEngine: Trigger Handshake
    SyncEngine --> SQLite: FETCH All Pending Actions
    SyncEngine --> Backend: POST Replay Actions
    Backend --> DB: Update Cloud Integrity
    SyncEngine --> SQLite: PURGE sync_queue
    SyncEngine --> [*]: System Harmonized
```

---

## 5. 🎙️ Neural Voice Interaction Flow
Natural language intent extraction and automated booking.

```mermaid
sequenceDiagram
    participant User
    participant App as Frontend (Web/Mobile)
    participant AI as AI Service (FastAPI)
    participant API as Backend (Express)

    User->>App: Record Symptoms & Schedule
    App->>App: WAV Encoding (Sample rate normalization)
    App->>API: POST /api/appointments/voice-booking (Audio + Lang)
    API->>AI: Forward Audio + Language
    AI->>AI: FFmpeg Conversion (webm -> wav)
    AI->>AI: Google Speech Recognition
    AI->>AI: Intent Parsing (Regex/NLP)
    AI-->>API: JSON (Transcript, Doctor, Date, Reason)
    API->>API: Clinical Triage & Reliability Check
    API->>API: Save Appointment to DB
    API-->>App: Unified Success Response
    App->>User: Confirmation Feedback (Visual Check)
```

### 🍼 Human Milk Bank: Secure Handshake Protocol
Privacy-first communication between recipients and donors.

```mermaid
sequenceDiagram
    participant Requester
    participant API as Backend (Express)
    participant Donor as Milk Donor / Bank

    Requester->>API: POST /api/milk/inquire (donorId, message)
    API->>API: Verify Authentication (auth middleware)
    API->>API: Retrieve Donor Contact (Masked PII)
    API->>Donor: Send Priority Notification (Email/SMS)
    Donor-->>API: ACK Handshake
    API-->>Requester: Success Feedback (Toast/Alert)
    Note over Requester,Donor: Secure offline communication channel established
```

---
*HEALTHHUB AI CORE v1.2 • Communications Layer*
