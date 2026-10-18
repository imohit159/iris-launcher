import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { type Theme, type ThemeName, THEME_LIST, themes } from "../preferences";
import { artwork } from "../themes/assets";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";
import { SectionContainer } from "./Section";

type Props = {
  theme: Theme;
  currentTheme: ThemeName;
  customWallpaperUri: string | null;
  busy: boolean;
  ready: boolean;
  onChooseCustom(): void;
  onSelectTheme(themeName: ThemeName): void;
};

const wallpaperThemes = THEME_LIST.filter(
  ({ name }) => themes[name].wall !== null,
);

function displayName(name: ThemeName) {
  return name.replaceAll("-", " ");
}

function GallerySection({
  title,
  themeNames,
  currentTheme,
  customWallpaperUri,
  accentColor,
  onSelectTheme,
}: {
  title: string;
  themeNames: ThemeName[];
  currentTheme: ThemeName;
  customWallpaperUri: string | null;
  accentColor: string;
  onSelectTheme(themeName: ThemeName): void;
}) {
  return (
    <SectionContainer style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.allLabel}>
          <Text style={styles.allText}>All</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {themeNames.map((themeName) => {
          const selected = !customWallpaperUri && currentTheme === themeName;
          const wallpaper = themes[themeName].wall;
          if (!wallpaper) return null;
          return (
            <Pressable
              key={themeName}
              accessibilityRole="button"
              accessibilityLabel={`Use ${displayName(themeName)} wallpaper`}
              accessibilityState={{ selected }}
              onPress={() => onSelectTheme(themeName)}
              style={styles.card}
            >
              <Image
                source={artwork[wallpaper]}
                resizeMode="cover"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardShade} />
              <Text style={[styles.cardTitle, { color: themes[themeName].fg }]}>
                {displayName(themeName)}
              </Text>
              {selected && (
                <View style={[styles.selectedMark, { backgroundColor: accentColor }]}>
                  <Text style={styles.selectedMarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SectionContainer>
  );
}

export function WallpaperGallery({
  theme,
  currentTheme,
  customWallpaperUri,
  busy,
  ready,
  onChooseCustom,
  onSelectTheme,
}: Props) {
  return (
    <View>
      <SectionContainer separator={false} style={styles.albumSection}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose a photo from albums"
          onPress={onChooseCustom}
          disabled={busy || !ready}
          accessibilityState={{ disabled: busy || !ready }}
          style={[styles.albumCard, { opacity: busy || !ready ? 0.5 : 1 }]}
        >
          <Image
            source={
              customWallpaperUri
                ? { uri: customWallpaperUri }
                : artwork[themes[currentTheme].wall ?? theme.wall ?? "hands"]
            }
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.albumShade} />
          <View style={styles.albumCopy}>
            <Text style={styles.albumIcon}>▣</Text>
            <Text style={styles.albumText}>
              {busy
                ? "Saving wallpaper…"
                : customWallpaperUri
                  ? "Change from albums"
                  : "Select from albums"}
            </Text>
          </View>
        </Pressable>
      </SectionContainer>

      <GallerySection
        title="Theme wallpapers"
        themeNames={wallpaperThemes.map(({ name }) => name)}
        currentTheme={currentTheme}
        customWallpaperUri={customWallpaperUri}
        accentColor={theme.accent}
        onSelectTheme={onSelectTheme}
      />
      <Text style={[styles.footer, { color: theme.accent }]}>More wallpapers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  albumCard: {
    height: 166,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: SURFACES.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  albumSection: {
    marginBottom: 14,
  },
  albumShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
  },
  albumCopy: {
    alignItems: "center",
    gap: 8,
  },
  albumIcon: {
    color: "#ffffff",
    fontSize: 32,
    lineHeight: 34,
  },
  albumText: {
    ...TYPOGRAPHY.cardAction,
    color: "#ffffff",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeading,
    color: "#ffffff",
  },
  allLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  allText: {
    ...TYPOGRAPHY.option,
    color: "rgba(255, 255, 255, 0.58)",
  },
  chevron: {
    color: "rgba(255, 255, 255, 0.58)",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 24,
  },
  rail: {
    gap: 14,
  },
  card: {
    width: 154,
    height: 238,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: SURFACES.elevated,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
  cardShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  cardTitle: {
    ...TYPOGRAPHY.cardTitle,
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    textTransform: "capitalize",
  },
  selectedMark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedMarkText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    ...TYPOGRAPHY.actionLarge,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 24,
  },
});
