import { ActivityIndicator, Text, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import { HomeClock } from "../components/HomeClock";
import { HomeContext } from "../components/HomeContext";
import { HomeMedia } from "../components/HomeMedia";
import { HomeSearchPill } from "../components/HomeSearchPill";
import { HomeStatus } from "../components/HomeStatus";
import { ThemeDialOverlay } from "../components/ThemeDialOverlay";
import { Dial } from "../components/Dial";
import { SettingButton } from "../components/SettingsPrimitives";
import { tick } from "../feedback";
import type { CalendarEvent } from "../context/adapter";
import type { MediaState } from "../context/media";
import type { App as InstalledApp } from "../launcher/catalog";
import { THEME_LIST, THEME_NAMES, type Preferences, type Theme } from "../preferences";

type Props = {
  loading: boolean;
  ready: boolean;
  error: string;
  themeDialMode: boolean;
  width: number;
  height: number;
  scale: number;
  insets: EdgeInsets;
  theme: Theme;
  prefs: Preferences;
  apps: InstalledApp[];
  now: Date;
  scrubbing: boolean;
  previewThemeIndex: number;
  themeTargetIndex: number | null;
  notificationPackageNames: readonly string[];
  nextAlarmAt: number | null;
  nextEvent: CalendarEvent | null;
  media: MediaState | null;
  onRetry(): void;
  onScrubChange(value: boolean): void;
  onThemeTick(index: number): void;
  onThemeSelect(index: number): void;
  onJumpGroup(group: "phone" | "omarchy"): void;
  onCancelTheme(): void;
  onDoneTheme(): void;
  onLaunch(app: InstalledApp): void;
  onMenu(app: InstalledApp): void;
  onSettings(): void;
  onOpenSearch(): void;
  onOpenDateSettings(): void;
  onMediaControl(action: "play" | "pause" | "next" | "previous"): void;
};

export function HomeSurface({
  loading,
  ready,
  error,
  themeDialMode,
  width,
  height,
  scale,
  insets,
  theme,
  prefs,
  apps,
  now,
  scrubbing,
  previewThemeIndex,
  themeTargetIndex,
  notificationPackageNames,
  nextAlarmAt,
  nextEvent,
  media,
  onRetry,
  onScrubChange,
  onThemeTick,
  onThemeSelect,
  onJumpGroup,
  onCancelTheme,
  onDoneTheme,
  onLaunch,
  onMenu,
  onSettings,
  onOpenSearch,
  onOpenDateSettings,
  onMediaControl,
}: Props) {
  if (loading || !ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.fg }}>{error}</Text>
        <SettingButton
          label="Try again"
          onPress={onRetry}
          backgroundColor="#191919"
          accentColor={theme.accent}
        />
      </View>
    );
  }
  if (themeDialMode) {
    return (
      <>
        <Dial
          key="theme-dial"
          themeMode
          themeNames={THEME_NAMES}
          initialIndex={previewThemeIndex}
          targetIndex={themeTargetIndex}
          apps={apps}
          theme={theme}
          left={prefs.left}
          layout={prefs.layout}
          reducedMotion={prefs.reducedMotion}
          textScale={prefs.largeText ? 1.15 : 1}
          onSettings={() => {}}
          onScrubChange={onScrubChange}
          onTick={() => tick(prefs.sound, prefs.haptics)}
          onThemeTick={onThemeTick}
          onThemeSelect={onThemeSelect}
        />
        <ThemeDialOverlay
          theme={theme}
          themeDef={THEME_LIST[previewThemeIndex] ?? THEME_LIST[0]}
          left={prefs.left}
          statusBarVisible={prefs.statusBar}
          scale={scale}
          insets={insets}
          onJumpGroup={onJumpGroup}
          onCancel={onCancelTheme}
          onDone={onDoneTheme}
        />
      </>
    );
  }

  return (
    <>
      <Dial
        key={apps.map((app) => app.packageName).join("|")}
        apps={apps}
        theme={theme}
        left={prefs.left}
        layout={prefs.layout}
        reducedMotion={prefs.reducedMotion}
        textScale={prefs.largeText ? 1.15 : 1}
        showNotificationDots={prefs.dots}
        notificationPackageNames={notificationPackageNames}
        onLaunch={onLaunch}
        onMenu={onMenu}
        onSettings={onSettings}
        onScrubChange={onScrubChange}
        onTick={() => tick(prefs.sound, prefs.haptics)}
      />
      <HomeClock
        now={now}
        scale={scale}
        top={
          prefs.statusBar
            ? Math.max(84 * scale, insets.top + 44 * scale)
            : 28 * scale
        }
        width={width - 56 * scale}
        left={prefs.left}
        scrubbing={scrubbing}
        textScale={prefs.largeText ? 1.15 : 1}
        theme={theme}
        onPress={onOpenDateSettings}
        onDoubleTap={prefs.doubleTapSearch ? onOpenSearch : undefined}
        onSwipeUp={prefs.swipeUpSearch ? onOpenSearch : undefined}
        onSettings={onSettings}
      />
      <HomeStatus
        theme={theme}
        scale={scale}
        top={prefs.statusBar ? Math.max(22 * scale, insets.top + 8 * scale) : 16 * scale}
        left={!prefs.left}
        enabled={prefs.showDeviceStatus}
      />
      {prefs.showContextCards ? (
        <HomeContext
          theme={theme}
          scale={scale}
          top={prefs.statusBar ? Math.max(42 * scale, insets.top + 28 * scale) : 34 * scale}
          left={!prefs.left}
          nextAlarmAt={nextAlarmAt}
          nextEvent={nextEvent}
        />
      ) : null}
      {prefs.showMediaControls ? (
        <HomeMedia
          theme={theme}
          scale={scale}
          top={prefs.statusBar ? Math.max(68 * scale, insets.top + 54 * scale) : 60 * scale}
          left={!prefs.left}
          media={media}
          onControl={onMediaControl}
        />
      ) : null}
      {!scrubbing ? (
        <HomeSearchPill
          theme={theme}
          top={Math.min(height - 96 * scale, height - insets.bottom - 56 * scale)}
          left={prefs.left ? undefined : 24 * scale}
          right={prefs.left ? 24 * scale : undefined}
          height={44 * scale}
          scale={scale}
          transparency={prefs.searchButtonTransparency}
          onPress={onOpenSearch}
        />
      ) : null}
    </>
  );
}

const styles = {
  center: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 16,
  },
};
