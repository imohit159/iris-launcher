"""Replay four dial swipes on the connected phone and report Android frame timing.

Run with Iris's dial visible. Optional --max-jank-percent makes this a device
regression check; compare runs on the same phone, workload and build variant.
"""
import argparse
import json
import re
import subprocess
import uuid

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--max-jank-percent', type=float)
args = parser.parse_args()


def adb(*arguments):
    return subprocess.check_output(['adb', *arguments], text=True)


capture = f'/sdcard/iris-dial-profile-{uuid.uuid4().hex}.xml'
try:
    adb('shell', 'uiautomator', 'dump', capture)
    ui = adb('shell', 'cat', capture)
finally:
    adb('shell', 'rm', '-f', capture)
if 'App dial' not in ui:
    raise SystemExit('Open the Iris dial before profiling; another screen would invalidate the result.')
size = re.findall(r'(\d+)x(\d+)', adb('shell', 'wm', 'size'))[-1]
width, height = map(int, size)
x, start, end = int(width * 820 / 1080), int(height * 1600 / 2404), int(height * 850 / 2404)
swipes = '; '.join(f'input swipe {x} {a} {x} {b} 400' for a, b in [(start, end), (end, start)] * 2)
adb('shell', 'dumpsys', 'gfxinfo', 'com.irislauncher', 'reset')
adb('shell', swipes)
report = adb('shell', 'dumpsys', 'gfxinfo', 'com.irislauncher')
frames = int(re.search(r'Total frames rendered: (\d+)', report)[1])
jank = float(re.search(r'Janky frames: \d+ \(([\d.]+)%\)', report)[1])
p95 = int(re.search(r'95th percentile: (\d+)ms', report)[1])
if frames < 20:
    raise SystemExit('Too few rendered frames to assess movement; wait for the dial to load and retry.')
print(json.dumps({'frames': frames, 'jankyPercent': jank, 'p95Milliseconds': p95}))
if args.max_jank_percent is not None and jank > args.max_jank_percent:
    raise SystemExit(f'Janky frames exceeded {args.max_jank_percent}%')
