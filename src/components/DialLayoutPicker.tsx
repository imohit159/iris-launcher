import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import type { App } from "../launcher/catalog";
import { layouts } from "../dial/reference";
import { Dial } from "./Dial";
import { SectionContainer } from "./Section";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";

type Props = {
  apps: App[];
  theme: Theme;
  left: boolean;
  layout: number;
  onLayoutChange(index: number): void;
};

export function DialLayoutPicker({
  apps,
  theme,
  left,
  layout,
  onLayoutChange,
}: Props) {
  return (
    <View style={styles.section}>
      <SectionContainer separator={false}>
        <Text style={[styles.layoutStyleTitle, { color: theme.muted }]}>Layout style</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgeRail}
          contentContainerStyle={styles.badgeRailContent}
        >
          {layouts.map((item, index) => {
            const selected = layout === index;
            return (
              <Pressable
                key={item.name}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`Use ${item.name} dial layout`}
                onPress={() => onLayoutChange(index)}
                style={[
                  styles.badge,
                  {
                    backgroundColor: selected ? theme.accent : SURFACES.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: selected
                        ? theme.light
                          ? "#ffffff"
                          : "#000000"
                        : theme.fg,
                    },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SectionContainer>

      <SectionContainer separator={false}>
        <View style={[styles.preview, { backgroundColor: SURFACES.elevated }]}>
          <Dial
            apps={apps}
            theme={theme}
            left={left}
            layout={layout}
            preview
            onSettings={() => {}}
            onScrubChange={() => {}}
            onTick={() => {}}
          />
          <View pointerEvents="none" style={styles.previewHeader}>
            <View style={styles.previewMeta}>
              <Ionicons
                accessibilityElementsHidden
                name="eye-outline"
                size={22}
                color={theme.fg}
              />
              <Text style={[styles.previewLabel, { color: theme.fg }]}>LIVE PREVIEW</Text>
            </View>
          </View>
        </View>
      </SectionContainer>

    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  layoutStyleTitle: {
    ...TYPOGRAPHY.sectionLabel,
    marginBottom: 8,
  },
  badgeRail: {
    width: "100%",
  },
  badgeRailContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  badge: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: "center",
    marginRight: 8,
  },
  badgeText: {
    ...TYPOGRAPHY.badge,
  },
  preview: {
    width: "100%",
    minHeight: 300,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  previewHeader: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
  },
  previewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewLabel: {
    ...TYPOGRAPHY.sectionLabel,
  },
});
