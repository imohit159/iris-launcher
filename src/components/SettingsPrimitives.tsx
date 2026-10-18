import { Pressable, StyleSheet, Text } from "react-native";
import { TYPOGRAPHY } from "../design/tokens";

export function SettingButton({
  label,
  onPress,
  disabled = false,
  backgroundColor,
  accentColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  backgroundColor: string;
  accentColor: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, { color: accentColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 20, borderRadius: 16, marginBottom: 12 },
  buttonText: {
    ...TYPOGRAPHY.button,
  },
});
