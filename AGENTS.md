# Iris Launcher

Address the user as BOSS. This is a fresh Android launcher built with Expo and TypeScript.

- Read docs/ARCHITECTURE.md before architectural changes. Keep launcher integration behind src/launcher.
- Use pnpm and official Expo generators/installers. Expo chooses compatible React Native versions; do not upgrade React Native independently.
- Use an Expo development build. Expo Go cannot run the launcher integration.
- Native manifest changes belong in config plugins so clean prebuild preserves them.
- Verify with pnpm check, Expo dependency checks, and an Android debug build when tools are available. State device-verification limits.
- Commit and push verified milestones to the configured remote without force-pushing.
- Never commit dependencies, generated native build outputs, local SDK paths, credentials, or signing keys.
