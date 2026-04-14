import uvicorn
import joblib
import os
import numpy as np
import speech_recognition as sr
from pydub import AudioSegment
import imageio_ffmpeg

# Configure pydub to use the ffmpeg binary provided by imageio_ffmpeg
AudioSegment.converter = imageio_ffmpeg.get_ffmpeg_exe()
from googletrans import Translator
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import io
import re

app = FastAPI()

# Load model
MODEL_PATH = 'models/reliability_model.pkl'
model = None

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("AI Model loaded successfully")
else:
    print("AI Model not found, using heuristic")

class ReliabilityRequest(BaseModel):
    past_attendance: int
    age: int
    appointment_type: str # 'routine', 'urgent', or 'specialist'
    location_id: int
    urgency: str = 'routine' # New: factor in urgency
    missed_attendance: int = 0 # New: factor in no-shows

class TriageRequest(BaseModel):
    reason: str

translator = Translator()

CLINICAL_KEYWORDS = {
    'emergency': ['heart', 'chest', 'breath', 'stroke', 'unconscious', 'severe bleeding', 'bone break', 'heavy bleeding', 'shortness of breath', 'can\'t breathe'],
    'urgent': ['fever', 'infection', 'pain', 'vomiting', 'rash', 'injury', 'cough', 'flu', 'migraine'],
    'routine': ['checkup', 'follow-up', 'vaccination', 'consultation', 'refill', 'physical', 'dental', 'eye test']
}

DISTRESS_KEYWORDS = ['severe', 'intense', 'help', 'emergency', 'painful', 'scared', 'worried', 'dying', 'urgent', 'immediately', 'critical']

@app.get("/")
async def root():
    ffmpeg_found = False
    try:
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        ffmpeg_found = os.path.exists(ffmpeg_exe)
    except:
        pass
        
    return {
        "status": "Healthcare AI Service Online",
        "version": "2.5 (Neural Health Diagnostics)",
        "diagnostics": {
            "model_loaded": model is not None,
            "ffmpeg_ready": ffmpeg_found,
            "storage_path": os.getcwd()
        },
        "endpoints": ["/ai/predict-reliability", "/ai/triage", "/ai/process-voice"]
    }

@app.post("/ai/predict-reliability")
async def predict_reliability(data: ReliabilityRequest):
    base_score = 75.0
    if model:
        appt_type_num = 1 if data.appointment_type == 'urgent' else 0
        features = np.array([[data.past_attendance, data.age, appt_type_num, data.location_id]])
        prob = model.predict_proba(features)[0][1]
        base_score = round(prob * 100, 2)
    else:
        # Heuristic Logic
        if data.past_attendance < 2: base_score -= 20
        if data.age > 70 or data.age < 10: base_score += 5
    
    # Apply No-Show penalty (Independent of model or heuristic)
    if data.missed_attendance > 0:
        penalty = min(60, data.missed_attendance * 25) # Heavy penalty for every no-show
        base_score -= penalty
        
    if data.urgency == 'emergency': base_score = min(98.0, base_score + 15)
    elif data.urgency == 'urgent': base_score = min(95.0, base_score + 8)
    return {"reliability_score": base_score, "recommendations": "Priority reminder + Call" if base_score < 70 else "Standard automated reminder"}

@app.post("/ai/triage")
async def triage(data: TriageRequest):
    reason_lower = data.reason.lower()
    urgency = 'routine'
    priority_score = 30
    
    # 1. Evaluate Distress using regex for whole words
    # More aggressive distress keywords
    EXTREME_KEYWORDS = ["dying", "emergency", "help", "scared", "intense", "choking", "seizure", "unconscious"]
    distress_count = 0
    for kw in DISTRESS_KEYWORDS + EXTREME_KEYWORDS:
        if re.search(rf'\b{re.escape(kw.lower())}\b', reason_lower):
            distress_count += 1
    
    # 2. Keyword NLP for Urgency
    for category, keywords in CLINICAL_KEYWORDS.items():
        if any(re.search(rf'\b{re.escape(kw.lower())}\b', reason_lower) for kw in keywords):
            urgency = category
            break
    
    # 3. Dynamic Priority Calculation
    # If any extreme keywords found, force emergency
    extreme_found = any(re.search(rf'\b{re.escape(kw)}\b', reason_lower) for kw in EXTREME_KEYWORDS)
    
    if urgency == 'emergency' or extreme_found or distress_count >= 2:
        urgency = 'emergency'
        # Force score to be 110+ to ensure it crosses the frontend and backend 'emergency' thresholds
        priority_score = min(150, 110 + (distress_count * 10))
        recommendation = "CRITICAL: Immediate attention required. High distress signature detected."
    elif urgency == 'urgent' or distress_count >= 1:
        urgency = 'urgent'
        priority_score = min(95, 70 + (distress_count * 10))
        recommendation = "URGENT: Prioritize for evaluation based on distress signals."
    else:
        priority_score = 30 + (distress_count * 10)
        recommendation = "ROUTINE: Schedule based on standard availability."
    
    return {
        "urgency": urgency,
        "priority_score": int(priority_score),
        "recommendation": recommendation,
        "distress_signals": distress_count
    }

@app.post("/ai/process-voice")
async def process_voice(audio: UploadFile = File(...), language: str = Form("en-US")):
    try:
        # 1. Read audio file
        audio_content = await audio.read()
        audio_io = io.BytesIO(audio_content)
        
        # 2. Convert to WAV securely using explicitly installed ffmpeg
        import subprocess, tempfile, imageio_ffmpeg
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_in:
                temp_in.write(audio_content)
                temp_in_path = temp_in.name
            
            temp_out_path = temp_in_path + ".wav"
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            
            subprocess.run(
                [ffmpeg_exe, "-y", "-i", temp_in_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", temp_out_path],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
            )
            
            with open(temp_out_path, "rb") as f:
                wav_io = io.BytesIO(f.read())
            
            if os.path.exists(temp_in_path): os.remove(temp_in_path)
            if os.path.exists(temp_out_path): os.remove(temp_out_path)
        except Exception as e:
            err_msg = e.stderr.decode() if hasattr(e, 'stderr') and e.stderr else str(e)
            print(f"FFmpeg subprocess failed: {err_msg}")
            wav_io = io.BytesIO(audio_content) # Fallback
        
        # 3. Transcribe
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(wav_io) as source:
                recorded_audio = recognizer.record(source)
        except ValueError as ve:
            raise HTTPException(status_code=400, detail="Audio file format is corrupted or unsupported by the browser. Please use a Modern Browser (Chrome/Edge/Safari) and try recording again.")
        
        try:
            transcript = recognizer.recognize_google(recorded_audio, language=language)
            print(f"Transcript ({language}): {transcript.encode('utf-8', 'replace')}")
        except sr.UnknownValueError:
            raise HTTPException(status_code=400, detail="No speech could be detected in the audio. Please speak clearly and try again.")
        except sr.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Could not request results from Google Speech Recognition service; {e}")

        # 4. Translate if Tamil
        processed_text = transcript
        if language.startswith("ta"):
            translation = translator.translate(transcript, src='ta', dest='en')
            processed_text = translation.text
            print(f"Translated: {processed_text.encode('utf-8', 'replace')}")

        # 5. Intent Extraction (Heuristic)
        # Expected patterns: "book with Dr. [Name]", "appt on [Date]", "for [Reason]"
        doctor_match = re.search(r"(?:dr\.|doctor|with)\s+([a-zA-Z]+)", processed_text, re.IGNORECASE)
        doctor = doctor_match.group(1) if doctor_match else "General"
        
        # Simple Reason Extraction (Look for 'for', 'because')
        reason = processed_text
        reason_match = re.search(r"(?:for|because|due to|with)\s+(.+)", processed_text, re.IGNORECASE)
        if reason_match:
            # If it's not the doctor's name, use it as reason
            potential_reason = reason_match.group(1)
            if doctor.lower() not in potential_reason.lower():
                reason = potential_reason

        # Simple Date Extraction (Look for 'tomorrow', 'today', 'next week')
        date_info = "today"
        if "next week" in processed_text.lower():
            date_info = "next week"
        elif "tomorrow" in processed_text.lower():
            date_info = "tomorrow"
        
        # Simple Time Extraction
        # Look for "at 10", "10:30", "10 am", "2 pm", "p.m.", etc.
        time_hint = None
        # Improved regex to handle dots in a.m./p.m.
        time_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|o'clock)?", processed_text.lower())
        if time_match:
            hour = time_match.group(1)
            minute = time_match.group(2) or "00"
            period = time_match.group(3) or ""
            # Normalize period to am/pm (remove dots)
            period = period.replace(".", "").strip()
            time_hint = f"{hour}:{minute} {period}".strip()

        return {
            "transcript": transcript,
            "translated_text": processed_text,
            "parsed_data": {
                "doctor_name": doctor.capitalize(),
                "reason": reason.strip(),
                "date_hint": date_info,
                "time_hint": time_hint
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"Error in process_voice: {trace}")
        raise HTTPException(status_code=500, detail=str(e) + "\n" + trace)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
