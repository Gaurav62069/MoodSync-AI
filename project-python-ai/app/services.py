#service.py
from .ai_model import predict_emotion
import librosa
import numpy as np
import traceback


from .utils import load_ml_model

# ==========================
# MODEL LOADING
# ==========================
sleep_model = load_ml_model("../ml_models/sleep_model_v2.pkl")
forecast_model = load_ml_model("../ml_models/forecast_model_v2.pkl")

voice_model = None
voice_labels = []





# ==========================
# RULE BASED FALLBACK
# ==========================
def rule_based_mood(rms, pitch, zcr):
    if rms < 0.006:
        return "silence"

    if rms > 0.05:
        return "happy" if pitch > 220 else "angry"

    if rms < 0.025:
        return "sad" if pitch < 120 else "bored"

    if pitch < 140:
        return "calm"

    return "neutral"

# ==========================
# FINAL HYBRID VOICE ANALYSIS
# ==========================
def analyze_voice_mood(audio_path):
    try:
        # 🎧 Load audio
        print(f"📁 Audio Path: {audio_path}")
        y, sr = librosa.load(audio_path, sr=22050)

        rms = np.sqrt(np.mean(y**2))
        print(f"🎧 RMS: {rms:.4f}")

        # ✅ STEP 1: Silence detect
        if rms < 0.018:
            return "silence", 1.0

        # ✅ STEP 2: AI MODEL (PRIORITY)
        mood, confidence = predict_emotion(audio_path)
        if rms > 0.08:
            return "angry", 0.85

        if confidence > 0.75:
            return mood, confidence

        # ✅ STEP 3: FALLBACK RULE
        if rms > 0.06:
            return "happy", 0.7
        elif rms < 0.035:
            return "sad", 0.7
        elif rms < 0.05:
            return "calm", 0.6

        return "neutral", 0.6

    except Exception:
        print("❌ FULL TRACEBACK")
        traceback.print_exc()
        return "neutral", 0.5
# ==========================
# SLEEP ANALYSIS (UNCHANGED)
# ==========================
def extract_sleep_features(acc_data, scr_data):
    movement_var = acc_data.get("variance", 0.3)
    movement_mean = acc_data.get("mean", 0.1)
    movement_spikes = acc_data.get("spikes", 3)

    screen_interruptions = len(scr_data.get("on_times", []))
    screen_time = scr_data.get("total_minutes", 1.5)

    sleep_duration = scr_data.get("sleep_hours", 6.5)
    bedtime_std = scr_data.get("bedtime_std", 0.4)
    wake_std = scr_data.get("wake_std", 0.4)

    return np.array([[
        movement_var,
        movement_mean,
        movement_spikes,
        screen_interruptions,
        screen_time,
        sleep_duration,
        bedtime_std,
        wake_std
    ]])

def analyze_sleep(acc_data, scr_data):
    features = extract_sleep_features(acc_data, scr_data)

    if sleep_model:
        quality = sleep_model.predict(features)[0]
        confidence = np.max(sleep_model.predict_proba(features))
        return quality, round(float(confidence), 2)

    return "fair", 0.5

# ==========================
# FORECAST ANALYSIS (UNCHANGED)
# ==========================
def extract_forecast_features(data):
    moods = data.get("moods", [])
    sleep = data.get("sleep", [])

    total = len(moods) or 1
    negative = sum(1 for m in moods if m["mood"] in ["sad", "stressed"])

    neg_ratio = negative / total

    sleep_map = {"poor": 0, "good": 1, "excellent": 2}
    sleep_vals = [sleep_map.get(s["quality"], 1) for s in sleep]

    avg_sleep = np.mean(sleep_vals) if sleep_vals else 1
    sleep_var = np.var(sleep_vals) if sleep_vals else 0

    mood_volatility = min(1.0, negative / 5)
    neg_streak = min(5, negative)

    return [
        round(neg_ratio, 2),
        round(avg_sleep, 2),
        round(sleep_var, 2),
        round(mood_volatility, 2),
        neg_streak
    ]

def forecast_mood(historical_data):
    model = load_ml_model("forecast_model_v2.pkl")

    if not model:
        return "calm", 0.5, "fallback"

    features = extract_forecast_features(historical_data)
    probs = model.predict_proba([features])[0]
    classes = model.classes_

    idx = np.argmax(probs)
    return classes[idx], float(probs[idx]), "model"
