import asyncio
import os
import edge_tts
import numpy as np
import soundfile as sf
from scipy import signal

SCRIPT_TEXT = (
    "Your AI bill doesn't reflect your usage. It reflects your defaults. "
    "Every prompt hitting the same expensive model. "
    "Now, listen to the enhancement. "
    "Outcome Router scores every request in real time, routes to winning models, "
    "and cuts your spend by forty percent. "
    "Route for outcomes at outcomerouter.ai."
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "remotion-video", "public")
os.makedirs(OUTPUT_DIR, exist_ok=True)

RAW_TTS_PATH = os.path.join(OUTPUT_DIR, "raw_voiceover.mp3")
FINAL_WAV_PATH = os.path.join(OUTPUT_DIR, "voiceover_30s_enhanced.wav")
FINAL_MP3_PATH = os.path.join(OUTPUT_DIR, "voiceover_30s_enhanced.mp3")

async def generate_tts():
    print("[1/3] Generating Neural Voiceover via Edge TTS...")
    communicate = edge_tts.Communicate(
        text=SCRIPT_TEXT,
        voice="en-US-ChristopherNeural",
        rate="-2%",
        pitch="+0Hz"
    )
    await communicate.save(RAW_TTS_PATH)
    print("[1/3] Raw TTS saved successfully.")

def process_and_enhance():
    print("[2/3] Loading audio and applying DSP enhancement filters...")
    # Load with soundfile
    data, sr = sf.read(RAW_TTS_PATH)
    if len(data.shape) > 1:
        data = data[:, 0] # mono
    
    samples = data.astype(np.float32)
    max_val = np.max(np.abs(samples))
    if max_val > 0:
        samples = samples / max_val

    # Target 30 seconds exactly
    target_samples = 30 * sr
    if len(samples) < target_samples:
        padded = np.zeros(target_samples, dtype=np.float32)
        padded[:len(samples)] = samples
        samples = padded
    else:
        samples = samples[:target_samples]

    # Split point: 14.2 seconds (Before Enhancement vs After Enhancement)
    split_sample = int(14.2 * sr)

    # 1. BEFORE ENHANCEMENT (0 to 14.2s):
    # Unoptimized, muffled phone/room mic with background hiss
    b, a = signal.butter(4, [380 / (sr/2), 2400 / (sr/2)], btype='band')
    before_part = signal.lfilter(b, a, samples[:split_sample])
    
    # Add gentle room noise to emphasize before state
    noise = np.random.normal(0, 0.012, len(before_part)).astype(np.float32)
    before_part = before_part * 0.75 + noise

    # 2. AFTER ENHANCEMENT (14.2s to 30s):
    # Studio mastered: high-shelf crisp air, low-end vocal warmth, broadcast limiter
    after_part = samples[split_sample:]
    
    b_high, a_high = signal.butter(2, 3800 / (sr/2), btype='high')
    high_presence = signal.lfilter(b_high, a_high, after_part)
    
    b_low, a_low = signal.butter(2, 280 / (sr/2), btype='low')
    warm_body = signal.lfilter(b_low, a_low, after_part)

    after_part_enhanced = after_part * 0.85 + high_presence * 0.22 + warm_body * 0.18
    max_after = np.max(np.abs(after_part_enhanced))
    if max_after > 0:
        after_part_enhanced = after_part_enhanced / max_after * 0.96

    # Combine seamlessly
    combined = np.zeros_like(samples)
    combined[:split_sample] = before_part
    combined[split_sample:] = after_part_enhanced

    # Save to WAV (Remotion Audio natively supports WAV/MP3)
    sf.write(FINAL_WAV_PATH, combined, sr)
    sf.write(FINAL_MP3_PATH, combined, sr) # Soundfile can write mp3 if libsndfile supports it or wav fallback
    print(f"[3/3] Enhanced Voiceover saved: {FINAL_WAV_PATH}")

if __name__ == "__main__":
    asyncio.run(generate_tts())
    process_and_enhance()
