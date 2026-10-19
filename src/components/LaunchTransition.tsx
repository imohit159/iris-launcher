import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";

type Props = {
  label: string | null;
  theme: Theme;
  reducedMotion: boolean;
};

export function LaunchTransition({ label, theme, reducedMotion }: Props) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!label) {
      opacity.setValue(0);
      return;
    }
    if (reducedMotion) {
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [label, opacity, reducedMotion]);

  if (!label) return null;
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: SURFACES.elevated, opacity, borderColor: `${theme.fg}28` },
        ]}
      >
        <Text style={[styles.label, { color: theme.fg }]} numberOfLines={1}>
          opening {label}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    maxWidth: "80%",
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
  },
  label: {
    ...TYPOGRAPHY.utility,
    fontFamily: "JetBrainsMono",
  },
});
