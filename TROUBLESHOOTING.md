# 🛠️ HealthHub AI: Troubleshooting Guide

This guide addresses common setup hurdles, performance bottlenecks, and clinical logic errors within the HealthHub AI platform.

---

## 🔐 1. Google OAuth Issues
### **Error: "The given origin is not allowed for the given client ID" (403)**
This occurs when the URL in your browser (e.g., `http://localhost:5173`) isn't whitelisted in the Google Cloud Console.

**Solution:**
1.  Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2.  Select your OAuth 2.0 Client ID (starts with `671707...`).
3.  Add your exact browser URL (e.g., `http://localhost:3000`) to **Authorized JavaScript origins**.
4.  Add `http://localhost:3000/auth/login` (if using that route) or `http://localhost:3000` to **Authorized redirect URIs**.
5.  **Save** and wait 5 minutes for the changes to propagate.

---

## 🤖 2. Voice Booking & AI Failures
### **Error: "Neural AI Service is temporarily offline" (503)**
The Express backend cannot reach the Python AI service.

**Solution:**
1.  Ensure you have Python installed and the `.venv` activated.
2.  Run the following in a new terminal:
    ```bash
    cd ai-service
    python main.py
    ```
3.  Check if `http://127.0.0.1:8000` is accessible in your browser.

### **Error: "No speech could be detected" (400)**
The transcription engine couldn't hear the user or the audio format was unsupported.

**Solution:**
-   Ensure your browser's microphone permissions are granted.
-   Speak clearly and keep the recording length between 3 and 10 seconds.
-   Always use a modern browser (Chrome/Edge) to ensure proper audio chunking.

---

## 🩸 3. Emergency Broadcast Failures
### **Error: Emails/SMS not sending**
**Solution:**
-   Check your `backend/.env` file. Ensuring `EMAIL_USER` and `EMAIL_PASS` (Gmail App Password) are valid.
-   For SMS, verify your `TWILIO_SID` and `TWILIO_TOKEN` are copied exactly from the Twilio Console.
-   **Note**: Twilio requires a "Verified Caller ID" for trial accounts.

---

## 🔄 4. Mobile Offline Sync Issues
### **Issue: Mobile Data not appearing on Web Dashboard**
**Solution:**
1.  The mobile app uses a `sync_queue` in SQLite. 
2.  Actions are only uploaded when connectivity is strong. 
3.  Check the Mobile App's **Log Console** for sync events.
4.  Force-sync by restarting the app or pulling down on the Dashboard list.

---

## 📊 5. AI Reliability Scoring
### **Issue: All scores show "75%" (Heuristic Fallback)**
The Machine Learning model (`reliability_model.pkl`) may be missing.

**Solution:**
-   Run the automated training script to generate the model:
    ```bash
    cd ai-service
    python train_model.py
    ```
-   The AI service will automatically pick up the new `.pkl` file once generated.

---
*HEALTHHUB AI CORE • Diagnostic Console*
