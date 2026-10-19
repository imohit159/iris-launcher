import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { App } from "../launcher/catalog";
import { search } from "../launcher/catalog";
import type { Theme } from "../preferences";
import { SPACING, SURFACES, TYPOGRAPHY } from "../design/tokens";
import { AppIcon } from "./AppIcon";

type Props = {
  visible: boolean;
  apps: App[];
  favorites: string[];
  hiddenApps: string[];
  customCategories: Record<string, string>;
  recentApps: string[];
  showRecentApps: boolean;
  theme: Theme;
  statusBarVisible: boolean;
  searchListTransparency: number;
  iconStyle: "native" | "monochrome" | "outline";
  onClose(): void;
  onLaunch(app: App): void;
  onToggleFavorite(packageName: string): void;
  onToggleHidden(packageName: string): void;
};

export function SearchSheet({
  visible,
  apps,
  favorites,
  hiddenApps,
  customCategories,
  recentApps,
  showRecentApps,
  theme,
  statusBarVisible,
  searchListTransparency,
  iconStyle,
  onClose,
  onLaunch,
  onToggleFavorite,
  onToggleHidden,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const matches = search(apps, query, customCategories);
    if (query.trim() || !showRecentApps || recentApps.length === 0) return matches;
    const rank = new Map(recentApps.map((id, index) => [id, index]));
    return [...matches].sort(
      (a, b) =>
        (rank.get(a.packageName) ?? recentApps.length) -
          (rank.get(b.packageName) ?? recentApps.length) ||
        a.label.localeCompare(b.label),
    );
  }, [apps, customCategories, query, recentApps, showRecentApps]);
  const onDialCount = useMemo(
    () => apps.filter((app) => favorites.includes(app.packageName)).length,
    [apps, favorites],
  );

  const isQueryActive = query.trim().length > 0;
  const countText = isQueryActive
    ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
    : `${results.length} apps · ${onDialCount} on dial`;

  const handleSubmit = () => {
    if (results.length > 0) {
      onLaunch(results[0]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: SURFACES.screen,
            paddingTop: statusBarVisible
              ? Math.max(50, insets.top + 16)
              : SPACING.screen,
          },
        ]}
      >
        {/* Search input bar */}
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputWrapper,
              { borderBottomColor: SURFACES.secondary },
            ]}
          >
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="search apps"
              placeholderTextColor={theme.muted}
              selectionColor={theme.accent}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                { color: theme.fg },
              ]}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel search"
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelText, { color: theme.muted2 }]}>
              cancel
            </Text>
          </Pressable>
        </View>

        {/* Matches / Apps count header */}
        <Text style={[styles.countHeader, { color: theme.muted }]}>
          {countText}
        </Text>

        {/* Results list */}
        <FlatList
          data={results}
          style={{ opacity: 1 - searchListTransparency }}
          keyExtractor={(item) => item.packageName}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              no apps found
            </Text>
          }
          renderItem={({ item, index }) => {
            const onDial = favorites.includes(item.packageName);
            const hidden = hiddenApps.includes(item.packageName);
            const isTopMatch = isQueryActive && index === 0;

            return (
              <View
                style={[
                  styles.resultRow,
                  isTopMatch && { backgroundColor: SURFACES.elevated },
                ]}
              >
                <AppIcon app={item} theme={theme} style={iconStyle} size={24} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.label}`}
                  onPress={() => onLaunch(item)}
                  style={styles.labelPressable}
                >
                  <Text
                    style={[styles.appLabel, { color: theme.fg }]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {customCategories[item.packageName] ? (
                    <Text
                      style={[styles.category, { color: theme.muted }]}
                      numberOfLines={1}
                    >
                      {customCategories[item.packageName]}
                    </Text>
                  ) : null}
                </Pressable>

                {hidden ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${item.label}`}
                    onPress={() => onToggleHidden(item.packageName)}
                    style={styles.addPill}
                  >
                    <Text style={[styles.addText, { color: theme.fg }]}>show</Text>
                  </Pressable>
                ) : onDial ? (
                  <View style={styles.onDialBadge}>
                    <Text style={[styles.onDialText, { color: theme.muted }]}>
                      on dial
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${item.label} to dial`}
                    onPress={() => onToggleFavorite(item.packageName)}
                    style={[
                      styles.addPill,
                      { borderColor: SURFACES.secondary },
                    ]}
                  >
                    <Text style={[styles.addText, { color: theme.fg }]}>
                      + dial
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 28,
    paddingRight: 18,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    height: 52,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  input: {
    ...TYPOGRAPHY.searchInput,
    fontFamily: "JetBrainsMono",
    padding: 0,
    margin: 0,
  },
  cancelButton: {
    height: 44,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    ...TYPOGRAPHY.utility,
    fontFamily: "JetBrainsMono",
  },
  countHeader: {
    ...TYPOGRAPHY.meta,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 8,
    fontFamily: "JetBrainsMono",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 48,
  },
  resultRow: {
    height: 48,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  labelPressable: {
    flex: 1,
    height: 48,
    justifyContent: "center",
  },
  appLabel: {
    ...TYPOGRAPHY.option,
    fontFamily: "JetBrainsMono",
  },
  category: {
    ...TYPOGRAPHY.meta,
    marginTop: 2,
  },
  onDialBadge: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  onDialText: {
    ...TYPOGRAPHY.meta,
    letterSpacing: 0.4,
    fontFamily: "JetBrainsMono",
  },
  addPill: {
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    ...TYPOGRAPHY.badge,
    fontFamily: "JetBrainsMono",
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontFamily: "JetBrainsMono",
    paddingHorizontal: 28,
    paddingTop: 16,
  },
});

