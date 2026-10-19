import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { App } from "../launcher/catalog";
import type { Theme } from "../preferences";
import { Section } from "./Section";
import { SettingRow } from "./SettingRow";
import { TYPOGRAPHY } from "../design/tokens";
import { AppIcon, type IconStyle } from "./AppIcon";

type Props = {
  apps: App[];
  favorites: string[];
  hiddenApps: string[];
  customLabels: Record<string, string>;
  customCategories: Record<string, string>;
  iconStyle: IconStyle;
  theme: Theme;
  onRename(packageName: string, label: string): void;
  onCategorize(packageName: string, category: string): void;
  onToggleFavorite(packageName: string): void;
  onToggleHidden(packageName: string): void;
  onMoveFavorite(packageName: string, direction: -1 | 1): void;
  onIconStyleChange(value: IconStyle): void;
};

function actionLabel(selected: boolean, hidden: boolean) {
  if (hidden) return "show";
  return selected ? "on dial" : "add";
}

export function AppOrganizationSettings({
  apps,
  favorites,
  hiddenApps,
  customLabels,
  customCategories,
  iconStyle,
  theme,
  onRename,
  onCategorize,
  onToggleFavorite,
  onToggleHidden,
  onMoveFavorite,
  onIconStyleChange,
}: Props) {
  return (
    <View style={styles.screen}>
      <Section first label="App list" labelColor={theme.muted}>
        <Text style={[styles.intro, { color: theme.muted }]}>Rename, hide, or place apps on the dial. Changes save as you make them.</Text>
        {apps.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>No launchable apps were found.</Text>
        ) : apps.map((app) => {
          const selected = favorites.includes(app.packageName);
          const hidden = hiddenApps.includes(app.packageName);
          const favoriteIndex = favorites.indexOf(app.packageName);
          const label = customLabels[app.packageName] ?? app.label;
          return (
            <View key={app.packageName} style={styles.appRow}>
              <AppIcon app={app} theme={theme} style={iconStyle} />
              <View style={styles.appCopy}>
                <TextInput
                  accessibilityLabel={`Label for ${app.label}`}
                  value={label}
                  onChangeText={(value) => onRename(app.packageName, value)}
                  placeholder={app.label}
                  placeholderTextColor={theme.muted}
                  selectionColor={theme.accent}
                  style={[styles.input, { color: theme.fg, borderBottomColor: theme.muted2 }]}
                  maxLength={32}
                  autoCapitalize="sentences"
                />
                <TextInput
                  accessibilityLabel={`Category for ${app.label}`}
                  value={customCategories[app.packageName] ?? ""}
                  onChangeText={(value) => onCategorize(app.packageName, value)}
                  placeholder="Category (optional)"
                  placeholderTextColor={theme.muted}
                  selectionColor={theme.accent}
                  style={[styles.categoryInput, { color: theme.muted, borderBottomColor: theme.muted2 }]}
                  maxLength={24}
                  autoCapitalize="sentences"
                />
                <Text style={[styles.packageName, { color: theme.muted }]} numberOfLines={1}>
                  {app.packageName}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${hidden ? "Show" : selected ? "Remove" : "Add"} ${app.label} ${selected ? "from dial" : "to dial"}`}
                  onPress={() => (hidden ? onToggleHidden(app.packageName) : onToggleFavorite(app.packageName))}
                  style={styles.action}
                >
                  <Text style={[styles.actionText, { color: hidden || selected ? theme.accent : theme.muted }]}>
                    {actionLabel(selected, hidden)}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${hidden ? "Show" : "Hide"} ${app.label}`}
                  onPress={() => onToggleHidden(app.packageName)}
                  style={styles.action}
                >
                  <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={theme.muted} />
                </Pressable>
                {selected ? (
                  <View style={styles.reorder}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${app.label} up on dial`}
                      disabled={favoriteIndex <= 0}
                      onPress={() => onMoveFavorite(app.packageName, -1)}
                      style={{ opacity: favoriteIndex <= 0 ? 0.3 : 1 }}
                    >
                      <Ionicons name="chevron-up" size={18} color={theme.fg} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${app.label} down on dial`}
                      disabled={favoriteIndex >= favorites.length - 1}
                      onPress={() => onMoveFavorite(app.packageName, 1)}
                      style={{ opacity: favoriteIndex >= favorites.length - 1 ? 0.3 : 1 }}
                    >
                      <Ionicons name="chevron-down" size={18} color={theme.fg} />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </Section>
      <Section label="Icon style" labelColor={theme.muted}>
        {([
          ["native", "Native", "Keep each app’s original icon"],
          ["monochrome", "Monochrome", "Tint icons to the current theme"],
          ["outline", "Outline", "Reduce icon weight for a quieter dial"],
        ] as const).map(([value, label, description]) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ selected: iconStyle === value }}
            onPress={() => onIconStyleChange(value)}
          >
            <SettingRow
              label={label}
              description={description}
              theme={theme}
              trailing={iconStyle === value ? <Text style={[styles.selected, { color: theme.accent }]}>active</Text> : null}
            />
          </Pressable>
        ))}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  intro: { ...TYPOGRAPHY.body, marginBottom: 14 },
  empty: { ...TYPOGRAPHY.body, paddingVertical: 18 },
  appRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  appCopy: { flex: 1, minWidth: 0 },
  input: {
    ...TYPOGRAPHY.option,
    height: 32,
    paddingVertical: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  packageName: { ...TYPOGRAPHY.meta, marginTop: 4 },
  categoryInput: {
    ...TYPOGRAPHY.meta,
    height: 24,
    paddingVertical: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 7 },
  action: { minHeight: 32, justifyContent: "center", alignItems: "center" },
  actionText: { ...TYPOGRAPHY.badge },
  reorder: { gap: 1 },
  selected: { ...TYPOGRAPHY.badge },
});
