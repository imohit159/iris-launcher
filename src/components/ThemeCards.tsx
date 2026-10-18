import { useEffect, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { artwork } from "../themes/assets";
import { themes, type Theme, type ThemeName } from "../themes/catalog";

const CARD_WIDTH = 140;
const CARD_HEIGHT = 236;
const CARD_GAP = 12;

type Props = {
  selectedTheme: ThemeName;
  onSelectTheme(theme: ThemeName): void;
  currentTheme: Theme;
  left: boolean;
};

const THEME_NAMES = Object.keys(themes) as ThemeName[];

export function ThemeCards({
  selectedTheme,
  onSelectTheme,
  currentTheme,
  left,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = THEME_NAMES.indexOf(selectedTheme);
    if (index >= 0) {
      scrollRef.current?.scrollTo({
        x: Math.max(0, index * (CARD_WIDTH + CARD_GAP) - 24),
        animated: true,
      });
    }
  }, [selectedTheme]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + CARD_GAP}
      decelerationRate="fast"
      contentContainerStyle={styles.container}
    >
      {THEME_NAMES.map((name) => {
        const item = themes[name];
        const isSelected = selectedTheme === name;
        const wallImage = item.wall
          ? artwork[item.wall]
          : artwork.hands;

        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={`${name} theme, ${item.light ? "light" : "dark"}${isSelected ? ", active" : ""}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectTheme(name)}
            style={[
              styles.card,
              {
                backgroundColor: item.panel,
                borderColor: isSelected ? currentTheme.accent : item.panel,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            {/* Phone Screen Mockup */}
            <View
              style={[
                styles.preview,
                { backgroundColor: item.bg },
              ]}
            >
              {item.wall ? (
                <>
                  <Image
                    source={wallImage}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: item.bg, opacity: 0.3 },
                    ]}
                  />
                </>
              ) : (
                <Image
                  source={artwork.hands}
                  style={[
                    StyleSheet.absoluteFill,
                    { opacity: 0.22, tintColor: item.hand },
                  ]}
                  resizeMode="cover"
                />
              )}

              {/* Side Dial Overlay */}
              <View
                style={[
                  styles.dialSideOverlay,
                  left ? styles.overlayLeft : styles.overlayRight,
                  { backgroundColor: item.bg },
                ]}
              />

              {/* Mini Clock & Date */}
              <View
                style={[
                  styles.miniClockArea,
                  left ? styles.clockRight : styles.clockLeft,
                ]}
              >
                <Text
                  style={[
                    styles.miniClockText,
                    { color: item.fg },
                  ]}
                >
                  10:04
                </Text>
                <Text
                  style={[
                    styles.miniDateText,
                    { color: item.muted2 },
                  ]}
                >
                  sun 18
                </Text>
              </View>

              {/* Mini Dial Track & Notch */}
              <View
                style={[
                  styles.miniDialArea,
                  left ? styles.dialLeft : styles.dialRight,
                ]}
              >
                <View
                  style={[
                    styles.miniDot,
                    { backgroundColor: item.muted2, opacity: 0.5 },
                  ]}
                />
                <View
                  style={[
                    styles.miniDot,
                    { backgroundColor: item.muted2, opacity: 0.7 },
                  ]}
                />
                <View
                  style={[
                    styles.miniNotchRow,
                    left && { flexDirection: "row-reverse" },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniAppName,
                      { color: item.accent },
                    ]}
                    numberOfLines={1}
                  >
                    phone
                  </Text>
                  <View
                    style={[
                      styles.miniNotch,
                      { backgroundColor: item.accent },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.miniDot,
                    { backgroundColor: item.muted2, opacity: 0.7 },
                  ]}
                />
                <View
                  style={[
                    styles.miniDot,
                    { backgroundColor: item.muted2, opacity: 0.5 },
                  ]}
                />
              </View>

              {/* Mini Search Button */}
              <View
                style={[
                  styles.miniSearch,
                  left ? styles.searchRight : styles.searchLeft,
                  {
                    backgroundColor: item.panel,
                    borderColor: item.muted2,
                  },
                ]}
              >
                <View
                  style={[
                    styles.miniSearchIcon,
                    { borderColor: item.fg },
                  ]}
                />
                <Text style={[styles.miniSearchText, { color: item.fg }]}>
                  search
                </Text>
              </View>

              {/* Active Badge */}
              {isSelected && (
                <View
                  style={[
                    styles.activeBadge,
                    left ? { left: 8 } : { right: 8 },
                    { backgroundColor: currentTheme.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.activeBadgeText,
                      { color: currentTheme.bg },
                    ]}
                  >
                    ACTIVE
                  </Text>
                </View>
              )}
            </View>

            {/* Card Footer: Theme name & Palette dots */}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.themeName,
                  {
                    color: isSelected ? currentTheme.accent : currentTheme.fg,
                  },
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
              <View style={styles.paletteRow}>
                <View style={styles.swatchDots}>
                  <View
                    style={[
                      styles.swatchDot,
                      {
                        backgroundColor: item.bg,
                        borderColor: item.muted2,
                        borderWidth: 0.5,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: item.fg },
                    ]}
                  />
                  <View
                    style={[
                      styles.swatchDot,
                      { backgroundColor: item.accent },
                    ]}
                  />
                </View>
                <Text style={[styles.typeText, { color: currentTheme.muted }]}>
                  {item.light ? "LIGHT" : "DARK"}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: CARD_GAP,
    paddingVertical: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: 168,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  dialSideOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "45%",
    opacity: 0.4,
  },
  overlayRight: {
    right: 0,
  },
  overlayLeft: {
    left: 0,
  },
  miniClockArea: {
    position: "absolute",
    top: 10,
  },
  clockLeft: {
    left: 10,
    alignItems: "flex-start",
  },
  clockRight: {
    right: 10,
    alignItems: "flex-end",
  },
  miniClockText: {
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  miniDateText: {
    fontSize: 7,
    marginTop: 1,
  },
  miniDialArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    gap: 4,
    width: 50,
  },
  dialRight: {
    right: 4,
    alignItems: "flex-end",
  },
  dialLeft: {
    left: 4,
    alignItems: "flex-start",
  },
  miniDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 4,
  },
  miniNotchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniNotch: {
    width: 8,
    height: 3,
    borderRadius: 1.5,
  },
  miniAppName: {
    fontSize: 7,
    fontWeight: "500",
  },
  miniSearch: {
    position: "absolute",
    bottom: 10,
    height: 14,
    borderRadius: 7,
    borderWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    gap: 3,
  },
  searchLeft: {
    left: 8,
  },
  searchRight: {
    right: 8,
  },
  miniSearchIcon: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 0.8,
  },
  miniSearchText: {
    fontSize: 6,
    letterSpacing: 0.3,
  },
  activeBadge: {
    position: "absolute",
    top: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  footer: {
    padding: 8,
    gap: 4,
    justifyContent: "center",
  },
  themeName: {
    fontSize: 12,
    fontWeight: "600",
  },
  paletteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swatchDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swatchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 8,
    letterSpacing: 0.5,
    fontWeight: "500",
  },
});
