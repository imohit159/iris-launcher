import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Theme } from "../preferences";
import { Section } from "./Section";
import { SettingButton } from "./SettingsPrimitives";
import { TYPOGRAPHY, SURFACES } from "../design/tokens";

type Props = {
  theme: Theme;
  onExport(): void;
  onExportFile(): void;
  onRestore(raw: string): void;
  onRestoreLocal(): void;
  onImportFile(): void;
};

export function BackupSettings({
  theme,
  onExport,
  onExportFile,
  onRestore,
  onRestoreLocal,
  onImportFile,
}: Props) {
  const [raw, setRaw] = useState("");
  return (
    <View style={styles.screen}>
      <Section first label="Backup" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.muted }]}>Save Iris preferences as private local JSON. The backup contains no account or analytics data.</Text>
        <SettingButton
          label="Save local backup"
          onPress={onExport}
          backgroundColor={SURFACES.elevated}
          accentColor={theme.accent}
        />
      </Section>
      <Section label="Restore" labelColor={theme.muted}>
        <SettingButton
          label="Restore last local backup"
          onPress={onRestoreLocal}
          backgroundColor={SURFACES.elevated}
          accentColor={theme.accent}
        />
        <Text style={[styles.body, { color: theme.muted }]}>Paste an Iris JSON backup below to validate and restore it on this device.</Text>
        <TextInput
          accessibilityLabel="Iris backup JSON"
          value={raw}
          onChangeText={setRaw}
          placeholder="Paste backup JSON"
          placeholderTextColor={theme.muted}
          multiline
          textAlignVertical="top"
          selectionColor={theme.accent}
          style={[styles.input, { color: theme.fg, borderColor: theme.muted2 }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restore preferences"
          disabled={!raw.trim()}
          onPress={() => onRestore(raw)}
          style={[styles.restore, { backgroundColor: theme.accent, opacity: raw.trim() ? 1 : 0.45 }]}
        >
          <Text style={[styles.restoreText, { color: theme.light ? "#ffffff" : "#000000" }]}>Restore</Text>
        </Pressable>
      </Section>
      <Section label="Portable file" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.muted }]}>Export a JSON file to a folder you choose, or import one from your device.</Text>
        <SettingButton
          label="Export JSON backup"
          onPress={onExportFile}
          backgroundColor={SURFACES.elevated}
          accentColor={theme.accent}
        />
        <SettingButton
          label="Import JSON backup"
          onPress={onImportFile}
          backgroundColor={SURFACES.elevated}
          accentColor={theme.accent}
        />
      </Section>
      <Text style={[styles.note, { color: theme.muted }]}>Custom wallpaper files stay in the app’s private storage. The backup preserves their reference when restoring on the same device.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { ...TYPOGRAPHY.body, marginBottom: 12 },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    ...TYPOGRAPHY.longBody,
    fontFamily: "JetBrainsMono",
  },
  restore: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    justifyContent: "center",
    marginTop: 12,
  },
  restoreText: { ...TYPOGRAPHY.button },
  note: { ...TYPOGRAPHY.body, marginTop: 8 },
});
