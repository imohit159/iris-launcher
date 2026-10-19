import { useFonts } from "expo-font";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";

type Props = {
  theme: Theme;
  top: number;
  left?: number;
  right?: number;
  height: number;
  scale: number;
  transparency: number;
  onPress(): void;
};

export function HomeSearchPill({
  theme,
  top,
  left,
  right,
  height,
  scale,
  transparency,
  onPress,
}: Props) {
  const [fontsLoaded] = useFonts({
    JetBrainsMono: require("../../assets/fonts/jetbrains_mono_regular.ttf"),
  });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search apps"
      onPress={onPress}
      style={[
        styles.pill,
        {
          top,
          left,
          right,
          height,
          paddingLeft: 14 * scale,
          paddingRight: 18 * scale,
          gap: 10 * scale,
          borderColor: `${theme.fg}38`,
          backgroundColor: `${theme.bg}8c`,
          opacity: 1 - transparency,
        },
      ]}
    >
      <View style={{ width: 14 * scale, height: 14 * scale }}>
        <View
          style={{
            width: 9 * scale,
            height: 9 * scale,
            borderRadius: 9 * scale,
            borderWidth: 1.3 * scale,
            borderColor: theme.fg,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 6 * scale,
            height: 1.3 * scale,
            left: 8 * scale,
            top: 10 * scale,
            backgroundColor: theme.fg,
            transform: [{ rotate: "45deg" }],
          }}
        />
      </View>
      <Text
        style={{
          color: theme.fg,
          fontSize: Number(TYPOGRAPHY.utility.fontSize) * scale,
          fontFamily: fontsLoaded ? "JetBrainsMono" : "monospace",
        }}
      >
        search
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
