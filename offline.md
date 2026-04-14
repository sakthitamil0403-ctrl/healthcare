# 🔄 HealthHub AI: Offline-First Architecture

HealthHub AI is engineered with an **Offline-First philosophy**, ensuring that clinical operations never stall, even in areas with zero connectivity. This is achieved through a robust local persistence layer and a smart synchronization engine.

## 🏛 The Persistence Layer
The application maintains a local copy of critical data on the device to ensure sub-second response times and 100% availability.

### 💾 Mobile: SQLite & AsyncStorage
- **SQLite (`expo-sqlite`)**: Used for structured clinical data, such as the **Sync Queue**.
- **AsyncStorage**: Used for lightweight key-value pairs like JWT tokens, user preferences, and session state.

### 🌐 Web: IndexedDB & LocalStorage
- **LocalStorage**: Stores current session data for instant PWA loading.
- **State Persistence**: Zustand state is synced with local storage to prevent data loss on page refreshes.

---

## ⚙️ The Smart Sync Engine
The heart of the offline capability is the `sync_queue` logic located in `mobile-app/utils/db.js` and integrated into the API services.

### 1. Action Queueing
When the device is offline, any write operation (booking an appointment, updating location, etc.) is not lost. instead:
- The action is serialized into a JSON object.
- It is inserted into the local SQLite `sync_queue` table with a high-resolution timestamp.

### 2. Connectivity Monitoring
The app utilizes `NetInfo` (Mobile) and `navigator.onLine` (Web) to track the network state in real-time.

### 3. Automated Handshake
As soon as connectivity is restored:
- The engine pulls all pending actions from the SQLite `sync_queue`.
- These actions are replayed to the Backend API in sequential order.
- Upon successful processing by the server, the local queue is purged.

---

## 🛡 Data Integrity & Conflict Resolution
To maintain a single source of truth (MongoDB), the system employs two strategies:
1.  **Timestamp Priority**: The server respects the `timestamp` recorded locally at the time of the action, ensuring chronological accuracy even if synced hours later.
2.  **Idempotent Endpoints**: Backend routes are designed to handle retries and duplicate sync calls gracefully.

---

## 🛠 Manual Sync Control
While most synchronization is automated, users can trigger a manual "Cloud Refresh" from their Profile page to force an immediate reconciliation with the central database.

---
*HEALTHHUB AI CORE v1.0 • Synchronization Terminal*
