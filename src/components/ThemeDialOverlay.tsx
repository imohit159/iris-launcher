import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Theme, ThemeDef } from "../preferences";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";

type Props = {
  theme: Theme;
  themeDef: ThemeDef;
  left: boolean;
  statusBarVisible: boolean;
  scale: number;
  insets: { top: number; bottom: number };
  onJumpGroup(group: "phone" | "omarchy"): void;
  onCancel(): void;
  onDone(): void;
};

export function ThemeDialOverlay({
  theme,
  themeDef,
  left,
  statusBarVisible,
  scale,
  insets,
  onJumpGroup,
  onCancel,
  onDone,
}: Props) {
  const topY = statusBarVisible
    ? Math.max(84 * scale, insets.top + 28 * scale)
    : 28 * scale;
  const bottomControlsY = Math.max(
    140,
    insets.bottom + 64 * scale,
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Top Header - positioned opposite the dial */}
      <View
        pointerEvents="none"
        style={[
          styles.topHeader,
          {
            top: topY,
            [left ? "right" : "left"]: 28 * scale,
            alignItems: left ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.counter, { color: theme.muted }]}>
          theme
        </Text>
        <Text style={[styles.title, { color: theme.fg }]}>
          theme
        </Text>
        <Text
          style={[
            styles.body,
            {
              color: theme.muted2,
              textAlign: left ? "right" : "left",
            },
          ]}
        >
          turn the dial to try one. each brings its own wallpaper.
        </Text>
      </View>

      {/* Bottom Controls */}
      <View
        pointerEvents="box-none"
        style={[
          styles.bottomControls,
          {
            bottom: bottomControlsY,
            paddingHorizontal: 28 * scale,
            alignItems: left ? "flex-end" : "flex-start",
          },
        ]}
      >
        {/* Group Chips: phone / omarchy */}
        <View style={styles.chipRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Phone themes"
            onPress={() => onJumpGroup("phone")}
            style={[
              styles.chip,
              themeDef.group === "phone"
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : { backgroundColor: "transparent", borderColor: SURFACES.secondary },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                themeDef.group === "phone"
                  ? { color: theme.light ? "#ffffff" : "#000000" }
                  : { color: theme.muted2 },
              ]}
            >
              phone
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Omarchy themes"
            onPress={() => onJumpGroup("omarchy")}
            style={[
              styles.chip,
              themeDef.group === "omarchy"
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : { backgroundColor: "transparent", borderColor: SURFACES.secondary },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                themeDef.group === "omarchy"
                  ? { color: theme.light ? "#ffffff" : "#000000" }
                  : { color: theme.muted2 },
              ]}
            >
              omarchy
            </Text>
          </Pressable>
        </View>

        {/* Theme Group and Mode Info */}
        <Text style={[styles.infoText, { color: theme.fg }]}>
          {`${themeDef.group} · ${themeDef.light ? "light" : "dark"}`}
        </Text>
      </View>

      {/* Bottom Nav Bar: Cancel / Done */}
      <View
        pointerEvents="box-none"
        style={[
          styles.navBar,
          {
            bottom: Math.max(16, insets.bottom + 8),
            paddingLeft: left ? 28 * scale : 20 * scale,
            paddingRight: left ? 20 * scale : 28 * scale,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel theme selection"
          onPress={onCancel}
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelText, { color: theme.muted2 }]}>
            cancel
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Done choosing theme"
          onPress={onDone}
          style={[
            styles.doneButton,
            { backgroundColor: theme.accent },
          ]}
        >
          <Text
            style={[
              styles.doneText,
              { color: theme.light ? "#ffffff" : "#000000" },
            ]}
          >
            done
          </Text>
          <Text
            style={[
              styles.doneArrow,
              { color: theme.light ? "#ffffff" : "#000000" },
            ]}
          >
            →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    position: "absolute",
    width: 220,
    gap: 12,
  },
  counter: {
    ...TYPOGRAPHY.meta,
    letterSpacing: 1,
    fontFamily: "JetBrainsMono",
  },
  title: {
    ...TYPOGRAPHY.display,
    fontFamily: "JetBrainsMono",
  },
  body: {
    ...TYPOGRAPHY.body,
    lineHeight: 20,
    fontFamily: "JetBrainsMono",
  },
  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    gap: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    ...TYPOGRAPHY.badge,
    fontFamily: "JetBrainsMono",
  },
  infoText: {
    ...TYPOGRAPHY.badge,
    letterSpacing: 0.3,
    fontFamily: "JetBrainsMono",
    marginTop: 2,
  },
  navBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelButton: {
    height: 44,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  cancelText: {
    ...TYPOGRAPHY.utility,
    fontFamily: "JetBrainsMono",
  },
  doneButton: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  doneText: {
    ...TYPOGRAPHY.button,
    fontWeight: "600",
    fontFamily: "JetBrainsMono",
  },
  doneArrow: {
    ...TYPOGRAPHY.button,
    fontWeight: "600",
  },
});

