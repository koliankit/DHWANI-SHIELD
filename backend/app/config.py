import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLES_DIR = BASE_DIR / "samples"
DATABASE_PATH = BASE_DIR / "voiceguard.db"

# Security and limits
MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}

# Model Engine metadata
SYSTEM_NAME = "RAKSHAM VoiceGuard AI"
ACOUSTIC_MODEL_NAME = "RAKSHAM-AcousticNet"
ACOUSTIC_MODEL_VERSION = "v2.4.1"
STT_ENGINE_NAME = "RAKSHAM Neural Transcript Engine"
STT_ENGINE_VERSION = "v3.0-multilingual"
FRAUD_RULE_ENGINE_NAME = "FinFraud Semantic Engine"
FRAUD_RULE_ENGINE_VERSION = "v3.1.2"

# Detection thresholds
SYNTHETIC_HIGH_THRESHOLD = 0.70
SYNTHETIC_LOW_THRESHOLD = 0.35
FRAUD_INDICATOR_HIGH_THRESHOLD = 3
FRAUD_INDICATOR_MED_THRESHOLD = 1

os.makedirs(SAMPLES_DIR, exist_ok=True)
