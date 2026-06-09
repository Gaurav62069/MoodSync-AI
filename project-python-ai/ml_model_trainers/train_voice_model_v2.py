import numpy as np
import librosa
import glob
import os
import joblib
from collections import Counter

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.ensemble import GradientBoostingClassifier

# ==============================
# CONFIG
# ==============================
DATASET_PATH = "../dataset/ravdess"   # RAVDESS folder
MODEL_PATH = "../ml_models/voice_model_v2.pkl"

SAMPLE_DURATION = 3
OFFSET = 0.5

print("🎤 Initializing ADVANCED Voice Emotion Training...")

# ==============================
# FEATURE EXTRACTION
# ==============================
def extract_features(file_path):
    y, sr = librosa.load(file_path, duration=SAMPLE_DURATION, offset=OFFSET)

    # MFCC (mean + std)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    mfcc_mean = np.mean(mfcc, axis=1)
    mfcc_std = np.std(mfcc, axis=1)

    # Energy
    rms = np.mean(librosa.feature.rms(y=y))

    # Sharpness
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))

    # Pitch
    pitches, mags = librosa.piptrack(y=y, sr=sr)
    pitch_values = pitches[mags > np.max(mags) * 0.6]
    pitch = np.mean(pitch_values) if len(pitch_values) > 0 else 0

    # Spectral brightness
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))

    return np.hstack([
        mfcc_mean,
        mfcc_std,
        rms,
        zcr,
        pitch,
        spectral_centroid
    ])

# ==============================
# DATA LOADING
# ==============================
X, y = [], []

emotion_map = {
    1: 'neutral',
    2: 'calm',
    3: 'happy',
    4: 'sad',
    5: 'angry',
    6: 'fear',
    7: 'disgust',
    8: 'surprise'
}

if os.path.exists(DATASET_PATH):
    print("✅ RAVDESS dataset found. Processing files...")

    for file in glob.glob(os.path.join(DATASET_PATH, "Actor_*/*.wav")):
        try:
            filename = os.path.basename(file)
            emotion_id = int(filename.split("-")[2])

            if emotion_id not in emotion_map:
                continue

            features = extract_features(file)
            X.append(features)
            y.append(emotion_map[emotion_id])

        except Exception as e:
            print("⚠️ Skipped file:", file, e)

else:
    print("❌ Dataset NOT found!")
    print("👉 Download RAVDESS & put inside dataset/ravdess/")
    print("👉 Exiting to avoid garbage model.")
    exit(1)

X = np.array(X)
y = np.array(y)

print(f"📊 Total Samples: {len(X)}")
print("📊 Label Distribution:", Counter(y))

# ==============================
# TRAIN / TEST SPLIT
# ==============================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ==============================
# MODEL (PRODUCTION GRADE)
# ==============================
model = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=4,
    random_state=42
)

print("🚀 Training model...")
model.fit(X_train, y_train)

# ==============================
# EVALUATION
# ==============================
preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)

print(f"🎯 Accuracy: {acc*100:.2f}%")

# ==============================
# SAVE MODEL
# ==============================
joblib.dump({
    "model": model,
    "feature_dim": X.shape[1],
    "labels": model.classes_
}, MODEL_PATH)

print(f"✅ Model saved as {MODEL_PATH}")
print("🔥 Voice AI READY for MoodSync")
