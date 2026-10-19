# Iris Launcher

An Android home-screen launcher rebuilt from scratch with Expo and TypeScript, inspired by [Detent](https://github.com/bjarneo/detent). Single local-first app; no account or backend.

## Release 0.3.0

Personal ARM64 APK releases use the same Android debug signing certificate as 0.2.0; they are not Play Store production-signed builds. Version 0.3.0 uses Android version code 3. Release preparation passed `pnpm check`, Expo dependency compatibility, all 21 Expo Doctor checks, and ARM64 `assembleRelease` and `assembleDebugOptimized` builds. APK metadata and signing-certificate compatibility with 0.2.0 were verified. No Android device was connected during this release preparation, so installation and interactive behavior were not reverified for this APK.

## Universal Android APK

Build the distributable APK with the checked release command, rather than the ARM64-only development command:

```sh
source .local-env.sh # or configure JAVA_HOME and ANDROID_HOME on your machine
pnpm android:release
```

The command regenerates Android configuration, explicitly builds ARMv7, ARM64, x86 and x86_64 into one APK, and verifies native-library completeness for every architecture, 16 KB native ELF/ZIP alignment, and the APK signature before copying it to `dist/iris-launcher-<version>-universal.apk`. It requires JDK 17, the Android SDK, and `unzip`. Generated APKs stay ignored. Existing personal debug signing remains in use; store signing is separate work.

To check a downloaded APK independently:

```sh
pnpm android:verify-apk /absolute/path/to/iris-launcher-universal.apk
```

Universal packaging removes the previous ARM64-only restriction; it does not guarantee installation on every device. The minimum Android version is reported from the built APK. Manufacturer installation policies, available storage, download integrity, and existing installations with another signature still affect installation. Physical-device installation and interactive behavior require device testing.

Verified October 20, 2026: the 0.3.1 universal release build passes all four architecture checks, complete native-library coverage, 16 KB ELF/ZIP alignment, and APK signature verification. APK metadata reports minimum API 24 (Android 7), target API 36, and version code 4. TypeScript, lint, all six test files, Expo dependency compatibility, and all 21 Expo Doctor checks pass. The previous ARM64-only APK is rejected by the new verifier. No Android device was connected, so installation and interactive behavior remain unverified for this build.

The all-architecture `assembleDebugOptimized` build also passes. The universal release retains the same signing certificate as 0.3.0 for upgrade compatibility.

## Stack

Node 24.22.0 LTS, pnpm 12.9.1, Expo SDK 57, React Native 0.86.3 and JDK 17. Expo SDK 58 currently selects React Native 0.88 / Android SDK 37, which was unavailable from the Android SDK manager on this machine. SDK 57 uses the available SDK 36 and Build Tools 36.0.0, NDK 27.1.12297006, CMake 3.22.1.

**Use an Expo development build, not Expo Go.** Installed-app discovery, HOME registration and the local sound module require native Android code. JavaScript changes support Fast Refresh after the first development build; native/config changes require rebuilding. `pnpm android` uses Android’s `debugOptimized` development variant so native animation code is optimized while Metro and Fast Refresh remain enabled.

## First baseline

- Rotating app-name dial, drag/flick and reference inertial settling; tap another app to select, selected app to launch.
- Search installed apps, add/remove favorites, and an intentionally empty dial until apps are chosen.
- Inline letter dial by holding an unselected app and sliding/releasing; selected-app long press offers app info and removal.
- All 27 Detent themes with original palettes, bundled wallpapers/tinted artwork, light/dark status-bar contrast, left/right placement and five dial layouts.
- Preloaded dial click and Expo Android haptics, with independent switches. Sound respects silent/vibrate mode and works when Android touch sounds are disabled.
- Detent-style clock/date with no home header; hold empty space for settings. Clock shortcut, saved preferences, first-run settings and default-home selection.
- Categorized settings screens with shared sections, rows, choice chips, previews and validated preference migrations.
- Scheduled day/night themes, independent wallpaper effects (dimming, blur, tint and grain), accessibility controls and launch motion preferences.
- Configurable launcher gestures: swipe up on the clock or double tap it to open search, with the existing long-press settings action preserved.
- App organization with hidden apps, custom labels, local categories, favorites, ordering, recent-app ranking and presentation icon styles.
- Dynamic app shortcuts appear in the long-press menu when Android grants Iris launcher shortcut host access; unsupported apps simply omit the section.
- Private on-device backup and restore, plus battery/network context on the home surface where Android exposes it.
- Optional notification dots backed by package-level notification access; Iris never stores notification text.
- Optional contextual cards for the next alarm and calendar event. Calendar access is requested only when enabled; missing permission or data leaves the launcher usable.
- Optional local media controls for the active Android media session; playback metadata stays on-device and controls appear only when notification access is enabled.
- Refresh on foreground, package installation and removal; user-visible load/save/launch errors.

Platform-dependent roadmap items remain isolated for later milestones: lock-screen wallpaper integration, hardware keyboard controls, and weather adapters. Portable JSON preference export/import is available through Android's system document picker; custom wallpaper binaries remain private to the device. Notification dots, calendar/alarm context, media controls, and dynamic app shortcuts are implemented as optional native adapters; they require platform access and degrade cleanly when unavailable. See [architecture and phases](docs/ARCHITECTURE.md).

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

`plugins/withAndroidHome.js` registers MAIN/HOME/DEFAULT on MainActivity and preserves singleTask behavior across clean prebuilds. `react-native-launcher-kit` handles app discovery and launching. `modules/dial-feedback` is a local Expo module for low-latency Android dial clicks; `modules/notification-indicators` provides package-level notification dots through an opt-in `NotificationListenerService`; `modules/contextual-info` reads the next alarm and calendar event through explicit Android APIs; `modules/launcher-shortcuts` queries and starts Android app shortcuts through the launcher host API; and `modules/media-controls` reads and controls the active Android media session through the same opt-in notification access boundary. Expo autolinking discovers these modules automatically.

`pnpm check` runs TypeScript, ESLint and Node tests covering catalog behavior, reference geometry, hold rebasing, motion, system clock formatting, wallpaper validation, and theme completeness. Native behavior, sound, haptics, gesture feel and default-home lifecycle require phone testing. Never infer those from unit tests.

Generated native projects, SDK paths, dependencies and signing credentials remain ignored. Development builds include network access for Metro; launcher features do not upload app data.

## Verified on October 19, 2026

- `pnpm check`: TypeScript, lint, and all six tests pass.
- Expo dependency check passes; Expo Doctor passes all 21 checks.
- Clean Android prebuild preserves HOME/DEFAULT, singleTask and package-query permission; the sound, notification-indicator and contextual-info modules are autolinked.
- Android production JavaScript export succeeds.
- ARM64 `assembleDebugOptimized` succeeds; the APK installs and launches on the connected vivo V2228.
- Package inspection confirms the notification listener service and `READ_CALENDAR` declaration. Notification access and calendar access remain disabled until the user enables them in Android settings or Iris's contextual settings.
- ADB smoke check confirms `com.irislauncher/.MainActivity` stays foreground with no recent AndroidRuntime, ReactNative, or Expo errors.

Debug APK: `android/app/build/outputs/apk/debugOptimized/app-debugOptimized.apk` (ignored build output). The smoke test verifies installation and startup; interactive feature coverage still belongs to the connected-device development loop.

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


## Themes and clock

Hold empty space (or the clock) to open settings and choose from all 27 Detent themes. The original phone themes include tinted dot-hand artwork; wallpaper themes include the reference readability overlays. The clock follows the phone’s 12/24-hour setting: `7:05` in 12-hour mode or `19:05` in 24-hour mode. It refreshes after returning from Android Settings. Its time/date ink edges align on either side of the screen, with the reference line heights and spacing. Theme assets load locally, with no backend or extra dependency. See [provenance and implementation](docs/DETENT-REFERENCE.md).

Theme/clock verification: eleven tests, TypeScript, lint, Expo dependency compatibility, Android `assembleDebugOptimized`, and Android JavaScript/asset export pass. On vivo V2228, retro-82 wallpaper, catppuccin-latte light theme/status-bar contrast, and dusk tinted art were selected and visually checked; the original ember preference was restored. No GitHub release was created.

After adding the theme canvas and clock, a guarded four-swipe development replay on the same vivo recorded 12.62% janky frames / 15 ms p95 (103 frames), passing the 15% guard. This remains a development measurement.

System clock preference verified on vivo V2228: switching Android Settings to 12-hour showed `7:50`; switching to 24-hour showed `19:50` after returning to Iris. The original 12-hour phone setting was restored. The rebuilt development client includes SDK-compatible `expo-localization` for the native preference; no Iris-specific hour-cycle override is stored.
