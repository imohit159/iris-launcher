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

type Props = {
  visible: boolean;
  apps: App[];
  favorites: string[];
  theme: Theme;
  onClose(): void;
  onLaunch(app: App): void;
  onToggleFavorite(packageName: string): void;
};

export function SearchSheet({
  visible,
  apps,
  favorites,
  theme,
  onClose,
  onLaunch,
  onToggleFavorite,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => search(apps, query), [apps, query]);
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
            backgroundColor: theme.bg,
            paddingTop: Math.max(50, insets.top + 16),
          },
        ]}
      >
        {/* Search input bar */}
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputWrapper,
              { borderBottomColor: theme.panel },
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
            const isTopMatch = isQueryActive && index === 0;

            return (
              <View
                style={[
                  styles.resultRow,
                  isTopMatch && { backgroundColor: theme.panel },
                ]}
              >
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
                </Pressable>

                {onDial ? (
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
                      { borderColor: theme.muted2 },
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
    fontSize: 26,
    fontWeight: "300",
    letterSpacing: -0.6,
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
    fontSize: 13,
    letterSpacing: 0.2,
    fontFamily: "JetBrainsMono",
  },
  countHeader: {
    fontSize: 11,
    letterSpacing: 0.6,
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
    fontSize: 16,
    fontFamily: "JetBrainsMono",
  },
  onDialBadge: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  onDialText: {
    fontSize: 11,
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
    fontSize: 11,
    fontFamily: "JetBrainsMono",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "JetBrainsMono",
    paddingHorizontal: 28,
    paddingTop: 16,
  },
});

