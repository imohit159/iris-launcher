# Changelog

## 0.3.0 — 2026-10-19

- Added categorized settings, shared controls, and a focused home-screen composition.
- Added scheduled themes, wallpaper effects, accessibility options, and launch transitions.
- Added hidden apps, custom labels, categories, recent-app ranking, and icon styles.
- Added versioned preference validation and local JSON backup and restore.
- Added optional notification dots, calendar/alarm cards, battery/network status, media controls, and Android app shortcuts.
- Added configurable clock search gestures and preference/schedule regression coverage.

## 0.2.0 — 2026-10-19

- Added the reusable settings, section, separator, wallpaper, dial-layout, and navigation components.
- Added the shared dark design tokens and typography roles used across settings and previews.
- Added the appearance dashboard with wallpaper, theme, and dial previews.
- Added the wallpaper gallery with custom photo selection and independent wallpaper themes.
- Added dial layout badges, live previews, automatic preference saving, and dial-specific controls.
- Added the standard Expo eye icon for the live preview label.
- Hardened preference recovery, optional native sound feedback, custom wallpaper cleanup, and release metadata.
- Verified TypeScript, ESLint, unit tests, Expo dependency compatibility, Expo Doctor, and Android export.

### Planned follow-up

- Extract the shared `SettingRow`, `ChoiceChip`, `ActionButton`, `PreviewCard`, and modal-surface primitives.
- Move preference, installed-app, wallpaper, and panel navigation state into focused hooks.
- Add notification dots and permission flow, dynamic app shortcuts, lock-screen wallpaper, hardware keyboard controls, and launch animation polish.
