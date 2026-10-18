"""Regenerate the original 25 ms dial sample with Python's standard library."""
from pathlib import Path
import math
import random
import struct
import wave

RATE = 44100
DESTINATION = Path(__file__).resolve().parents[1] / 'modules/dial-feedback/android/src/main/res/raw/iris_click.wav'
noise = random.Random(23)
frames = []
for index in range(int(RATE * 0.025)):
    time = index / RATE
    burst = 0.48 * noise.uniform(-1, 1) * math.exp(-time / 0.0018)
    tone = 0.2 * math.sin(2 * math.pi * 1700 * time) * math.exp(-time / 0.003)
    frames.append(struct.pack('<h', int(32767 * (burst + tone))))
DESTINATION.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(DESTINATION), 'wb') as output:
    output.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    output.writeframes(b''.join(frames))
