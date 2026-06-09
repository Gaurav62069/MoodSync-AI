import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

print("🔮 Training ADVANCED Mood Forecast Model v2...")

# -----------------------------
# FEATURE ENGINEERING
# -----------------------------
"""
Features:
0. negative_mood_ratio   (0–1)
1. avg_sleep_quality     (0–2)
2. sleep_variance
3. mood_volatility
4. negative_streak
"""

X_data = [
    # neg_ratio, avg_sleep, sleep_var, mood_vol, neg_streak
    [0.0, 2.0, 0.1, 0.2, 0],   # happy stable
    [0.2, 1.8, 0.2, 0.3, 1],   # calm
    [0.4, 1.2, 0.6, 0.6, 2],   # sad forming
    [0.6, 0.8, 0.9, 0.8, 3],   # stressed
    [0.8, 0.4, 1.1, 1.0, 4],   # sad deep
    [0.1, 1.9, 0.2, 0.2, 0],   # happy
    [0.3, 1.5, 0.3, 0.4, 1],   # calm
    [0.5, 1.0, 0.7, 0.6, 2],   # stressed
]

y_labels = [
    'happy',
    'calm',
    'sad',
    'stressed',
    'sad',
    'happy',
    'calm',
    'stressed'
]

# -----------------------------
# MODEL PIPELINE
# -----------------------------
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestClassifier(
        n_estimators=300,
        max_depth=6,
        min_samples_split=4,
        random_state=42
    ))
])

pipeline.fit(X_data, y_labels)

print("✅ Forecast Model Training Complete")

# -----------------------------
# SAVE MODEL
# -----------------------------
MODEL_FILE = "../ml_models/forecast_model_v2.pkl"
joblib.dump(pipeline, MODEL_FILE)

print(f"📦 Model saved as {MODEL_FILE}")
