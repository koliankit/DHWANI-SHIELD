import os
import wave
import numpy as np

def generate_speech_audio(
    duration: float = 16.0,
    sample_rate: int = 16000,
    base_f0: float = 140.0,
    is_synthetic: bool = False,
    urgency_cadence: bool = False
) -> np.ndarray:
    """
    Generates acoustic waveform simulating human vocal tract formants or synthetic vocoder artifacts.
    """
    num_samples = int(duration * sample_rate)
    t = np.linspace(0, duration, num_samples, endpoint=False)
    
    # Syllable cadence envelope
    syllable_rate = 4.8 if urgency_cadence else 3.2 # syllables per second
    cadence = 0.5 * (1.0 + np.sin(2 * np.pi * syllable_rate * t))
    phrase_envelope = (np.sin(2 * np.pi * 0.25 * t) > -0.4).astype(float)
    envelope = cadence * phrase_envelope
    
    # Fundamental frequency contour
    if is_synthetic:
        # Monotonic, ultra-low pitch variation typical of neural vocoders
        f0 = base_f0 + 1.2 * np.sin(2 * np.pi * 1.5 * t)
        # Add high-frequency vocoder artifacts (high energy above 4kHz typical of synthetic vocoders)
        vocoder_noise = 0.35 * np.sin(2 * np.pi * 5800 * t) + 0.25 * np.sin(2 * np.pi * 7200 * t)
        jitter_noise = 0.002 * np.random.uniform(-1, 1, num_samples)
    else:
        # Natural human pitch inflection and rich micro-tremors
        f0 = base_f0 + 35.0 * np.sin(2 * np.pi * 0.4 * t) + 12.0 * np.cos(2 * np.pi * 1.5 * t)
        vocoder_noise = 0.01 * np.sin(2 * np.pi * 1200 * t)
        jitter_noise = 0.08 * np.random.normal(0, 1, num_samples)

    # Vocal tract formants (F1, F2, F3)
    f1 = 550.0  # Hz
    f2 = 1750.0 # Hz
    f3 = 2650.0 # Hz
    
    harmonics = (
        0.50 * np.sin(2 * np.pi * f0 * t) +
        0.30 * np.sin(2 * np.pi * 2 * f0 * t) +
        0.25 * np.sin(2 * np.pi * 3 * f0 * t) +
        0.20 * np.sin(2 * np.pi * f1 * t) +
        0.15 * np.sin(2 * np.pi * f2 * t) +
        0.08 * np.sin(2 * np.pi * f3 * t)
    )
    
    signal = (harmonics + vocoder_noise) * envelope + jitter_noise
    
    # Background noise floor
    if is_synthetic:
        signal += 0.012 * np.random.uniform(-1, 1, num_samples)
    else:
        signal += 0.005 * np.random.normal(0, 1, num_samples)
        
    max_amp = np.max(np.abs(signal))
    if max_amp > 0:
        signal = 0.85 * (signal / max_amp)
        
    return signal.astype(np.float32)

def save_wav(filepath: str, audio: np.ndarray, sample_rate: int = 16000):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    int16_audio = (audio * 32767).astype(np.int16)
    with wave.open(filepath, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int16_audio.tobytes())

def generate_all_samples():
    base_dir = os.path.dirname(__file__)
    samples_dir = os.path.join(base_dir, "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    # 1. Benign Conversation (Genuine Voice + Clean Dialogue)
    benign_audio = generate_speech_audio(duration=14.5, is_synthetic=False, urgency_cadence=False, base_f0=165.0)
    save_wav(os.path.join(samples_dir, "benign_conversation.wav"), benign_audio)
    save_wav(os.path.join(samples_dir, "benign_call.wav"), benign_audio) # backwards compatibility
    print("Generated: samples/benign_conversation.wav")
    
    # 2. Financial Scam Script (Genuine Human Voice + Coercive Scam Dialogue)
    # Crucial demo of Layer 2 independent protection!
    scam_audio = generate_speech_audio(duration=16.8, is_synthetic=False, urgency_cadence=True, base_f0=175.0)
    save_wav(os.path.join(samples_dir, "financial_scam_script.wav"), scam_audio)
    print("Generated: samples/financial_scam_script.wav")
    
    # 3. Synthetic Speech Sample (AI Cloned Voice + Urgency Scam)
    clone_audio = generate_speech_audio(duration=17.2, is_synthetic=True, urgency_cadence=True, base_f0=135.0)
    save_wav(os.path.join(samples_dir, "synthetic_speech_sample.wav"), clone_audio)
    save_wav(os.path.join(samples_dir, "ai_clone_scam.wav"), clone_audio) # backwards compatibility
    print("Generated: samples/synthetic_speech_sample.wav")

if __name__ == "__main__":
    generate_all_samples()
