import { StyleSheet, View, useWindowDimensions } from "react-native";

type Props = {
  enabled: boolean;
  color?: string;
};

/** Developer-only alignment guide. Disabled by default and never captures touches. */
export function BlueprintOverlay({ enabled, color = "#ffffff" }: Props) {
  const { width, height } = useWindowDimensions();
  if (!enabled) return null;
  const vertical = [0.25, 0.5, 0.75].map((ratio) => ratio * width);
  const horizontal = [0.2, 0.4, 0.6, 0.8].map((ratio) => ratio * height);
  return (
    <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
      {vertical.map((left) => (
        <View key={`v-${left}`} style={[styles.vertical, { left, backgroundColor: color }]} />
      ))}
      {horizontal.map((top) => (
        <View key={`h-${top}`} style={[styles.horizontal, { top, backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  vertical: { position: "absolute", top: 0, bottom: 0, width: 1, opacity: 0.16 },
  horizontal: { position: "absolute", left: 0, right: 0, height: 1, opacity: 0.16 },
});
