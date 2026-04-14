# 📱 HealthHub AI: Native Clinical App

The HealthHub AI Mobile Application brings the full power of clinical intelligence to your pocket. Designed as a **Native-First experience**, it leverages hardware sensors and native UI components to provide a superior healthcare journey on the go.

## 🛠 Technical Stack
- **Framework**: React Native with Expo (SDK 51).
- **Navigation**: React Navigation (Stack and Tab layouts).
- **Icons**: MaterialCommunityIcons (@expo/vector-icons).
- **Graphics**: Expo Linear Gradient for premium visuals.
- **Hardware Access**: 
    - `expo-location` for precise Donor SmartMatch.
    - `expo-image-picker` for profile identity verification.
    - `expo-av` for future voice/telehealth integrations.
- **Persistence**: **SQLite** (`expo-sqlite`) for offline-first clinical data storage.

---

## 🏗 Key Mobile Features

### 🎙 Voice-Driven Booking
A signature cross-platform feature that allows users to schedule appointments using natural language.
- **Integrated Hub**: A dedicated `VoiceBookingModal` allows for hands-free symptom entry.
- **AI Reliability Integration**: The mobile booking flow now displays real-time attendance probability and "No-Show" awareness based on clinical profile memory.
- **AI Parity**: Uses the same neural processing engine as the Web Dashboard for consistent logic.

### 🗺 Geospatial Donor Maps
Interactive mapping built directly into the native layer.
- **Native Implementation**: Uses `react-native-maps` for high-performance rendering.
- **Real-time Proximity**: Plots donors dynamically based on the mobile device's live GPS coordinates.
- **Secure Contact Handshake**: Privacy-guarded inquiry protocol allowing users to contact donors/banks without exposing PII.

### 👤 Native Profile & Identity
- **Integrated Image Capture**: Update profiles using the device's native camera or gallery.
- **Secure Storage**: Mobile auth tokens are stored using `AsyncStorage` and encrypted where necessary.
- **Google Native Auth**: Streamlined registration using `expo-auth-session`.

---

## 🎨 Design Philosophy: "Fluid Gradients"
The mobile app uses a "Dark Mode" default aesthetic for reduced eye strain in clinical environments:
- **Depth**: Multi-layered gradients (`#0f172a` ➔ `#1e1b4b`) providing a sense of intelligence and security.
- **Feedback**: Vibrating haptics and native alerts for critical clinical notifications.
- **Responsive Layouts**: Optimized for varying screen sizes using `Dimensions` and `KeyboardAvoidingView`.

---

## 🔄 Sync & Connectivity
The mobile app is built for low-connectivity environments:
- **Background Sync**: Queues appointments and profile updates while offline.
- **Automatic Handshake**: Pushes local SQLite data to the MongoDB cloud as soon as a 4G/Wi-Fi connection is detected.

---
*HEALTHHUB AI CORE v1.0 • Mobile Terminal*
