import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { App } from "../launcher/catalog";
import type { Theme } from "../preferences";
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
const STEP = 66;
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
  const [position] = useState(() => new Animated.Value(0));
  const offset = useRef(0);
  const origin = useRef(0);
  const selectedRef = useRef(0);
  const tickRef = useRef(onTick);
  useEffect(() => {
    tickRef.current = onTick;
  }, [onTick]);
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState({ width: 360, height: 450 });
  const count = apps.length;
  const clamp = useCallback(
    (index: number) => Math.max(0, Math.min(count - 1, index)),
    [count],
  );
  const move = useCallback(
    (index: number) =>
      Animated.spring(position, {
        toValue: clamp(index),
        damping: 24,
        stiffness: 190,
        mass: 0.8,
        useNativeDriver: true,
      }).start(),
    [clamp, position],
  );
  useEffect(() => {
    const listener = position.addListener(({ value }) => {
      offset.current = value;
      const next = Math.max(0, Math.min(count - 1, Math.round(value)));
      if (next !== selectedRef.current) {
        selectedRef.current = next;
        setSelected(next);
        tickRef.current();
      }
    });
    return () => position.removeListener(listener);
  }, [position, count]);
  useEffect(() => {
    if (jump >= 0) move(jump);
  }, [jump, move]);
  // PanResponder stores these callbacks; it does not read their refs during render.
  // eslint-disable-next-line react-hooks/refs
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, event) => Math.abs(event.dy) > 8,
    onPanResponderGrant: () =>
      position.stopAnimation((value) => {
        origin.current = value;
      }),
    onPanResponderMove: (_, event) =>
      position.setValue(clamp(origin.current - event.dy / STEP)),
    onPanResponderRelease: (_, event) =>
      move(Math.round(offset.current - event.vy * 2)),
    onPanResponderTerminate: () => move(Math.round(offset.current)),
  });
  const radius = size.width * 0.83;
  const centerX = left ? -radius * 0.44 : size.width + radius * 0.44;
  const current = apps[selected];
  return (
    <View
      style={styles.surface}
      onLayout={(event) => setSize(event.nativeEvent.layout)}
      {...gesture.panHandlers}
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
            left: centerX - radius,
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
      {apps.slice(Math.max(0, selected - 4), selected + 5).map((app, local) => {
        const index = Math.max(0, selected - 4) + local;
        const range = Array.from({ length: 11 }, (_, i) => index - 5 + i);
        const x = range.map((value) => {
          const a = (index - value) * 0.22;
          return centerX + (left ? 1 : -1) * Math.cos(a) * radius - 110;
        });
        const y = range.map(
          (value) =>
            size.height / 2 + Math.sin((index - value) * 0.22) * radius - 24,
        );
        return (
          <Animated.View
            key={app.packageName}
            style={[
              styles.item,
              {
                opacity: position.interpolate({
                  inputRange: [index - 5, index, index + 5],
                  outputRange: [0, 1, 0],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateX: position.interpolate({
                      inputRange: range,
                      outputRange: x,
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateY: position.interpolate({
                      inputRange: range,
                      outputRange: y,
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    rotate: position.interpolate({
                      inputRange: [index - 5, index, index + 5],
                      outputRange: [
                        left ? "-63deg" : "63deg",
                        "0deg",
                        left ? "63deg" : "-63deg",
                      ],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${index === selected ? "Open" : "Select"} ${app.label}`}
              accessibilityState={{ selected: index === selected }}
              onPress={() => (index === selected ? onLaunch(app) : move(index))}
              onLongPress={() =>
                index === selected ? onMenu(app) : onAlphabet()
              }
              style={styles.target}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: index === selected ? theme.accent : theme.fg,
                  fontSize: index === selected ? 24 : 17,
                  textAlign: left ? "left" : "right",
                  fontWeight: index === selected ? "600" : "400",
                }}
              >
                {app.label.toLocaleLowerCase()}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
      {!current && (
        <Text style={{ color: theme.muted, margin: 28 }}>
          Your dial is empty. Add apps from search.
        </Text>
      )}
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous app"
          disabled={selected === 0}
          onPress={() => move(selected - 1)}
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
          onPress={() => move(selected + 1)}
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
  rim: { position: "absolute", borderWidth: 1, opacity: 0.18 },
  notch: { position: "absolute", width: 24, height: 2 },
  item: { position: "absolute", width: 220 },
  target: { minHeight: 48, justifyContent: "center", paddingHorizontal: 8 },
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
