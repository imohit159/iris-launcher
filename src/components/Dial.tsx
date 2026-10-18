import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Canvas, Picture, Skia, useFont } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { App } from "../launcher/catalog";
import type { Theme } from "../preferences";
import {
  DESIGN,
  displayName,
  initial,
  layouts,
  geometry,
  mod,
  rowAt,
  dragPosition,
  scrubTarget,
  zoneAt,
} from "../dial/reference";
import { withDialMotion, withPawl } from "../dial/motion";
import { drawDial } from "../dial/draw";

type Props = {
  apps: App[];
  theme: Theme;
  left: boolean;
  layout?: number;
  onLaunch(app: App): void;
  onMenu(app: App): void;
  onSettings(): void;
  onTick(): void;
  onScrubChange(value: boolean): void;
};
export function Dial({
  apps,
  theme,
  left,
  layout = 0,
  onLaunch,
  onMenu,
  onSettings,
  onTick,
  onScrubChange,
}: Props) {
  const [size, setSize] = useState({ width: 412, height: 892 });
  const [selected, setSelected] = useState(0);
  // Keep active native gestures stable when clock/search state rerenders Home.
  const callbacks = useRef({
    onLaunch,
    onMenu,
    onSettings,
    onTick,
    onScrubChange,
  });
  useEffect(() => {
    callbacks.current = { onLaunch, onMenu, onSettings, onTick, onScrubChange };
  }, [onLaunch, onMenu, onSettings, onTick, onScrubChange]);
  const notifyScrub = useCallback(
    (value: boolean) => callbacks.current.onScrubChange(value),
    [],
  );
  const showSettings = useCallback(() => callbacks.current.onSettings(), []);

  const regular = useFont(
    require("../../assets/fonts/jetbrains_mono_regular.ttf"),
    15,
  );
  const medium = useFont(
    require("../../assets/fonts/jetbrains_mono_medium.ttf"),
    15,
  );
  const large = useFont(
    require("../../assets/fonts/jetbrains_mono_light.ttf"),
    112,
  );
  const reducedMotion = useReducedMotion();
  const position = useSharedValue(0),
    origin = useSharedValue(0),
    anchor = useSharedValue(0);
  const translation = useSharedValue(0),
    moved = useSharedValue(false),
    consumed = useSharedValue(false);
  const scrub = useSharedValue(false),
    base = useSharedValue(0),
    kick = useSharedValue(0);
  const samples = useSharedValue<{ time: number; position: number }[]>([]);
  const lastTick = useSharedValue(0);
  const names = useMemo(() => apps.map((app) => app.label), [apps]);
  const letters = useMemo(
    () => [...new Set(apps.map((app) => initial(app.label)))],
    [apps],
  );
  const labels = useMemo(
    () =>
      regular
        ? apps.map((app) => ({
            text: displayName(app.label),
            glyphs: regular.getGlyphIDs(displayName(app.label)),
          }))
        : [],
    [apps, regular],
  );
  const alphabet = useMemo(
    () =>
      regular
        ? letters.map((text) => ({ text, glyphs: regular.getGlyphIDs(text) }))
        : [],
    [letters, regular],
  );
  const empty = useMemo(() => {
    const recorder = Skia.PictureRecorder();
    recorder.beginRecording();
    const picture = recorder.finishRecordingAsPicture();
    recorder.dispose();
    return picture;
  }, []);
  const g = geometry(
    size.width,
    size.height,
    (layouts[layout] ?? layouts[0]).radius,
  );
  const radius = (layouts[layout] ?? layouts[0]).radius;
  const animate = useCallback(
    (target: number) =>
      position.set(reducedMotion ? target : withDialMotion(target)),
    [position, reducedMotion],
  );
  const changed = useCallback((index: number, sound: boolean) => {
    setSelected(index);
    if (sound) callbacks.current.onTick();
  }, []);
  useAnimatedReaction(
    () => ({ index: Math.round(position.get()), scrub: scrub.get() }),
    (next, previous) => {
      if (!previous || next.scrub !== previous.scrub) return;
      if (next.index !== previous.index) {
        const now = gestureTime(),
          sound = now - lastTick.get() >= 26;
        if (sound) lastTick.set(now);
        if (!reducedMotion) {
          kick.set(1);
          kick.set(withPawl());
        }
        scheduleOnRN(changed, mod(next.index, apps.length), sound);
      }
    },
    [apps.length, changed, reducedMotion],
  );
  const picture = useDerivedValue(() =>
    regular && medium && large
      ? drawDial(
          size.width,
          size.height,
          position.get(),
          layout,
          left,
          theme,
          scrub.get() ? alphabet : labels,
          regular,
          medium,
          large,
          scrub.get(),
          kick.get(),
        )
      : empty,
  );
  const launchAt = useCallback(
    (index: number) => {
      if (apps.length)
        callbacks.current.onLaunch(apps[mod(index, apps.length)]);
    },
    [apps],
  );
  const menuAt = useCallback(
    (index: number) => {
      if (apps.length) callbacks.current.onMenu(apps[mod(index, apps.length)]);
    },
    [apps],
  );
  // Gesture builders register these callbacks; they do not invoke them during render.
  /* eslint-disable react-hooks/refs */
  const gesture = useMemo(() => {
    const finish = () => {
      "worklet";
      if (consumed.get()) return;
      if (scrub.get()) {
        const letter = letters[mod(Math.round(position.get()), letters.length)];
        const index = names.findIndex(
          (name) => initialWorklet(name) === letter,
        );
        const saved = base.get();
        // Restore the app coordinate system before settling; never reuse the letter drag origin.
        scrub.set(false);
        position.set(saved);
        const target =
          index < 0 ? saved : scrubTarget(saved, index, names.length);
        position.set(reducedMotion ? target : withDialMotion(target));
        scheduleOnRN(notifyScrub, false);
        scheduleOnRN(changed, mod(Math.round(saved), names.length), false);
      } else if (moved.get()) {
        const recent = samples.get(),
          first = recent[0],
          now = gestureTime();
        const velocity = first
          ? Math.max(
              -0.06,
              Math.min(
                0.06,
                (position.get() - first.position) /
                  Math.max(16, now - first.time),
              ),
            )
          : 0;
        position.set(
          reducedMotion
            ? Math.round(position.get())
            : withDialMotion(Math.round(position.get()), velocity),
        );
      } else {
        const target = Math.round(position.get());
        position.set(reducedMotion ? target : withDialMotion(target));
      }
      consumed.set(true);
    };
    const pan = Gesture.Pan()
      .minDistance(0)
      .onBegin(() => {
        cancelAnimation(position);
        origin.set(position.get());
        anchor.set(0);
        translation.set(0);
        moved.set(false);
        consumed.set(false);
        samples.set([{ time: gestureTime(), position: position.get() }]);
      })
      .onUpdate((event) => {
        translation.set(event.translationY);
        if (
          Math.abs(event.translationY) > DESIGN.slop * g.scale ||
          Math.abs(event.translationX) > DESIGN.slop * g.scale
        )
          moved.set(true);
        if (consumed.get() || !names.length) return;
        position.set(
          dragPosition(origin.get(), event.translationY, anchor.get(), g.scale),
        );
        const time = gestureTime();
        samples.set([
          ...samples.get().filter((sample) => time - sample.time <= 90),
          { time, position: position.get() },
        ]);
      })
      .onEnd(finish)
      .onFinalize((_, success) => {
        if (!success && (moved.get() || scrub.get())) finish();
      });
    const hold = Gesture.LongPress()
      .minDuration(DESIGN.holdMs)
      .maxDistance(DESIGN.slop * g.scale)
      .onStart((event) => {
        if (moved.get()) return;
        if (!names.length) {
          consumed.set(true);
          scheduleOnRN(showSettings);
          return;
        }
        const zone = zoneAt(
          event.x / g.scale,
          event.y / g.scale,
          position.get(),
          radius,
          g.cy,
          size.height / g.scale,
          left,
        );
        if (zone === "dial") {
          const saved = Math.round(position.get()),
            letter = initialWorklet(names[mod(saved, names.length)]);
          const index = letters.indexOf(letter);
          base.set(saved);
          scrub.set(true);
          position.set(index);
          origin.set(index);
          // Pan translation is cumulative from touch-down: rebase it at the hold transition.
          anchor.set(translation.get());
          samples.set([]);
          scheduleOnRN(notifyScrub, true);
        } else {
          consumed.set(true);
          position.set(Math.round(position.get()));
          if (zone === "selected")
            scheduleOnRN(menuAt, Math.round(position.get()));
          else scheduleOnRN(showSettings);
        }
      });
    const tap = Gesture.Tap()
      .maxDuration(450)
      .maxDistance(DESIGN.slop * g.scale)
      .onEnd((event, success) => {
        if (!success || moved.get() || scrub.get() || !names.length) return;
        const row = rowAt(
          event.x / g.scale,
          event.y / g.scale,
          position.get(),
          radius,
          g.cy,
          size.height / g.scale,
          left,
        );
        if (row === null) return;
        if (row === Math.round(position.get())) scheduleOnRN(launchAt, row);
        else position.set(reducedMotion ? row : withDialMotion(row));
      });
    return Gesture.Simultaneous(pan, hold, tap);
  }, [
    names,
    letters,
    g.scale,
    g.cy,
    radius,
    size.height,
    left,
    reducedMotion,
    position,
    origin,
    anchor,
    translation,
    moved,
    consumed,
    scrub,
    base,
    samples,
    notifyScrub,
    changed,
    menuAt,
    showSettings,
    launchAt,
  ]);
  /* eslint-enable react-hooks/refs */
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={StyleSheet.absoluteFill}
        onLayout={(event) => setSize(event.nativeEvent.layout)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="App dial"
        accessibilityValue={{ text: apps[selected]?.label ?? "Empty dial" }}
        accessibilityActions={[
          { name: "increment" },
          { name: "decrement" },
          { name: "activate" },
          { name: "longpress" },
        ]}
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName;
          if (action === "activate") launchAt(Math.round(position.get()));
          else if (action === "longpress") menuAt(Math.round(position.get()));
          else
            animate(
              Math.round(position.get()) + (action === "increment" ? 1 : -1),
            );
        }}
      >
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Picture picture={picture} />
        </Canvas>
        {!apps.length && (
          <View pointerEvents="none" style={styles.empty}>
            <Text style={{ color: theme.muted }}>
              Your dial is empty. Add apps from search.
            </Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
function initialWorklet(name: string) {
  "worklet";
  return String.fromCodePoint(name.codePointAt(0) ?? 63);
}
const styles = StyleSheet.create({
  empty: { position: "absolute", top: "50%", marginHorizontal: 28 },
});

function gestureTime() {
  "worklet";
  return performance.now();
}
