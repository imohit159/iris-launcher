import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { App } from "../launcher/catalog";
import type { Theme } from "../preferences";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";
import { DialLayoutPicker } from "./DialLayoutPicker";
import { Section } from "./Section";

type Props = {
  apps: App[];
  theme: Theme;
  layout: number;
  left: boolean;
  dots: boolean;
  sound: boolean;
  haptics: boolean;
  onLayoutChange(index: number): void;
  onLeftChange(value: boolean): void;
  onDotsChange(value: boolean): void;
  onSoundChange(value: boolean): void;
  onHapticsChange(value: boolean): void;
  onChooseApps(): void;
};

function ToggleRow({
  label,
  description,
  value,
  theme,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  theme: Theme;
  onChange(value: boolean): void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={[styles.toggleLabel, { color: theme.fg }]}>{label}</Text>
        {description ? (
          <Text style={[styles.toggleDescription, { color: theme.muted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export function DialSettings({
  apps,
  theme,
  layout,
  left,
  dots,
  sound,
  haptics,
  onLayoutChange,
  onLeftChange,
  onDotsChange,
  onSoundChange,
  onHapticsChange,
  onChooseApps,
}: Props) {
  return (
    <View style={styles.section}>
      <DialLayoutPicker
        apps={apps}
        theme={theme}
        left={left}
        layout={layout}
        onLayoutChange={onLayoutChange}
      />

      <Section label="Position" labelColor={theme.muted}>
        <ToggleRow
          label="Dial on the left"
          description="Position the radial dial on the left side"
          value={left}
          theme={theme}
          onChange={onLeftChange}
        />
      </Section>

      <Section label="Dial options" labelColor={theme.muted}>
        <ToggleRow
          label="Notification dots"
          description="Show app indicators on the dial"
          value={dots}
          theme={theme}
          onChange={onDotsChange}
        />
        <ToggleRow
          label="Dial sound"
          description="Play a tick when moving the dial"
          value={sound}
          theme={theme}
          onChange={onSoundChange}
        />
        <ToggleRow
          label="Haptics"
          description="Vibrate when moving the dial"
          value={haptics}
          theme={theme}
          onChange={onHapticsChange}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose apps for your dial"
          onPress={onChooseApps}
          style={styles.chooseButton}
        >
          <Text style={[styles.chooseButtonText, { color: theme.accent }]}>
            Choose apps for your dial
          </Text>
        </Pressable>
        <Text style={[styles.note, { color: theme.muted }]}>
          Add your favorite apps from search to fill the dial. Sound follows your
          phone’s ringer mode.
        </Text>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  toggleRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    ...TYPOGRAPHY.option,
  },
  toggleDescription: {
    ...TYPOGRAPHY.description,
  },
  chooseButton: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    backgroundColor: SURFACES.elevated,
  },
  chooseButtonText: {
    ...TYPOGRAPHY.button,
  },
  note: {
    ...TYPOGRAPHY.body,
    marginTop: 12,
    marginHorizontal: 24,
  },
});
