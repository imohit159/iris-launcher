import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import type { App } from "../launcher/catalog";
import { layouts } from "../dial/reference";
import { Dial } from "./Dial";
import { SectionContainer } from "./Section";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";
import { ChoiceChips } from "./ChoiceChips";

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
      <SectionContainer first separator={false}>
        <Text style={[styles.layoutStyleTitle, { color: theme.muted }]}>Layout style</Text>
        <ChoiceChips
          options={layouts.map((_, index) => index)}
          value={layout}
          theme={theme}
          label={(index) => layouts[index]?.name ?? "layout"}
          onChange={onLayoutChange}
        />
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
