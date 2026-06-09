import os
import uuid
import joblib
import logging
from werkzeug.utils import secure_filename

# --------------------------------------------------
# CONFIG
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # project-python-ai/
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")

ALLOWED_AUDIO_EXTENSIONS = {"wav", "mp3", "ogg", "webm"}

# --------------------------------------------------
# LOGGER SETUP
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("AI-UTILS")

# --------------------------------------------------
# MODEL CACHE (RAM)
# --------------------------------------------------

_MODEL_CACHE = {}

# --------------------------------------------------
# FILE HELPERS
# --------------------------------------------------

def _ensure_dir(path: str):
    """Ensure directory exists"""
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS

# --------------------------------------------------
# AUDIO FILE HANDLING
# --------------------------------------------------

def save_temp_audio_file(audio_file):
    """
    Save uploaded audio safely with UUID filename
    """
    logger.info(f"📁 Uploaded filename: {audio_file.filename}")
    if not audio_file or not audio_file.filename:
        raise ValueError("Invalid audio file")

    if not _allowed_file(audio_file.filename):
        raise ValueError("Unsupported audio format")

    _ensure_dir(UPLOAD_DIR)

    ext = audio_file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"audio_{uuid.uuid4().hex}.{ext}"

    file_path = os.path.join(UPLOAD_DIR, secure_filename(unique_name))
    audio_file.save(file_path)

    logger.info(f"🎧 Temp audio saved: {file_path}")
    return file_path

def remove_temp_file(file_path):
    """Safely remove temp files"""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"🧹 Temp file removed: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to remove temp file: {e}")

# --------------------------------------------------
# ML MODEL LOADING (CACHED)
# --------------------------------------------------

def load_ml_model(model_name: str):
    """
    Load ML model from ml_models with caching
    """
    if not model_name:
        logger.error("Model name is empty")
        return None

    if model_name in _MODEL_CACHE:
        logger.info(f"⚡ Model loaded from cache: {model_name}")
        return _MODEL_CACHE[model_name]

    model_path = os.path.join(MODEL_DIR, model_name)

    if not os.path.exists(model_path):
        logger.error(f"❌ Model not found: {model_path}")
        return None

    try:
        model = joblib.load(model_path)
        _MODEL_CACHE[model_name] = model
        logger.info(f"✅ Model loaded: {model_name}")
        return model
    except Exception as e:
        logger.exception(f"❌ Failed to load model {model_name}: {e}")
        return None
