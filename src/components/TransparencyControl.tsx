import { StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";
import { ChoiceChips } from "./ChoiceChips";

export const TRANSPARENCY_OPTIONS = [0, 0.2, 0.4, 0.6, 0.8] as const;

type Props = {
  label: string;
  description: string;
  value: number;
  theme: Theme;
  onChange(value: number): void;
};

export function TransparencyControl({
  label,
  description,
  value,
  theme,
  onChange,
}: Props) {
  const selectedValue = TRANSPARENCY_OPTIONS.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  TRANSPARENCY_OPTIONS[0]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.fg }]}>{label}</Text>
      <Text style={[styles.description, { color: theme.muted }]}>
        {description}
      </Text>
      <ChoiceChips
        options={TRANSPARENCY_OPTIONS}
        value={selectedValue}
        theme={theme}
        label={(option) => `${Math.round(option * 100)}%`}
        onChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    gap: 4,
  },
  label: {
    ...TYPOGRAPHY.option,
  },
  description: {
    ...TYPOGRAPHY.description,
  },
});
