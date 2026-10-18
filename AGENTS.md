# Iris Launcher

Address the user as BOSS. This is a fresh Android launcher built with Expo and TypeScript.

- Read docs/ARCHITECTURE.md before architectural changes. Keep launcher integration behind src/launcher.
- Use pnpm and official Expo generators/installers. Expo chooses compatible React Native versions; do not upgrade React Native independently.
- Use an Expo development build. Expo Go cannot run the launcher integration.
- Native manifest changes belong in config plugins so clean prebuild preserves them.
- Verify with pnpm check, Expo dependency checks, and an Android debug build when tools are available. State device-verification limits.
- Do not commit or push unless BOSS explicitly requests it for that step. Never force-push.
- Never commit dependencies, generated native build outputs, local SDK paths, credentials, or signing keys.

## Component and module boundaries

- Keep every component and module focused on one responsibility. Prefer small, reusable components with typed props over growing screen files.
- Treat `App.tsx` as the composition root and application coordinator. It may wire navigation, preferences, native services, and callbacks, but substantial screen JSX, reusable controls, styles, and domain logic belong in focused files under `src/`.
- Before adding a new block of JSX to `App.tsx`, identify whether it is a reusable component, screen, hook, service, or design token. Extract it when it has its own responsibility or can be tested independently.
- Keep presentation separate from persistence and Android integration. Components receive data and callbacks; `src/preferences`, `src/launcher`, and other infrastructure modules own storage and native APIs.
- Reuse one implementation for a visual or interaction pattern. Do not create a second mock or approximate implementation when the production component can support a preview or read-only mode.
- Keep styles and constants close to the component they serve, and promote genuinely shared values into an explicit design-system module instead of scattering magic numbers through screens.

- Before dial or reference-derived home UI changes, inspect the local `/home/imohit/Projects/detent` clone and read docs/DETENT-REFERENCE.md. Match its geometry and interactions; record the reference commit and retain third-party licenses.
