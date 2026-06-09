import traceback

from transformers import pipeline
import librosa
import noisereduce as nr
import soundfile as sf
import tempfile

print("⏳ Loading Emotion AI Model...")

classifier = pipeline(
    "audio-classification",
    model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
)

print("✅ Model Loaded Successfully!")

# ---------------------------
# PREPROCESS AUDIO
# ---------------------------
def preprocess(audio_path):
    y, sr = librosa.load(audio_path, sr=16000)

    # noise reduction
    y = nr.reduce_noise(y=y, sr=sr)

    # save temp cleaned file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    sf.write(temp_file.name, y, sr)

    return temp_file.name


# ---------------------------
# PREDICT EMOTION
# ---------------------------
def predict_emotion(audio_path):
    try:
        clean_audio = preprocess(audio_path)

        results = classifier(clean_audio, top_k=3)

        print("🤖 Top Predictions:", results)

        # ensemble logic
        scores = {}
        for r in results:
            mood = r["label"].lower()
            score = r["score"]
            scores[mood] = scores.get(mood, 0) + score

        final_mood = max(scores, key=scores.get)
        confidence = scores[final_mood]

        # confidence filter
        if confidence < 0.6:
            return "neutral", confidence

        return final_mood, confidence

    except Exception:
        print("❌ AI TRACEBACK")
        traceback.print_exc()
        return "neutral", 0.5