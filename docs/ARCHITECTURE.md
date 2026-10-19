# Iris Launcher — Expo rebuild

## Requirements

Android home-screen launcher inspired by https://github.com/bjarneo/detent. Establish the rotating dial baseline before personal additions. List and open installed apps, choose favorites, search, alphabet navigation, feedback, themes, and default-home setup. Preferences survive process death; installed apps refresh after returning home. Handle unavailable apps and storage errors. No account, server, analytics, or subscription.

## Assumptions

Android is the only launch target. BOSS approved a single local-first Expo application. Node 24 LTS is the development runtime. Work profiles and private-space apps require later dedicated Android support.

## Architecture options and recommendation

Expo Go cannot host launcher native APIs. Use Expo with a custom development client and generated Android project (Continuous Native Generation). A bare React Native project is viable but was explicitly replaced by BOSS. Keep native integration behind an adapter; use launcher-kit before writing custom launcher native APIs.

## Technology decisions and boundaries

Official blank TypeScript Expo template, SDK 57 / React Native 0.86.3 (SDK 58 requires unavailable Android platform 37); pnpm; Expo-compatible dependencies selected by expo install. `src/launcher` owns the Android catalog, launching, notification and shortcut adapters; `src/preferences/schema.ts` owns the versioned, validated domain model; `src/preferences` owns AsyncStorage and private backups; `src/themes` owns reference palettes, artwork and day/night selection; `src/context` owns calendar/alarm and media capability state plus native adapters; `src/notifications` owns notification indicator state; `src/home` owns the home-screen composition; `src/settings` owns screen navigation values; `src/components` owns focused presentation and interaction components; App only owns providers and composition-root wiring. Shared sections, setting rows, choice chips and app icon presentation live in `src/components` and are reused across settings screens. `plugins/withAndroidHome.js` owns the HOME intent so clean prebuild preserves it. Local Expo modules own preloaded SoundPool dial-click feedback, package-level notification access, calendar/alarm reads, Android shortcuts and media controls; each adapter is optional and keeps permission boundaries outside presentation components.

## Data flow and API strategy

Android package catalog → normalize/deduplicate → user favorites/search/categories → dial → validated launch. AsyncStorage → schema parser/migration → validated preferences → UI; serialized writes keep persistence ordered. Optional device adapters expose battery, network, notification, calendar and alarm context without blocking startup. No network API, tRPC, REST, database, auth provider, workspace, or monorepo.

## Background processing and deployment

No queues or background workers. Refresh on foreground and package events; no periodic polling. Local Android development build, Metro over adb reverse. Development internet permission supports Metro; no application data is uploaded. No paid cloud build requirement. Release signing is separate from debug builds.

## Observability and security

Show actionable catalog, persistence, launch and permission errors. Keep notification text and credentials out of logs. Query packages only for launcher functionality. Only set Iris as home after a user action. Sound respects ringer mode. Notification and calendar access are optional, user-triggered, and explained at point of use; the adapters retain only package names and calendar/alarm summary data needed for the current screen.

## Performance and scale

No backend scaling requirement. Use debugOptimized development builds to avoid native debug overhead. Run dial gestures, reference physics and Skia drawing on the UI thread with Gesture Handler and Reanimated; record only nearby labels and markers, virtualize search results, keep animation/gesture work bounded, cache the installed catalog until foreground/package updates. Test scrolling and app catalog behavior on a real phone; simulator mocks cannot prove native correctness.

## Phases

1. Fresh Expo scaffold and reproducible native HOME configuration.
2. Dial, search, favorites, alphabet navigation, themes, sound/haptics and setup.
3. Modular customization: wallpaper effects, scheduled themes, app labels/categories/visibility, accessibility, launch motion and private local backup.
4. Platform adapters: weather, lock-screen and hardware-keyboard integration remain isolated platform work. Portable JSON preference backup is available through Android's document picker; notification dots, calendar/alarm context, media controls and dynamic app shortcuts are already available as opt-in adapters. Launcher-level search gestures are implemented in the home interaction layer.
5. BOSS-directed additions.

## Verification

Use pnpm check, expo install --check, expo-doctor, clean Android prebuild and the generated Gradle wrapper. Record actual results in README; native behavior requires a connected Android phone.

## Reference dial

See [local Detent port](DETENT-REFERENCE.md) for source provenance and gesture invariants. Skia is the native canvas renderer; Expo Font loads matching home search typography. Five layouts and inline letter scrubbing are implemented. Keep animation mathematics in src/dial and Android launching behind src/launcher.
