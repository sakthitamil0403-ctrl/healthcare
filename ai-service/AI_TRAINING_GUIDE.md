# 🤖 AI Training & Model Management Guide

This project uses a **Random Forest Classifier** to predict patient appointment reliability and potential no-shows. This guide explains how to set up the environment, train the model, and deploy it within the `ai-service`.

## 🛠 Prerequisites

Ensure you have Python 3.8+ installed. It is highly recommended to use the virtual environment already provided in the project.

1. **Activate Virtual Environment**:
   ```powershell
   # From the project root
   .\.venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```

## 🧠 The Training Process

The training logic is contained in `train_model.py`. Currently, it uses a clinical dataset (dummy features) to establish the baseline for the **ScoreCard** system.

### Training Features:
- `past_attendance`: Number of successful past visits.
- `age`: Patient age.
- `appointment_type`: 0 for Routine, 1 for Urgent.
- `location_id`: Numerical ID of the clinic location.

### How to Train:
Run the script from the `ai-service` directory:
```bash
python train_model.py
```

**Output**: This will generate or overwrite `models/reliability_model.pkl`.

## 🚀 Model Deployment

The `main.py` (FastAPI server) automatically attempts to load the model on startup:

1. It looks for `models/reliability_model.pkl`.
2. If found, it uses the **Random Forest** algorithm for predictions.
3. If not found, it falls back to a **Heuristic-based scoring system** to ensure the API remains functional.

### Verifying the Model
Once the model is trained and the service is running (`python main.py`), you can test the prediction endpoint:

**Endpoint**: `POST http://localhost:8000/ai/predict-reliability`
**Payload**:
```json
{
    "past_attendance": 5,
    "age": 30,
    "appointment_type": "urgent",
    "location_id": 1,
    "urgency": "routine"
}
```

## ⚠️ Troubleshooting

- **Unicode Errors**: If you see `UnicodeEncodeError` when training or running on Windows, ensure your terminal supports UTF-8, or use the patched `print` statements that encode to `utf-8`.
- **Version Mismatch**: If you see `InconsistentVersionWarning` from `scikit-learn`, simply re-run `train_model.py` to regenerate the `.pkl` file using your current environment's library versions.
