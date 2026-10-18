# Iris Launcher — Expo rebuild

## Requirements

Android home-screen launcher inspired by https://github.com/bjarneo/detent. Establish the rotating dial baseline before personal additions. List and open installed apps, choose favorites, search, alphabet navigation, feedback, themes, and default-home setup. Preferences survive process death; installed apps refresh after returning home. Handle unavailable apps and storage errors. No account, server, analytics, or subscription.

## Assumptions

Android is the only launch target. BOSS approved a single local-first Expo application. Node 24 LTS is the development runtime. Work profiles and private-space apps require later dedicated Android support.

## Architecture options and recommendation

Expo Go cannot host launcher native APIs. Use Expo with a custom development client and generated Android project (Continuous Native Generation). A bare React Native project is viable but was explicitly replaced by BOSS. Keep native integration behind an adapter; use launcher-kit before writing custom launcher native APIs.

## Technology decisions and boundaries

Official blank TypeScript Expo template, SDK 57 / React Native 0.86.3 (SDK 58 requires unavailable Android platform 37); pnpm; Expo-compatible dependencies selected by expo install. src/launcher owns Android catalog and launching; src/preferences owns validated persisted preferences; src/components owns dial interaction; App orchestrates presentation. plugins/withAndroidHome.js owns the HOME intent so clean prebuild preserves it. A small local Expo module owns preloaded SoundPool dial-click feedback, which available launcher APIs do not provide.

## Data flow and API strategy

Android package catalog → normalize/deduplicate → user favorites/search → dial → validated launch. AsyncStorage → validated preferences → UI; serialize preference writes. No network API, tRPC, REST, database, auth provider, workspace, or monorepo.

## Background processing and deployment

No queues or background workers. Refresh on foreground and package events; no periodic polling. Local Android development build, Metro over adb reverse. Development internet permission supports Metro; no application data is uploaded. No paid cloud build requirement. Release signing is separate from debug builds.

## Observability and security

Show actionable catalog, persistence, launch and permission errors. Keep notification text and credentials out of logs. Query packages only for launcher functionality. Only set Iris as home after a user action. Sound respects ringer mode. Optional future notification access must be explained at point of use.

## Performance and scale

No backend scaling requirement. Use debugOptimized development builds to avoid native debug overhead; enable Reanimated’s Android synchronous UI-prop fast path and use Gesture Handler press targets for transformed rows. Run dial gestures, geometry and spring animation on the UI thread with Gesture Handler and Reanimated; render a batched window of nearby entries, virtualize search results, keep animation/gesture work bounded, cache the installed catalog until foreground/package updates. Test scrolling and app catalog behavior on a real phone; simulator mocks cannot prove native correctness.

## Phases

1. Fresh Expo scaffold and reproducible native HOME configuration.
2. Dial, search, favorites, alphabet navigation, themes, sound/haptics and setup.
3. Device verification, then complete parity: notification dots, dynamic app shortcuts, five dial shapes, wallpaper picker/lock-screen integration, keyboard navigation and motion polish.
4. BOSS-directed additions.

## Verification

Use pnpm check, expo install --check, expo-doctor, clean Android prebuild and the generated Gradle wrapper. Record actual results in README; native behavior requires a connected Android phone.
