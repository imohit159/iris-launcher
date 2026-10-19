import { StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";
import { ChoiceChips } from "./ChoiceChips";

export const WALLPAPER_BLUR_OPTIONS = [0, 4, 8, 12] as const;
type Blur = (typeof WALLPAPER_BLUR_OPTIONS)[number];

type Props = {
  value: Blur;
  theme: Theme;
  onChange(value: Blur): void;
};

export function BlurControl({ value, theme, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.fg }]}>Wallpaper blur</Text>
      <Text style={[styles.description, { color: theme.muted }]}>Soften busy artwork behind the dial</Text>
      <ChoiceChips
        options={WALLPAPER_BLUR_OPTIONS}
        value={value}
        theme={theme}
        label={(option) => (option === 0 ? "off" : `${option}px`)}
        onChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, gap: 4 },
  label: { ...TYPOGRAPHY.option },
  description: { ...TYPOGRAPHY.description },
});
