# Local Detent reference

BOSS requested matching the dial and compact home search in the local clone at `/home/imohit/Projects/detent`. Inspect this clone before changing reference-derived interactions or geometry; do not substitute remembered screenshots or an unrelated online implementation.

Port baseline: `10fc0c4e8636a2e7f272b7f31c10a972fff4d2f4` from https://github.com/bjarneo/detent. Do not update that clone automatically. Record its commit again when intentionally adopting newer behavior.

| Local Kotlin source under `app/src/main/java/app/detent/launcher/` | Expo implementation |
| --- | --- |
| `Model.kt`: 412-unit design coordinates, radius, spacing, label pose, five layouts | `src/dial/reference.ts` |
| `ui/Dial.kt`: marks, mirrored labels, emphasis and fixed pawl | `src/dial/draw.ts` |
| `LauncherState.kt`: circular movement, velocity decay, settling, hold zones and letter scrub | `src/dial/physics.ts`, `src/dial/motion.ts`, `src/components/Dial.tsx` |
| `ui/Home.kt`, `ui/Kit.kt`: compact search dimensions/position and typography | `App.tsx`, `assets/fonts/` |

The reference is native Kotlin/Compose; Iris remains Expo/React Native. Skia records the dial on the UI thread and Reanimated drives continuous motion without React rendering every frame. Only selection/feedback and gesture-mode transitions cross to JavaScript. Gesture closures carry names, not base64 app icons. Accessibility exposes the canvas as an adjustable dial with previous/next, activate and long-press actions.

Hold an unselected dial row for 500 ms to enter the inline letter dial; slide and release to select the first app under that letter. A stationary letter hold can therefore select an earlier app with the same initial: this is deliberate reference behavior. Holding the selected app opens its menu; holding empty space opens settings. Rebase cumulative pan translation at the app/letter coordinate transition; cancelled recognizers must not independently snap the same gesture. Do not replace this with a separate alphabet modal.

Five reference layouts are selectable in settings. JetBrains Mono regular, medium and light are copied from the reference's `res/font`; app labels preserve case and use the reference truncation. The search pill sits opposite the dial and disappears during scrubbing. The home header is omitted as in Detent. The clock uses its opposite-side placement, 68-unit light mono typography and compact date. Iris's palettes and app-management screens remain its own UI. Notifications, app shortcuts, launch transitions and wallpapers are separate parity work.

The port retains Detent's MIT notice and JetBrains Mono's OFL in `licenses/notices.json`. Both are bundled and readable from Settings → Open-source licenses.

Expo guidance used: [official Expo overview skill](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-overview) and [Expo animation skill](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-animation). Keep the pinned Expo/RN versions and select native packages with `expo install`. Use reduced motion to disable inertial/settling animations when requested by the OS.
