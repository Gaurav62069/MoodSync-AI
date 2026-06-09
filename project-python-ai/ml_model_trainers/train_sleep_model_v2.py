import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

print("🌙 Training ADVANCED Sleep Quality Model...")

# -----------------------------
# FEATURE FORMAT
# -----------------------------
# [movement_var, movement_mean, movement_spikes,
#  screen_interruptions, screen_time,
#  sleep_duration, bedtime_std, wake_std]

X = [
    [0.05, 0.02, 1, 0, 0.3, 8.2, 0.1, 0.1],   # excellent
    [0.12, 0.05, 2, 1, 0.8, 7.5, 0.2, 0.2],   # good
    [0.25, 0.10, 4, 2, 1.5, 6.5, 0.4, 0.3],   # fair
    [0.8,  0.3,  8, 4, 3.0, 5.0, 0.8, 0.6],   # poor
    [1.4,  0.6, 12, 7, 4.5, 4.0, 1.2, 1.0],   # very_poor
]

y = [
    "excellent",
    "good",
    "fair",
    "poor",
    "very_poor"
]

# 🔁 Expand data artificially (safe synthetic)
X, y = np.array(X), np.array(y)
X = np.repeat(X, 50, axis=0)
y = np.repeat(y, 50)

# Add noise
X = X + np.random.normal(0, 0.05, X.shape)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# MODEL
# -----------------------------
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=5,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# EVALUATION
# -----------------------------
preds = model.predict(X_test)
print("📊 Model Evaluation:")
print(classification_report(y_test, preds))

# -----------------------------
# SAVE MODEL
# -----------------------------
MODEL_NAME = "../ml_models/sleep_model_v2.pkl"
joblib.dump(model, MODEL_NAME)

print(f"✅ Advanced Sleep Model saved as '{MODEL_NAME}'")
