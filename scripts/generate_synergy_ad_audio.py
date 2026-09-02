import asyncio
import os
import edge_tts
import numpy as np
import soundfile as sf
from scipy import signal

SCRIPT_TEXT = (
    "Sotuv menejeri kerak! Synergy kompaniyasining kuchli jamoasiga faol va intiluvchan sotuv menejeri qidirilmoqda. "
    "Rasmiy ish o'rni, cheksiz KPI bonuslar, zamonaviy ofis va kasbiy rivojlanish. "
    "Oylik maosh: uch million so'm plyus yuqori KPI. "
    "Hoziroq jamoamizga qo'shiling!"
)

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "remotion-video", "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)

RAW_TTS = os.path.join(PUBLIC_DIR, "synergy_tts_raw.mp3")
FINAL_AUDIO = os.path.join(PUBLIC_DIR, "synergy_ad_audio.wav")
FINAL_AUDIO_MP3 = os.path.join(PUBLIC_DIR, "synergy_ad_audio.mp3")

async def generate_tts():
    print("[1/3] Generating Uzbek Neural Voiceover (uz-UZ-SardorNeural)...")
    comm = edge_tts.Communicate(
        text=SCRIPT_TEXT,
        voice="uz-UZ-SardorNeural",
        rate="+4%",
        pitch="+0Hz"
    )
    await comm.save(RAW_TTS)
    print("[1/3] Voiceover generated successfully.")

def build_soundtrack_and_mix():
    print("[2/3] Synthesizing dynamic motion sound effects & ambient cyber-corporate bed...")
    # Load voiceover
    voice, sr = sf.read(RAW_TTS)
    if len(voice.shape) > 1:
        voice = voice[:, 0]
    voice = voice.astype(np.float32)
    max_v = np.max(np.abs(voice))
    if max_v > 0:
        voice = voice / max_v

    # Video duration: 15 seconds (450 frames @ 30fps)
    target_samples = int(15.0 * sr)
    t = np.linspace(0, 15.0, target_samples, endpoint=False)

    # 1. Warm Synth Sub Bass Drone (E minor / 82Hz + 41Hz)
    sub = 0.12 * np.sin(2 * np.pi * 82.4 * t) * (1 + 0.3 * np.sin(2 * np.pi * 0.5 * t))
    sub += 0.08 * np.sin(2 * np.pi * 41.2 * t)

    # 2. Modern rhythmic electronic pulsing filter sweep (every 0.5s / 120 BPM)
    beat_clock = np.mod(t, 0.5)
    pluck_env = np.exp(-beat_clock * 12.0)
    pulse = 0.09 * pluck_env * np.sin(2 * np.pi * 329.6 * t)

    # 3. Cinematic Impact / Whoosh Riser at t=0s, t=4.5s, t=9.5s
    sfx = np.zeros_like(t)
    
    # Impact at t=0.2s
    imp_mask = (t >= 0.1) & (t <= 2.0)
    imp_t = t[imp_mask] - 0.1
    sfx[imp_mask] += 0.35 * np.exp(-imp_t * 4.0) * np.sin(2 * np.pi * 60 * np.exp(-imp_t * 2))

    # Whoosh at t=4.0s
    whoosh_mask = (t >= 3.8) & (t <= 5.0)
    wt = t[whoosh_mask] - 3.8
    noise = np.random.normal(0, 1, len(wt)).astype(np.float32)
    b, a = signal.butter(2, [800 / (sr/2), 4000 / (sr/2)], btype='band')
    filtered_noise = signal.lfilter(b, a, noise)
    sfx[whoosh_mask] += 0.18 * np.sin(np.pi * wt / 1.2) * filtered_noise

    # Glint / Sparkle chime at t=11.0s (Synergy reveal)
    chime_mask = (t >= 10.5) & (t <= 14.5)
    ct = t[chime_mask] - 10.5
    sfx[chime_mask] += 0.06 * np.exp(-ct * 0.8) * (np.sin(2 * np.pi * 1318.5 * ct) + np.sin(2 * np.pi * 1975.5 * ct))

    # Master background track
    bed = sub + pulse + sfx
    # Gentle sidechain ducking when voice is active
    voice_track = np.zeros(target_samples, dtype=np.float32)
    voice_len = min(len(voice), target_samples)
    voice_track[:voice_len] = voice[:voice_len]

    # Voice EQ & broadcast compression
    b_high, a_high = signal.butter(2, 3200 / (sr/2), btype='high')
    crisp = signal.lfilter(b_high, a_high, voice_track)
    b_body, a_body = signal.butter(2, 300 / (sr/2), btype='low')
    warm = signal.lfilter(b_body, a_body, voice_track)
    voice_master = voice_track * 0.8 + crisp * 0.25 + warm * 0.15

    # Ducking envelope
    smooth_window = int(0.15 * sr)
    voice_energy = np.convolve(np.abs(voice_master), np.ones(smooth_window)/smooth_window, mode='same')
    ducking = 1.0 - np.clip(voice_energy * 2.2, 0, 0.55)

    final_mix = bed * ducking + voice_master * 0.95
    max_m = np.max(np.abs(final_mix))
    if max_m > 0:
        final_mix = final_mix / max_m * 0.96

    sf.write(FINAL_AUDIO, final_mix, sr)
    sf.write(FINAL_AUDIO_MP3, final_mix, sr)
    print(f"[3/3] Mastered motion soundtrack saved: {FINAL_AUDIO}")

if __name__ == "__main__":
    asyncio.run(generate_tts())
    build_soundtrack_and_mix()
