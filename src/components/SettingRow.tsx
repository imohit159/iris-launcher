import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";

type Props = {
  label: string;
  description?: string;
  theme: Theme;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function SettingRow({
  label,
  description,
  theme,
  trailing,
  children,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: theme.fg }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: theme.muted }]}>
            {description}
          </Text>
        ) : null}
        {children}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    ...TYPOGRAPHY.option,
  },
  description: {
    ...TYPOGRAPHY.description,
  },
});
