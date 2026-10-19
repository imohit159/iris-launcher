import { Switch, Text, View, StyleSheet } from "react-native";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";
import { Section } from "./Section";
import { SettingRow } from "./SettingRow";

type Props = {
  theme: Theme;
  reducedMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  onReducedMotionChange(value: boolean): void;
  onLargeTextChange(value: boolean): void;
  onHighContrastChange(value: boolean): void;
};

export function AccessibilitySettings({
  theme,
  reducedMotion,
  largeText,
  highContrast,
  onReducedMotionChange,
  onLargeTextChange,
  onHighContrastChange,
}: Props) {
  return (
    <View style={styles.screen}>
      <Section first label="Motion" labelColor={theme.muted}>
        <SettingRow
          label="Reduce motion"
          description="Skip inertial dial and launch transitions"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Reduce motion"
              value={reducedMotion}
              onValueChange={onReducedMotionChange}
            />
          }
        />
      </Section>
      <Section label="Reading" labelColor={theme.muted}>
        <SettingRow
          label="Larger text"
          description="Increase clock, dial, and launcher labels"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Larger text"
              value={largeText}
              onValueChange={onLargeTextChange}
            />
          }
        />
        <SettingRow
          label="High contrast"
          description="Use stronger secondary text contrast"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="High contrast"
              value={highContrast}
              onValueChange={onHighContrastChange}
            />
          }
        />
      </Section>
      <Text style={[styles.note, { color: theme.muted }]}>Iris keeps accessibility settings on-device.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  note: {
    ...TYPOGRAPHY.body,
    marginHorizontal: 24,
    marginTop: 8,
  },
});
