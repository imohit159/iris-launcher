# Iris Launcher

An Android home-screen launcher rebuilt from scratch with Expo and TypeScript, inspired by [Detent](https://github.com/bjarneo/detent). Single local-first app; no account or backend.

## Stack

Node 24.22.0 LTS, pnpm 12.9.1, Expo SDK 57, React Native 0.86.3 and JDK 17. Expo SDK 58 currently selects React Native 0.88 / Android SDK 37, which was unavailable from the Android SDK manager on this machine. SDK 57 uses the available SDK 36 and Build Tools 36.0.0, NDK 27.1.12297006, CMake 3.22.1.

**Use an Expo development build, not Expo Go.** Installed-app discovery, HOME registration and the local sound module require native Android code. JavaScript changes support Fast Refresh after the first development build; native/config changes require rebuilding. `pnpm android` uses Android’s `debugOptimized` development variant so native animation code is optimized while Metro and Fast Refresh remain enabled.

## First baseline

- Rotating app-name dial, drag/flick and reference inertial settling; tap another app to select, selected app to launch.
- Search installed apps, add/remove favorites, and an intentionally empty dial until apps are chosen.
- Inline letter dial by holding an unselected app and sliding/releasing; selected-app long press offers app info and removal.
- Dusk, ember, signal and paper palettes; left/right placement and five reference dial layouts.
- Preloaded dial click and Expo Android haptics, with independent switches. Sound respects silent/vibrate mode and works when Android touch sounds are disabled.
- Clock/date, clock shortcut, saved preferences, first-run settings and default-home selection.
- Refresh on foreground, package installation and removal; user-visible load/save/launch errors.

This is the first Expo baseline, not complete Detent parity. Still to implement: notification dots and permission flow, dynamic app shortcuts, theme wallpapers and custom photos, lock-screen wallpaper, hardware keyboard controls, launch animation polish. See [architecture and phases](docs/ARCHITECTURE.md).

## Develop on this machine

```sh
cd /home/imohit/Projects/iris-launcher
mise trust
source .local-env.sh
pnpm install --frozen-lockfile
pnpm check
```

The ignored `.local-env.sh` contains only this machine's JDK and Android SDK paths. On another machine, configure `JAVA_HOME`, `ANDROID_HOME` and add Java, platform-tools and SDK command-line tools to PATH yourself.

Enable USB debugging on your phone, connect USB and accept its authorization prompt. Check:

```sh
adb devices
adb reverse tcp:8081 tcp:8081
```

Start Metro in terminal one:

```sh
pnpm start --localhost
```

Leave it running. In terminal two (source `.local-env.sh` there too):

```sh
pnpm android --device --no-bundler
```

Choose the phone if prompted. Open Iris's development client and connect to Metro if it does not connect automatically. Add favorites from search, then use settings to choose Iris as your home app. To switch back: Android Settings → Apps → Default apps → Home app.

If an older Iris APK is installed with another signing certificate, Android may reject the install. Switching certificates requires uninstalling the old APK and clears its data; do this deliberately on the phone.

## Native generation and verification

```sh
pnpm exec expo install --check
pnpm dlx expo-doctor
pnpm exec expo prebuild --platform android --clean --no-install
cd android
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a --max-workers=2
```

`plugins/withAndroidHome.js` registers MAIN/HOME/DEFAULT on MainActivity and preserves singleTask behavior across clean prebuilds. `react-native-launcher-kit` handles app discovery and launching. `modules/dial-feedback` is a local Expo module for low-latency Android dial clicks; Expo autolinking discovers it automatically.

`pnpm check` runs TypeScript, ESLint and eight Node tests covering catalog behavior, reference geometry, hold rebasing and motion. Native behavior, sound, haptics, gesture feel and default-home lifecycle require phone testing. Never infer those from unit tests.

Generated native projects, SDK paths, dependencies and signing credentials remain ignored. Development builds include network access for Metro; launcher features do not upload app data.

## Verified on October 18, 2026

- `pnpm check`: TypeScript, lint, and all four tests pass.
- Expo dependency check passes; Expo Doctor passes all 21 checks.
- Clean Android prebuild preserves HOME/DEFAULT, singleTask and package-query permission; the local sound module is autolinked.
- Android production JavaScript export succeeds.
- ARM64 `assembleDebug` succeeds; APK signature and packaged HOME registration verified.

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk` (ignored build output). No Android phone was connected during verification; physical-device behavior remains unverified.

Initial Maven downloads hit TLS errors and stalled requests. The successful build used `-Dorg.gradle.internal.http.connectionTimeout=15000 -Dorg.gradle.internal.http.socketTimeout=15000`; repeat with these flags if dependency downloads stall. TLS certificate verification stays enabled.

## Dial regression checks

The dial uses UI-thread Gesture Handler/Reanimated motion and a Skia canvas matching the local Detent reference. Memoized gestures survive React rerenders; hold transitions rebase the drag origin. See [source mapping and licenses](docs/DETENT-REFERENCE.md). The rationale follows [Reanimated's performance guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/).

The bundled click is original PCM audio, preloaded asynchronously by SoundPool. Iris's sound preference and ringer mode control playback; Android's touch-sounds preference does not. Regenerate the sample with `python scripts/generate-dial-click.py` if changing the sound.

October 18, 2026, vivo V2228: original debug replay showed 29.51% janky frames. The optimized development client measured 11.58%, then 8.08% on two guarded four-swipe replays (95th percentile 22 ms). These are development-device samples, not a guarantee across devices. Plain unoptimized Reanimated debug builds remained slower; use the default optimized development command. The sound sample was observed starting real Android AudioTracks with system touch sounds disabled.

With the phone connected, Metro running, and Iris's dial visible:

```sh
source .local-env.sh
python scripts/profile-dial.py --max-jank-percent 25
```

The check rejects another screen or too few rendered frames; compare measurements on the same phone and build variant. The 25% threshold is a tolerant regression check for this phone, not a target for release performance. Native build verification also passed for `assembleDebugOptimized`; APK path: `android/app/build/outputs/apk/debugOptimized/app-debugOptimized.apk`.


## Reference dial verification — October 18, 2026

The local Detent port adds its five layouts, JetBrains Mono fonts, exact design-coordinate geometry, circular wrapping, velocity decay/settling, inline letter scrubbing, and compact home search. Holding empty space opens settings. A letter scrub commits the first app of the chosen letter, as in Detent.

`pnpm check` passes all eight tests; Expo dependency compatibility passes; ARM64 `assembleDebugOptimized` succeeds. Installed on vivo V2228 through USB with Metro. The initial four-swipe replay measured 5.94% janky frames / 14 ms p95 (101 frames); this is a development-build sample, not release performance certification. On-device screenshots confirm the app/letter modes and compact search. Device interaction checks also pass for stationary letter-hold release, repeated hold stability, selected-app menu without accidental launch, and opening app search. All five layouts rendered on the phone; the original soft/double preference was restored. No GitHub release was created.
