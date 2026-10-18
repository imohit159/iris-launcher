import type { ReactNode } from "react";
import {
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import notices from "../../licenses/notices.json";
import { Dial } from "./Dial";
import { DialSettings } from "./DialSettings";
import { ScreenHeader } from "./ScreenHeader";
import { Section } from "./Section";
import { SettingButton } from "./SettingsPrimitives";
import { WallpaperGallery } from "./WallpaperGallery";
import { layouts } from "../dial/reference";
import { type App as InstalledApp } from "../launcher/catalog";
import {
  THEME_LIST,
  THEME_NAMES,
  themes,
  type Preferences,
  type Theme,
  type ThemeName,
} from "../preferences";
import { artwork } from "../themes/assets";
import { SPACING, SURFACES, TYPOGRAPHY } from "../design/tokens";

type SettingsScreen = "root" | "wallpaper" | "dial";
type PanelMode = "settings" | "licenses";

type Props = {
  visible: boolean;
  panel: PanelMode;
  settingsScreen: SettingsScreen;
  theme: Theme;
  headingColor: string;
  prefs: Preferences;
  wallpaperTheme: ThemeName | null;
  dialPreviewApps: InstalledApp[];
  customWallpaperUri: string | null;
  wallpaperBusy: boolean;
  ready: boolean;
  settingsScrolled: boolean;
  onRequestClose(): void;
  onBack(): void;
  onScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void;
  onSettingsScreenChange(screen: SettingsScreen): void;
  onStatusBarChange(value: boolean): void;
  onOpenNotifications(): void;
  onSetHome(): void;
  onOpenLicenses(): void;
  onStartThemeDial(): void;
  onChooseWallpaper(): void;
  onSelectThemeWallpaper(themeName: ThemeName): void;
  onLayoutChange(index: number): void;
  onLeftChange(value: boolean): void;
  onDotsChange(value: boolean): void;
  onSoundChange(value: boolean): void;
  onHapticsChange(value: boolean): void;
  onChooseApps(): void;
};

function SettingsScrollView({
  children,
  onScroll,
}: {
  children: ReactNode;
  onScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.settings}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  );
}

export function SettingsPanel({
  visible,
  panel,
  settingsScreen,
  theme,
  headingColor,
  prefs,
  wallpaperTheme,
  dialPreviewApps,
  customWallpaperUri,
  wallpaperBusy,
  ready,
  settingsScrolled,
  onRequestClose,
  onBack,
  onScroll,
  onSettingsScreenChange,
  onStatusBarChange,
  onOpenNotifications,
  onSetHome,
  onOpenLicenses,
  onStartThemeDial,
  onChooseWallpaper,
  onSelectThemeWallpaper,
  onLayoutChange,
  onLeftChange,
  onDotsChange,
  onSoundChange,
  onHapticsChange,
  onChooseApps,
}: Props) {
  const wallpaperVisualTheme = themes[wallpaperTheme ?? prefs.theme];
  const activeThemeIndex = Math.max(
    0,
    THEME_LIST.findIndex(({ name }) => name === prefs.theme),
  );
  const settingsTitle =
    panel === "licenses"
      ? "Licenses"
      : settingsScreen === "wallpaper"
          ? "Wallpapers"
          : settingsScreen === "dial"
            ? "Dial layout"
            : "Settings";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <SafeAreaView
        edges={
          prefs.statusBar
            ? ["top", "bottom", "left", "right"]
            : ["bottom", "left", "right"]
        }
        style={[styles.screen, { backgroundColor: SURFACES.screen }]}
      >
        <ScreenHeader
          title={settingsTitle}
          titleColor={headingColor}
          scrolled={settingsScrolled}
          onBack={panel === "settings" && settingsScreen !== "root" ? onBack : undefined}
        />
        {panel === "licenses" ? (
          <SettingsScrollView onScroll={onScroll}>
            {Object.entries(notices).map(([name, text]) => (
              <Section key={name} separator={false}>
                <Text style={[styles.title, { color: theme.accent }]}>
                  {name}
                </Text>
                <Text
                  selectable
                  style={[styles.licenseBody, { color: theme.fg }]}
                >
                  {text}
                </Text>
              </Section>
            ))}
          </SettingsScrollView>
        ) : settingsScreen === "root" ? (
          <SettingsScrollView onScroll={onScroll}>
            <Section
              separator={false}
              label="Appearance"
              labelColor={theme.muted}
            >
              <View style={styles.appearanceGrid}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Wallpapers"
                onPress={() => onSettingsScreenChange("wallpaper")}
                style={[styles.appearancePreviewCard, styles.wallpaperPreviewCard, styles.previewShadow]}
              >
                <Image
                  source={
                    customWallpaperUri
                      ? { uri: customWallpaperUri }
                      : artwork[wallpaperVisualTheme.wall ?? "hands"]
                  }
                  resizeMode="cover"
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.previewShade} />
                <Text style={[styles.previewTitle, { color: theme.fg }]}>Wallpapers</Text>
              </Pressable>
              <View style={styles.appearancePreviewColumn}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={"Choose " + prefs.theme + " theme with dial"}
                  onPress={onStartThemeDial}
                  style={[styles.appearancePreviewCard, styles.smallPreviewCard, styles.previewShadow, { backgroundColor: theme.bg }]}
                >
                  {theme.wall && (
                    <Image source={artwork[theme.wall]} resizeMode="cover" style={StyleSheet.absoluteFill} />
                  )}
                  <View style={styles.previewShade} />
                  <Dial
                    apps={[]}
                    theme={theme}
                    left={prefs.left}
                    layout={prefs.layout}
                    themeMode
                    themeNames={THEME_NAMES}
                    initialIndex={activeThemeIndex}
                    preview
                    onSettings={() => {}}
                    onScrubChange={() => {}}
                    onTick={() => {}}
                  />
                  <Text style={[styles.previewTitle, { color: theme.fg }]}>Theme</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Dial layout ${layouts[prefs.layout].name}`}
                  onPress={() => onSettingsScreenChange("dial")}
                  style={[styles.appearancePreviewCard, styles.smallPreviewCard, styles.previewShadow, { backgroundColor: theme.bg }]}
                >
                  <Image
                    source={artwork[wallpaperVisualTheme.wall ?? "hands"]}
                    resizeMode="cover"
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.previewShade} />
                  <Dial
                    apps={dialPreviewApps}
                    theme={theme}
                    left={prefs.left}
                    layout={prefs.layout}
                    preview
                    onSettings={() => {}}
                    onScrubChange={() => {}}
                    onTick={() => {}}
                  />
                  <Text style={[styles.previewTitle, { color: theme.fg }]}>Dial</Text>
                </Pressable>
              </View>
              </View>
            </Section>
            <Section label="System" labelColor={theme.muted}>
              <View style={styles.setting}>
                <Text style={{ color: theme.fg }}>Status bar</Text>
                <Switch
                  accessibilityLabel="Status bar"
                  value={prefs.statusBar}
                  onValueChange={onStatusBarChange}
                />
              </View>
              <SettingButton
                label="Manage app notifications"
                onPress={onOpenNotifications}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Set Iris as your home app"
                onPress={onSetHome}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <Text style={[styles.note, { color: theme.muted }]}>To switch back later: Android Settings → Apps → Default apps → Home app.</Text>
            </Section>
            <Section label="About" labelColor={theme.muted}>
              <SettingButton
                label="Open-source licenses"
                onPress={onOpenLicenses}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
            </Section>
          </SettingsScrollView>
        ) : settingsScreen === "wallpaper" ? (
          <SettingsScrollView onScroll={onScroll}>
            <WallpaperGallery
              theme={theme}
              currentTheme={wallpaperTheme ?? prefs.theme}
              customWallpaperUri={customWallpaperUri}
              busy={wallpaperBusy}
              ready={ready}
              onChooseCustom={onChooseWallpaper}
              onSelectTheme={onSelectThemeWallpaper}
            />
          </SettingsScrollView>
        ) : (
          <SettingsScrollView onScroll={onScroll}>
            <DialSettings
              apps={dialPreviewApps}
              theme={theme}
              layout={prefs.layout}
              left={prefs.left}
              dots={prefs.dots}
              sound={prefs.sound}
              haptics={prefs.haptics}
              onLayoutChange={onLayoutChange}
              onLeftChange={onLeftChange}
              onDotsChange={onDotsChange}
              onSoundChange={onSoundChange}
              onHapticsChange={onHapticsChange}
              onChooseApps={onChooseApps}
            />
          </SettingsScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  settings: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.screen,
    paddingBottom: SPACING.screen,
  },
  title: { ...TYPOGRAPHY.largeHeading },
  note: {
    ...TYPOGRAPHY.body,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  licenseBody: {
    ...TYPOGRAPHY.longBody,
    marginVertical: 16,
  },
  appearanceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  appearancePreviewCard: {
    borderRadius: 18,
    overflow: "hidden",
  },
  previewShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 6,
  },
  wallpaperPreviewCard: {
    flex: 1.15,
    minHeight: 360,
  },
  appearancePreviewColumn: {
    flex: 0.85,
    gap: 12,
  },
  smallPreviewCard: {
    flex: 1,
    minHeight: 174,
  },
  previewShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.24)",
  },
  previewTitle: {
    ...TYPOGRAPHY.cardTitle,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 14,
    textAlign: "center",
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
});
