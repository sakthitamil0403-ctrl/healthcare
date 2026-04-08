import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Create dummy data
data = {
    'past_attendance': [5, 2, 8, 1, 0, 10, 3, 4],
    'age': [25, 45, 30, 20, 55, 35, 40, 50],
    'appointment_type': [0, 1, 0, 1, 0, 1, 0, 1], # 0: routine, 1: urgent
    'location_id': [1, 2, 1, 3, 2, 1, 3, 2],
    'target': [1, 0, 1, 0, 0, 1, 1, 1] # 1: showed up, 0: no-show
}

df = pd.DataFrame(data)
X = df.drop('target', axis=1)
y = df['target']

model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Ensure directory exists
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/reliability_model.pkl')
print("Model saved to models/reliability_model.pkl")
