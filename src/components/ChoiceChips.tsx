import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { Theme } from "../preferences";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";

type Props<T extends string | number> = {
  options: readonly T[];
  value: T;
  theme: Theme;
  label(value: T): string;
  onChange(value: T): void;
};

export function ChoiceChips<T extends string | number>({
  options,
  value,
  theme,
  label,
  onChange,
}: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      accessibilityRole="radiogroup"
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={String(option)}
            accessibilityRole="radio"
            accessibilityLabel={label(option)}
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[styles.chip, { backgroundColor: selected ? theme.accent : SURFACES.secondary }]}
          >
            <Text style={[styles.text, { color: selected ? (theme.light ? "#ffffff" : "#000000") : theme.fg }]}>
              {label(option)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { gap: 8, paddingVertical: 6 },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  text: { ...TYPOGRAPHY.badge },
});
