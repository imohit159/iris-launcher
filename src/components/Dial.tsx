import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  Pressable,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { App } from "../launcher/catalog";
import type { Theme } from "../preferences";

const STEP = 66;
const ANGLE = 0.22;
const WINDOW_BATCH = 4;
const WINDOW_RADIUS = 8;
const SPRING = {
  damping: 27,
  stiffness: 240,
  mass: 0.8,
  overshootClamping: true,
};
type Props = {
  apps: App[];
  theme: Theme;
  left: boolean;
  onLaunch(app: App): void;
  onMenu(app: App): void;
  onAlphabet(): void;
  onTick(): void;
  jump: number;
};

const DialItem = memo(function DialItem({
  app,
  index,
  position,
  size,
  left,
  theme,
  selected,
  onSelect,
  onLaunch,
  onMenu,
  onAlphabet,
}: {
  app: App;
  index: number;
  position: SharedValue<number>;
  size: { width: number; height: number };
  left: boolean;
  theme: Theme;
  selected: boolean;
  onSelect(index: number): void;
  onLaunch(app: App): void;
  onMenu(app: App): void;
  onAlphabet(): void;
}) {
  const itemStyle = useAnimatedStyle(() => {
    const distance = index - position.get();
    // Offscreen rows keep a constant transform, avoiding native updates every frame.
    if (Math.abs(distance) >= 5)
      return {
        opacity: 0,
        transform: [
          { translateX: -1000 },
          { translateY: -1000 },
          { rotate: "0rad" },
        ],
      };
    const angle = distance * ANGLE;
    const radius = size.width * 0.83;
    const center = left ? -radius * 0.44 : size.width + radius * 0.44;
    return {
      opacity: Math.max(0, 1 - Math.abs(distance) / 5),
      transform: [
        {
          translateX: center + (left ? 1 : -1) * Math.cos(angle) * radius - 110,
        },
        { translateY: size.height / 2 + Math.sin(angle) * radius - 24 },
        { rotate: `${(left ? -1 : 1) * angle}rad` },
      ],
    };
  });
  const labelStyle = useAnimatedStyle(() => {
    const emphasis = Math.max(0, 1 - Math.abs(index - position.get()));
    return {
      color: Math.round(position.get()) === index ? theme.accent : theme.fg,
      transform: [{ scale: 1 + emphasis * 0.3 }],
    };
  });
  return (
    <Animated.View style={[styles.item, itemStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${selected ? "Open" : "Select"} ${app.label}`}
        accessibilityState={{ selected }}
        onPress={() => (selected ? onLaunch(app) : onSelect(index))}
        onLongPress={() => (selected ? onMenu(app) : onAlphabet())}
        style={styles.target}
      >
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              textAlign: left ? "left" : "right",
              transformOrigin: left ? "left center" : "right center",
            },
            labelStyle,
          ]}
        >
          {app.label.toLocaleLowerCase()}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
});

export function Dial({
  apps,
  theme,
  left,
  onLaunch,
  onMenu,
  onAlphabet,
  onTick,
  jump,
}: Props) {
  const position = useSharedValue(0);
  const origin = useSharedValue(0);
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState({ width: 360, height: 450 });
  const count = apps.length;
  const select = useCallback(
    (index: number) => {
      position.set(withSpring(Math.max(0, Math.min(count - 1, index)), SPRING));
    },
    [count, position],
  );
  const selectionChanged = useCallback(
    (next: number) => {
      setSelected(next);
      onTick();
    },
    [onTick],
  );
  useAnimatedReaction(
    () => Math.max(0, Math.min(count - 1, Math.round(position.get()))),
    (next, previous) => {
      if (previous !== null && next !== previous && count > 0)
        scheduleOnRN(selectionChanged, next);
    },
    [count, selectionChanged],
  );
  useEffect(() => {
    if (jump >= 0) select(jump);
  }, [jump, select]);
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .onStart(() => {
          cancelAnimation(position);
          origin.set(position.get());
        })
        .onUpdate((event) => {
          position.set(
            Math.max(
              0,
              Math.min(count - 1, origin.get() - event.translationY / STEP),
            ),
          );
        })
        .onEnd((event) => {
          const projected = position.get() - (event.velocityY / STEP) * 0.18;
          position.set(
            withSpring(
              Math.max(0, Math.min(count - 1, Math.round(projected))),
              SPRING,
            ),
          );
        })
        .onFinalize((_, success) => {
          if (!success)
            position.set(withSpring(Math.round(position.get()), SPRING));
        }),
    [count, origin, position],
  );
  const radius = size.width * 0.83;
  const center = left ? -radius * 0.44 : size.width + radius * 0.44;
  const windowCenter = Math.floor(selected / WINDOW_BATCH) * WINDOW_BATCH;
  const start = Math.max(0, windowCenter - WINDOW_RADIUS);
  return (
    <View
      style={styles.surface}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
    >
      <View
        pointerEvents="none"
        style={[
          styles.rim,
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderColor: theme.muted,
            left: center - radius,
            top: size.height / 2 - radius,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.notch,
          {
            backgroundColor: theme.accent,
            top: size.height / 2,
            [left ? "left" : "right"]: 0,
          },
        ]}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.gestureSurface}>
          {apps
            .slice(start, windowCenter + WINDOW_RADIUS + 1)
            .map((app, offset) => (
              <DialItem
                key={app.packageName}
                app={app}
                index={start + offset}
                position={position}
                size={size}
                left={left}
                theme={theme}
                selected={selected === start + offset}
                onSelect={select}
                onLaunch={onLaunch}
                onMenu={onMenu}
                onAlphabet={onAlphabet}
              />
            ))}
        </Animated.View>
      </GestureDetector>
      {!count && (
        <Text style={[styles.empty, { color: theme.muted }]}>
          Your dial is empty. Add apps from search.
        </Text>
      )}
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous app"
          disabled={selected === 0}
          onPress={() => select(selected - 1)}
          style={styles.control}
        >
          <Text style={{ color: theme.accent }}>↑</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jump to letter"
          onPress={onAlphabet}
          style={styles.control}
        >
          <Text style={{ color: theme.muted }}>A — Z</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next app"
          disabled={selected >= count - 1}
          onPress={() => select(selected + 1)}
          style={styles.control}
        >
          <Text style={{ color: theme.accent }}>↓</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  surface: { flex: 1, minHeight: 280, overflow: "hidden" },
  gestureSurface: { flex: 1 },
  rim: { position: "absolute", borderWidth: 1, opacity: 0.18 },
  notch: { position: "absolute", width: 24, height: 2 },
  item: { position: "absolute", width: 220 },
  target: { minHeight: 48, justifyContent: "center", paddingHorizontal: 16 },
  label: { fontSize: 18, fontWeight: "500" },
  empty: { position: "absolute", top: 24, marginHorizontal: 28 },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  control: {
    minHeight: 48,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
