# Iris Launcher full feature roadmap

- Created: 2026-10-19
- Status: active implementation
- Mode: repository
- Depth: deep

## Outcome

Turn Iris into a polished personal Android launcher with a Detent-style home surface, a modular customization system, contextual information, power-user interactions, and local backup/accessibility controls. The feature set must be organized across focused screens and modules; the root settings screen is a category index, not a catalogue of every control.

## Problem Frame

The current app has the dial, themes, wallpapers, search, favorites, and dial settings, but most launcher-roadmap capabilities are not represented in the domain model or information architecture. `App.tsx` remains the composition root and owns too much state wiring. New capabilities need explicit boundaries before they are added so presentation, persisted preferences, Android adapters, and domain behavior do not become coupled.

## Scope

### Included

- Multi-screen settings information architecture with shared section, row, choice, preview, and modal primitives.
- Theme presets covering palette, wallpaper, dial, typography, icon presentation, sound, haptics, and motion.
- Search, app discovery, favorites, hidden apps, labels, ordering, and recently used apps.
- Gestures, launch/return motion, notification indicators where Android permissions allow them, and long-press shortcuts.
- Contextual home information: battery, network, weather, calendar, alarms, and media where the platform API is available.
- Wallpaper effects, custom wallpaper, scheduled day/night themes, accessibility, privacy, and local backup/restore.
- Unit, type, lint, export, Android build, and connected-device verification for each shipped slice.

### Excluded

- Root access, OEM/system icon replacement, system-wide font replacement, lock-screen ownership, or modifying other apps.
- A backend, account system, analytics, paid cloud build service, or store deployment requirement.
- A single giant settings screen containing every future capability.

## Evidence Reviewed

- [docs/ARCHITECTURE.md](../ARCHITECTURE.md)
- [docs/DETENT-REFERENCE.md](../DETENT-REFERENCE.md)
- [AGENTS.md](../../AGENTS.md)
- [App.tsx](../../App.tsx)
- [src/preferences.ts](../../src/preferences.ts)
- [src/components/SettingsPanel.tsx](../../src/components/SettingsPanel.tsx)
- [src/components/Dial.tsx](../../src/components/Dial.tsx)
- [src/launcher/android.ts](../../src/launcher/android.ts)

## Requirements

- R1: Keep app integration behind `src/launcher` and persisted state behind `src/preferences`.
- R2: Keep App.tsx as a composition root; feature screens, hooks, services, and reusable controls live under `src/`.
- R3: Make settings navigable by categories and child screens with consistent design tokens and vertical rhythm.
- R4: Persist and validate all user customization, with safe defaults and migrations.
- R5: Reuse the production dial and preview components instead of maintaining approximations.
- R6: Implement only platform capabilities available to a normal Android launcher and explain permission-dependent features in context.
- R7: Preserve Detent geometry and interaction invariants for reference-derived dial behavior.
- R8: Verify each feature slice with focused tests and project checks before release.

## Known Facts

- Expo SDK 57 and React Native 0.86.3 are pinned in [package.json](../../package.json).
- The app already supports 27 themes, custom wallpaper storage, five dial layouts, favorites, search, default-home setup, sound, haptics, and an Android package catalog.
- Native launcher and app-detail operations are isolated in [src/launcher/android.ts](../../src/launcher/android.ts).
- `Preferences` is currently serialized as one AsyncStorage record in [src/preferences.ts](../../src/preferences.ts).
- The last release is `v0.2.0`; current transparency work is uncommitted and must not be silently released.

## Assumptions

- A local-first architecture remains the product constraint.
- Notification counts and weather may require optional permissions or network access; their absence must degrade gracefully.
- “Custom icons” and “custom fonts” mean Iris presentation inside the launcher. Android cannot replace another app’s icon or the system font without OEM/root privileges.

## Decisions

- D1: Use a feature-oriented modular monolith under `src/features` only where a capability has its own state, service, and screen; keep existing cohesive `src/components`, `src/launcher`, `src/themes`, and `src/dial` boundaries.
- D2: Build the settings navigation shell before adding broad options. A category index routes to Appearance, Behavior, Information, Accessibility, Privacy, and Backup screens.
- D3: Model finite choices as typed domain values and centralize them with the preferences schema; never scatter string or numeric magic values through JSX.
- D4: Treat Android integrations as optional adapters with capability states (`available`, `needs-permission`, `unavailable`, `error`) so the home surface remains usable without them.

## Work Units

### Current implementation status

- W1–W4: implemented in the current working tree (settings navigation, validated preferences, theme/wallpaper controls, and app organization).
- W5: mostly implemented. Detent dial gestures, reduced-motion behavior, launch transitions, configurable clock search gestures, long-press actions, and optional Android app shortcuts ship. Hardware-keyboard and system-level gestures remain platform work.
- W6: partially implemented. Battery/network status already ships; calendar, next-alarm and media-session adapters are available behind Information settings. Weather remains provider-dependent.
- W7: partially implemented. Package-level notification dots and the privacy/permission explanation are available behind Android notification access. Counts and notification text are intentionally excluded.
- W8: partially implemented. Private local backup, portable JSON file export/import, accessibility controls, migration tests, clean prebuild, optimized Android build, and connected-device smoke checks are complete for this iteration. Release signing remains separate work; custom wallpaper binaries remain device-local.

### W1 — Settings architecture and shared primitives

Produces the category index, child-screen navigation, shared setting rows/choices/previews, and focused preference/navigation hooks. Depends on the current settings panel. Covers R1–R4. Boundary: no new platform integrations. Verification: settings navigation, hardware back, persistence, typecheck, lint, tests.

### W2 — Preference schema and migrations

Produces versioned preferences, migration tests, and domain values for appearance, behavior, information, accessibility, privacy, backup, and recents. Depends on W1. Covers R3–R4. Verification: old records migrate; malformed records fall back safely.

### W3 — Theme and wallpaper engine

Produces theme presets with typography/icon presentation, scheduled day/night selection, wallpaper dim/blur/tint/grain controls, and independent wallpaper state. Depends on W2. Covers R3–R6. Verification: preview equals home rendering; custom wallpaper cleanup; schedule boundaries; no theme mutation from wallpaper selection.

### W4 — App discovery and organization

Produces hidden apps, custom labels, ordering, recents, categories, and a reusable app-list/search surface. Depends on W2 and the launcher adapter. Covers R1, R3, R4, R6. Verification: hidden apps never launch from visible surfaces; labels/order persist; removed packages recover.

### W5 — Interaction and launch polish

Produces configurable gestures, reduced-motion behavior, launch/return transitions, and expanded long-press shortcuts. Depends on W1, W2, and the existing dial physics. Covers R5–R8. Verification: dial gesture invariants remain unchanged; reduced-motion removes settling animation; shortcuts degrade gracefully.

### W6 — Contextual information adapters

Produces battery/network/time-zone/calendar/alarm/weather/media cards and their capability states. Depends on W1–W2. Covers R3, R6, R8. Verification: permissions denied/offline/no-data states remain readable and do not block launcher startup.

### W7 — Indicators and privacy controls

Produces notification-dot/count adapters, notification permission explanation, no-analytics statement, hidden-app/privacy controls, and accessibility labels. Depends on W4 and W6. Covers R3, R6, R8. Verification: no notification data is logged; disabled access removes indicators cleanly.

### W8 — Backup, restore, accessibility, and release hardening

Produces local export/import of preferences and wallpaper metadata, larger text/high contrast/reduced motion controls, validation, migration tests, and release documentation. Depends on W2–W7. Covers R3–R8. Verification: round-trip restore, invalid-file rejection, Android export/build, connected-device smoke test.

## Dependencies and Risks

- Native package availability must be checked with Expo’s compatibility tooling before installation.
- Notification access, calendar, media, weather, and device status each have independent permission or platform failure modes.
- App icon assets and custom fonts can increase memory and APK size; previews must remain bounded and lazy.
- Existing `App.tsx` state wiring is a refactor risk; each extraction must preserve current dial behavior and settings back navigation.

## Open Questions

- Whether weather should be online via a user-selected provider or remain an explicit optional integration.
- Which contextual cards BOSS wants visible by default on the home surface.
- Portable backup uses Android’s system document picker; custom wallpaper binary export remains an explicit future decision.

## Definition of Done

- Every included feature has a focused screen/module and is reachable through categorized settings.
- Preferences are versioned, validated, migrated, and covered by tests.
- The dial remains reference-faithful and uses one production renderer for home and previews.
- Optional Android integrations expose clear capability states and never block startup.
- `pnpm check`, Expo compatibility checks, export, clean prebuild, Android build, and connected-device smoke tests are recorded for the release.
