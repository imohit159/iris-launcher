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
import { AccessibilitySettings } from "./AccessibilitySettings";
import { AppOrganizationSettings } from "./AppOrganizationSettings";
import { BackupSettings } from "./BackupSettings";
import { BlueprintOverlay } from "./BlueprintOverlay";
import { BehaviorSettings } from "./BehaviorSettings";
import { Dial } from "./Dial";
import { DialSettings } from "./DialSettings";
import { InformationSettings } from "./InformationSettings";
import { PrivacySettings } from "./PrivacySettings";
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
import type { SettingsScreen } from "../settings/types";
import type { NotificationCapability } from "../launcher/notifications";
import type { CalendarEvent, ContextCapability } from "../context/adapter";
import type { MediaCapability, MediaState } from "../context/media";

type PanelMode = "settings" | "licenses";

type Props = {
  visible: boolean;
  panel: PanelMode;
  settingsScreen: SettingsScreen;
  theme: Theme;
  activeThemeName: ThemeName;
  headingColor: string;
  prefs: Preferences;
  wallpaperTheme: ThemeName | null;
  dialPreviewApps: InstalledApp[];
  installedApps: InstalledApp[];
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
  onWallpaperDimmingChange(value: number): void;
  onWallpaperBlurChange(value: 0 | 4 | 8 | 12): void;
  onWallpaperTintChange(value: boolean): void;
  onWallpaperGrainChange(value: boolean): void;
  onLayoutChange(index: number): void;
  onLeftChange(value: boolean): void;
  onDotsChange(value: boolean): void;
  onSoundChange(value: boolean): void;
  onHapticsChange(value: boolean): void;
  onSearchListTransparencyChange(value: number): void;
  onSearchButtonTransparencyChange(value: number): void;
  onShowRecentAppsChange(value: boolean): void;
  onLaunchAnimationChange(value: boolean): void;
  onDoubleTapSearchChange(value: boolean): void;
  onSwipeUpSearchChange(value: boolean): void;
  onThemeModeChange(value: "manual" | "system" | "schedule"): void;
  onDayThemeChange(value: ThemeName): void;
  onNightThemeChange(value: ThemeName): void;
  onDayStartHourChange(value: number): void;
  onNightStartHourChange(value: number): void;
  onReducedMotionChange(value: boolean): void;
  onLargeTextChange(value: boolean): void;
  onHighContrastChange(value: boolean): void;
  onShowDeviceStatusChange(value: boolean): void;
  showContextCards: boolean;
  calendarCapability: ContextCapability;
  nextAlarmAt: number | null;
  nextEvent: CalendarEvent | null;
  onShowContextCardsChange(value: boolean): void;
  onRequestCalendar(): void;
  showMediaControls: boolean;
  mediaCapability: MediaCapability;
  media: MediaState | null;
  onShowMediaControlsChange(value: boolean): void;
  onMediaControl(action: "play" | "pause" | "next" | "previous"): void;
  onShowBlueprintChange(value: boolean): void;
  onRenameApp(packageName: string, label: string): void;
  onCategorizeApp(packageName: string, category: string): void;
  onToggleFavorite(packageName: string): void;
  onToggleHidden(packageName: string): void;
  onMoveFavorite(packageName: string, direction: -1 | 1): void;
  onIconStyleChange(value: "native" | "monochrome" | "outline"): void;
  onExportBackup(): void;
  onExportBackupFile(): void;
  onRestoreBackup(raw: string): void;
  onRestoreLocalBackup(): void;
  onImportBackupFile(): void;
  onChooseApps(): void;
  notificationCapability: NotificationCapability;
  onOpenNotificationAccess(): void;
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
  activeThemeName,
  headingColor,
  prefs,
  wallpaperTheme,
  dialPreviewApps,
  installedApps,
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
  onWallpaperDimmingChange,
  onWallpaperBlurChange,
  onWallpaperTintChange,
  onWallpaperGrainChange,
  onLayoutChange,
  onLeftChange,
  onDotsChange,
  onSoundChange,
  onHapticsChange,
  onSearchListTransparencyChange,
  onSearchButtonTransparencyChange,
  onShowRecentAppsChange,
  onLaunchAnimationChange,
  onDoubleTapSearchChange,
  onSwipeUpSearchChange,
  onThemeModeChange,
  onDayThemeChange,
  onNightThemeChange,
  onDayStartHourChange,
  onNightStartHourChange,
  onReducedMotionChange,
  onLargeTextChange,
  onHighContrastChange,
  onShowDeviceStatusChange,
  onRenameApp,
  onCategorizeApp,
  onToggleFavorite,
  onToggleHidden,
  onMoveFavorite,
  onIconStyleChange,
  onExportBackup,
  onExportBackupFile,
  onRestoreBackup,
  onRestoreLocalBackup,
  onImportBackupFile,
  onChooseApps,
  notificationCapability,
  onOpenNotificationAccess,
  showContextCards,
  calendarCapability,
  nextAlarmAt,
  nextEvent,
  onShowContextCardsChange,
  onRequestCalendar,
  showMediaControls,
  mediaCapability,
  media,
  onShowMediaControlsChange,
  onMediaControl,
  onShowBlueprintChange,
}: Props) {
  const wallpaperVisualTheme = themes[wallpaperTheme ?? prefs.theme];
  const activeThemeIndex = Math.max(
    0,
    THEME_LIST.findIndex(({ name }) => name === activeThemeName),
  );
  const settingsTitle =
    panel === "licenses"
      ? "Licenses"
      : settingsScreen === "wallpaper"
          ? "Wallpapers"
          : settingsScreen === "dial"
            ? "Dial layout"
            : settingsScreen === "behavior"
              ? "Behavior"
              : settingsScreen === "organization"
                ? "Apps and labels"
              : settingsScreen === "accessibility"
                ? "Accessibility"
                : settingsScreen === "information"
                  ? "Information"
                  : settingsScreen === "privacy"
                    ? "Privacy"
                    : settingsScreen === "backup"
                      ? "Backup and restore"
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
            <Section first label="Appearance" labelColor={theme.muted}>
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
            <Section label="Experience" labelColor={theme.muted}>
              <SettingButton
                label="Behavior and discovery"
                onPress={() => onSettingsScreenChange("behavior")}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Apps and labels"
                onPress={() => onSettingsScreenChange("organization")}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Accessibility"
                onPress={() => onSettingsScreenChange("accessibility")}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Information"
                onPress={() => onSettingsScreenChange("information")}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Privacy"
                onPress={() => onSettingsScreenChange("privacy")}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
            </Section>
            <Section label="About" labelColor={theme.muted}>
              <SettingButton
                label="Open-source licenses"
                onPress={onOpenLicenses}
                backgroundColor={SURFACES.elevated}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Backup and restore"
                onPress={() => onSettingsScreenChange("backup")}
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
              wallpaperDimming={prefs.wallpaperDimming}
              wallpaperBlur={prefs.wallpaperBlur}
              wallpaperTint={prefs.wallpaperTint}
              wallpaperGrain={prefs.wallpaperGrain}
              onChooseCustom={onChooseWallpaper}
              onSelectTheme={onSelectThemeWallpaper}
              onWallpaperDimmingChange={onWallpaperDimmingChange}
              onWallpaperBlurChange={onWallpaperBlurChange}
              onWallpaperTintChange={onWallpaperTintChange}
              onWallpaperGrainChange={onWallpaperGrainChange}
            />
          </SettingsScrollView>
        ) : settingsScreen === "dial" ? (
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
        ) : settingsScreen === "behavior" ? (
          <SettingsScrollView onScroll={onScroll}>
            <BehaviorSettings
              theme={theme}
              searchListTransparency={prefs.searchListTransparency}
              searchButtonTransparency={prefs.searchButtonTransparency}
              showRecentApps={prefs.showRecentApps}
              launchAnimation={prefs.launchAnimation}
              doubleTapSearch={prefs.doubleTapSearch}
              swipeUpSearch={prefs.swipeUpSearch}
              themeMode={prefs.themeMode}
              dayTheme={prefs.dayTheme}
              nightTheme={prefs.nightTheme}
              dayStartHour={prefs.dayStartHour}
              nightStartHour={prefs.nightStartHour}
              onSearchListTransparencyChange={onSearchListTransparencyChange}
              onSearchButtonTransparencyChange={onSearchButtonTransparencyChange}
              onShowRecentAppsChange={onShowRecentAppsChange}
              onLaunchAnimationChange={onLaunchAnimationChange}
              onDoubleTapSearchChange={onDoubleTapSearchChange}
              onSwipeUpSearchChange={onSwipeUpSearchChange}
              onThemeModeChange={onThemeModeChange}
              onDayThemeChange={onDayThemeChange}
              onNightThemeChange={onNightThemeChange}
              onDayStartHourChange={onDayStartHourChange}
              onNightStartHourChange={onNightStartHourChange}
            />
          </SettingsScrollView>
        ) : settingsScreen === "organization" ? (
          <SettingsScrollView onScroll={onScroll}>
            <AppOrganizationSettings
              apps={installedApps}
              favorites={prefs.favorites}
              hiddenApps={prefs.hiddenApps}
              customLabels={prefs.customLabels}
              customCategories={prefs.customCategories}
              iconStyle={prefs.iconStyle}
              theme={theme}
              onRename={onRenameApp}
              onCategorize={onCategorizeApp}
              onToggleFavorite={onToggleFavorite}
              onToggleHidden={onToggleHidden}
              onMoveFavorite={onMoveFavorite}
              onIconStyleChange={onIconStyleChange}
            />
          </SettingsScrollView>
        ) : settingsScreen === "accessibility" ? (
          <SettingsScrollView onScroll={onScroll}>
            <AccessibilitySettings
              theme={theme}
              reducedMotion={prefs.reducedMotion}
              largeText={prefs.largeText}
              highContrast={prefs.highContrast}
              onReducedMotionChange={onReducedMotionChange}
              onLargeTextChange={onLargeTextChange}
              onHighContrastChange={onHighContrastChange}
            />
          </SettingsScrollView>
        ) : settingsScreen === "information" ? (
          <SettingsScrollView onScroll={onScroll}>
            <InformationSettings
              theme={theme}
              showDeviceStatus={prefs.showDeviceStatus}
              onShowDeviceStatusChange={onShowDeviceStatusChange}
              showContextCards={showContextCards}
              onShowContextCardsChange={onShowContextCardsChange}
              calendarCapability={calendarCapability}
              nextAlarmAt={nextAlarmAt}
              nextEvent={nextEvent}
              onRequestCalendar={onRequestCalendar}
              showMediaControls={showMediaControls}
              onShowMediaControlsChange={onShowMediaControlsChange}
              mediaCapability={mediaCapability}
              media={media}
              onMediaControl={onMediaControl}
              showBlueprint={prefs.showBlueprint}
              onShowBlueprintChange={onShowBlueprintChange}
            />
          </SettingsScrollView>
        ) : settingsScreen === "privacy" ? (
          <SettingsScrollView onScroll={onScroll}>
            <PrivacySettings
              theme={theme}
              hiddenAppCount={prefs.hiddenApps.length}
              notificationCapability={notificationCapability}
              onOpenNotificationAccess={onOpenNotificationAccess}
            />
          </SettingsScrollView>
        ) : (
          <SettingsScrollView onScroll={onScroll}>
            <BackupSettings
              theme={theme}
              onExport={onExportBackup}
              onExportFile={onExportBackupFile}
              onRestore={onRestoreBackup}
              onRestoreLocal={onRestoreLocalBackup}
              onImportFile={onImportBackupFile}
            />
          </SettingsScrollView>
        )}
        <BlueprintOverlay enabled={prefs.showBlueprint} />
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
