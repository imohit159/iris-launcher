import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  BackHandler,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PixelRatio,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { pickWallpaper } from "../wallpaper/picker";
import { wallpaperUri } from "../wallpaper/storage";
import { BlueprintOverlay } from "../components/BlueprintOverlay";
import { LaunchTransition } from "../components/LaunchTransition";
import { ThemeBackdrop } from "../components/ThemeBackdrop";
import { SearchSheet } from "../components/SearchSheet";
import { QuickMenu } from "../components/QuickMenu";
import { SettingsPanel } from "../components/SettingsPanel";
import { HomeSurface } from "./HomeSurface";
import {
  launch,
  loadApps,
  openAppDetails,
  openAppNotificationSettings,
  openDateSettings,
  openNotificationSettings,
  setHome,
  watchApps,
} from "../launcher/android";
import {
  favorites,
  type App as InstalledApp,
} from "../launcher/catalog";
import {
  defaults,
  readPreferences,
  savePreferences,
  themes,
  THEME_LIST,
  type Preferences,
  type ThemeName,
} from "../preferences";
import { DESIGN } from "../dial/reference";
import { tick } from "../feedback";
import type { SettingsScreen } from "../settings/types";
import { activeThemeName } from "../themes/schedule";
import { parseBackup } from "../preferences/backup";
import { exportBackupFile, importBackupFile } from "../preferences/fileBackup";
import {
  restoreLocalBackup,
  saveLocalBackup,
} from "../preferences/backupStorage";
import { useNotificationIndicators } from "../notifications/useNotificationIndicators";
import { useContextualInfo } from "../context/useContextualInfo";
import { useMediaControls } from "../context/useMediaControls";
import { useAppShortcuts } from "../launcher/useAppShortcuts";

const PREVIEW_DIAL_APPS: InstalledApp[] = [
  { label: "Chrome", packageName: "preview.chrome", icon: "" },
  { label: "Clock", packageName: "preview.clock", icon: "" },
  { label: "Contacts", packageName: "preview.contacts", icon: "" },
  { label: "Drive", packageName: "preview.drive", icon: "" },
  { label: "Files", packageName: "preview.files", icon: "" },
  { label: "Gmail", packageName: "preview.gmail", icon: "" },
  { label: "Maps", packageName: "preview.maps", icon: "" },
  { label: "Messages", packageName: "preview.messages", icon: "" },
];

export function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const k = width / DESIGN.width;
  const [scrubbing, setScrubbing] = useState(false);
  const [wallpaperBusy, setWallpaperBusy] = useState(false);
  const wallpaperOperation = useRef(false);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [prefs, setPrefs] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"search" | "settings" | "licenses" | null>(
    null,
  );
  const [settingsScreen, setSettingsScreen] = useState<SettingsScreen>("root");
  const [settingsScrolled, setSettingsScrolled] = useState(false);
  const [heldApp, setHeldApp] = useState<InstalledApp | null>(null);
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);
  const [themeDialMode, setThemeDialMode] = useState(false);
  const [previewThemeIndex, setPreviewThemeIndex] = useState(0);
  const [themeTargetIndex, setThemeTargetIndex] = useState<number | null>(null);
  const previousThemeRef = useRef(prefs.theme);
  const [now, setNow] = useState(new Date());
  const {
    capability: notificationCapability,
    packageNames: notificationPackageNames,
    refresh: refreshNotifications,
    openSettings: openNotificationAccess,
  } = useNotificationIndicators();
  const {
    calendarCapability,
    nextAlarmAt,
    nextEvent,
    refresh: refreshContext,
    requestCalendar,
  } = useContextualInfo();
  const {
    capability: mediaCapability,
    media,
    refresh: refreshMedia,
    control: controlMedia,
  } = useMediaControls();
  const {
    capability: shortcutCapability,
    shortcuts,
    refresh: refreshShortcuts,
    launch: launchShortcut,
  } = useAppShortcuts();
  const alive = useRef(true);
  const writes = useRef(Promise.resolve());
  const activeTheme = activeThemeName({
    manualTheme: prefs.theme,
    mode: prefs.themeMode,
    systemScheme:
      systemColorScheme === "light" || systemColorScheme === "dark"
        ? systemColorScheme
        : null,
    dayTheme: prefs.dayTheme,
    nightTheme: prefs.nightTheme,
    hour: now.getHours(),
    dayStart: prefs.dayStartHour,
    nightStart: prefs.nightStartHour,
  });
  const baseTheme = themes[activeTheme];
  const theme = prefs.highContrast
    ? { ...baseTheme, muted: baseTheme.fg, muted2: baseTheme.fg }
    : baseTheme;
  const wallpaperTheme = prefs.wallpaperTheme
    ? themes[prefs.wallpaperTheme]
    : null;
  // Semantic text roles keep hierarchy consistent across every settings screen.
  const headingColor = theme.light ? theme.fg : "#ffffff";
  const labeledApps = useMemo(
    () =>
      apps.map((app) => ({
        ...app,
        label: prefs.customLabels[app.packageName] || app.label,
      })),
    [apps, prefs.customLabels],
  );
  const visibleApps = useMemo(
    () =>
      labeledApps.filter((app) => !prefs.hiddenApps.includes(app.packageName)),
    [labeledApps, prefs.hiddenApps],
  );
  const onDial = useMemo(
    () => favorites(visibleApps, prefs.favorites),
    [visibleApps, prefs.favorites],
  );
  const dialPreviewApps = onDial.length ? onDial : PREVIEW_DIAL_APPS;
  const refresh = useCallback(async () => {
    try {
      const list = await loadApps();
      if (alive.current) {
        setApps((previous) =>
          JSON.stringify(previous) === JSON.stringify(list) ? previous : list,
        );
        setError(list.length ? "" : "No launchable apps were found.");
      }
    } catch {
      if (alive.current) setError("Could not load your apps. Try again.");
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    void refreshNotifications();
    void refreshContext();
    void refreshMedia();
    readPreferences()
      .then((value) => {
        if (alive.current) {
          setPrefs(value);
          const idx = THEME_LIST.findIndex((t) => t.name === value.theme);
          setPreviewThemeIndex(idx >= 0 ? idx : 0);
          previousThemeRef.current = value.theme;
          if (!value.setupDone) setPanel("settings");
        }
      })
      .catch(() =>
        Alert.alert(
          "Settings unavailable",
          "Saved settings could not be read.",
        ),
      )
      .finally(() => {
        if (alive.current) {
          setReady(true);
          void refresh();
        }
      });
    const stop = watchApps(() => {
      void refresh();
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setNow(new Date());
        void refreshNotifications();
        void refreshContext();
        void refreshMedia();
        void refresh();
      }
    });
    let timer: ReturnType<typeof setTimeout>;
    const updateClock = () => {
      const current = new Date();
      setNow(current);
      timer = setTimeout(updateClock, 60000 - (current.getTime() % 60000) + 20);
    };
    updateClock();
    return () => {
      alive.current = false;
      stop();
      subscription.remove();
      clearTimeout(timer);
    };
  }, [refresh, refreshContext, refreshMedia, refreshNotifications]);
  useEffect(() => {
    if (ready)
      writes.current = writes.current
        .then(() => savePreferences(prefs))
        .catch(() =>
          Alert.alert("Settings not saved", "Try changing the setting again."),
        );
  }, [prefs, ready]);
  const handleSettingsBack = useCallback(() => {
    if (panel === "settings" && settingsScreen !== "root") {
      setSettingsScreen("root");
      setSettingsScrolled(false);
      return true;
    }
    if (panel !== null) {
      if (panel === "settings") {
        setSettingsScreen("root");
        setPrefs((previous) => ({ ...previous, setupDone: true }));
      }
      setSettingsScrolled(false);
      setPanel(null);
      return true;
    }
    return false;
  }, [panel, settingsScreen]);
  useEffect(() => {
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      if (heldApp) {
        setHeldApp(null);
        return true;
      }
      if (themeDialMode) {
        setPrefs((previous) => ({
          ...previous,
          theme: previousThemeRef.current,
        }));
        setThemeDialMode(false);
        return true;
      }
      return handleSettingsBack();
    });
    return () => back.remove();
  }, [handleSettingsBack, heldApp, themeDialMode]);
  useEffect(() => {
    if (heldApp) void refreshShortcuts(heldApp.packageName);
  }, [heldApp, refreshShortcuts]);
  const change = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((previous) => ({ ...previous, [key]: value, setupDone: true }));
  const favorite = (id: string) => {
    setPrefs((previous) => ({
      ...previous,
      setupDone: true,
      favorites: previous.favorites.includes(id)
        ? previous.favorites.filter((item) => item !== id)
        : [...previous.favorites, id],
    }));
  };
  const open = async (app: InstalledApp) => {
    try {
      if (prefs.launchAnimation && !prefs.reducedMotion) {
        setLaunchingApp(app.label);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
      await launch(app);
      setPrefs((previous) => ({
        ...previous,
        recentApps: [
          app.packageName,
          ...previous.recentApps.filter((id) => id !== app.packageName),
        ].slice(0, 12),
      }));
      setPanel(null);
      setLaunchingApp(null);
    } catch {
      setLaunchingApp(null);
      Alert.alert(
        "Could not open app",
        `${app.label} may have been removed or disabled.`,
      );
      void refresh();
    }
  };
  const menu = (app: InstalledApp) => {
    setHeldApp(app);
  };
  const hideApp = (app: InstalledApp) => {
    setPrefs((previous) => ({
      ...previous,
      hiddenApps: previous.hiddenApps.includes(app.packageName)
        ? previous.hiddenApps.filter((id) => id !== app.packageName)
        : [...previous.hiddenApps, app.packageName],
      favorites: previous.favorites.filter((id) => id !== app.packageName),
      setupDone: true,
    }));
  };
  const renameApp = (packageName: string, label: string) => {
    const next = label.trim();
    setPrefs((previous) => {
      const customLabels = { ...previous.customLabels };
      const original = apps.find((app) => app.packageName === packageName)?.label;
      if (!next || next === original) delete customLabels[packageName];
      else customLabels[packageName] = next;
      return { ...previous, customLabels, setupDone: true };
    });
  };
  const categorizeApp = (packageName: string, category: string) => {
    const next = category.trim();
    setPrefs((previous) => {
      const customCategories = { ...previous.customCategories };
      if (!next) delete customCategories[packageName];
      else customCategories[packageName] = next;
      return { ...previous, customCategories, setupDone: true };
    });
  };
  const moveFavorite = (packageName: string, direction: -1 | 1) => {
    setPrefs((previous) => {
      const index = previous.favorites.indexOf(packageName);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= previous.favorites.length)
        return previous;
      const favorites = [...previous.favorites];
      [favorites[index], favorites[nextIndex]] = [favorites[nextIndex], favorites[index]];
      return { ...previous, favorites, setupDone: true };
    });
  };
  const exportBackup = () => {
    void saveLocalBackup(prefs)
      .then(() =>
        Alert.alert("Backup saved", "A private backup is stored on this device."),
      )
      .catch(() =>
        Alert.alert("Backup unavailable", "Iris could not save the local backup."),
      );
  };
  const exportPortableBackup = () => {
    void exportBackupFile(prefs)
      .then((result) => {
        if (result === "cancelled") return;
        Alert.alert("Backup exported", "Your Iris JSON backup is ready to move or copy.");
      })
      .catch(() =>
        Alert.alert("Export unavailable", "Iris could not write the backup file."),
      );
  };
  const restoreBackup = (raw: string) => {
    try {
      const restored = parseBackup(raw);
      setPrefs({ ...restored, setupDone: true });
      Alert.alert("Backup restored", "Your Iris preferences are active now.");
    } catch {
      Alert.alert(
        "Backup rejected",
        "That text is not a valid Iris preferences backup.",
      );
    }
  };
  const restoreLocal = () => {
    void restoreLocalBackup()
      .then((restored) => {
        if (!restored) {
          Alert.alert("No backup found", "Save a local backup before restoring it.");
          return;
        }
        setPrefs({ ...restored, setupDone: true });
        Alert.alert("Backup restored", "Your local Iris backup is active now.");
      })
      .catch(() =>
        Alert.alert("Backup rejected", "The saved local backup is invalid."),
      );
  };
  const importPortableBackup = () => {
    void importBackupFile()
      .then((restored) => {
        if (!restored) return;
        setPrefs({ ...restored, setupDone: true });
        Alert.alert("Backup imported", "Your Iris preferences are active now.");
      })
      .catch(() =>
        Alert.alert("Backup rejected", "That file is not a valid Iris preferences backup."),
      );
  };
  const openSettings = useCallback(() => {
    setSettingsScrolled(false);
    setPanel("settings");
  }, []);
  const openLicenses = useCallback(() => {
    setSettingsScrolled(false);
    setPanel("licenses");
  }, []);
  const changeSettingsScreen = useCallback(
    (screen: SettingsScreen) => {
      setSettingsScrolled(false);
      setSettingsScreen(screen);
    },
    [],
  );
  const startThemeDial = () => {
    previousThemeRef.current = prefs.theme;
    const idx = THEME_LIST.findIndex((t) => t.name === prefs.theme);
    setPreviewThemeIndex(idx >= 0 ? idx : 0);
    setThemeTargetIndex(idx >= 0 ? idx : 0);
    setPanel(null);
    setThemeDialMode(true);
  };
  const handleThemeTick = useCallback((index: number) => {
    setPreviewThemeIndex(index);
    const themeDef = THEME_LIST[index];
    if (themeDef) {
      setPrefs((previous) =>
        previous.theme === themeDef.name
          ? previous
          : { ...previous, theme: themeDef.name, setupDone: true },
      );
    }
  }, []);
  const handleThemeDone = () => {
    setThemeDialMode(false);
  };
  const handleThemeCancel = () => {
    setPrefs((previous) => ({
      ...previous,
      theme: previousThemeRef.current,
    }));
    setThemeDialMode(false);
  };
  const handleJumpGroup = (group: "phone" | "omarchy") => {
    const first = THEME_LIST.findIndex((t) => t.group === group);
    if (first >= 0) {
      setThemeTargetIndex(first);
      tick(prefs.sound, prefs.haptics);
    }
  };
  const chooseWallpaper = async () => {
    if (wallpaperOperation.current || !ready) return;
    wallpaperOperation.current = true;
    setWallpaperBusy(true);
    try {
      const name = await pickWallpaper(
        PixelRatio.getPixelSizeForLayoutSize(width),
        PixelRatio.getPixelSizeForLayoutSize(height),
      );
      if (alive.current && name) change("customWallpaper", name);
    } catch {
      if (alive.current)
        Alert.alert(
          "Wallpaper unavailable",
          "Could not use that photo. Try another image.",
        );
    } finally {
      wallpaperOperation.current = false;
      if (alive.current) setWallpaperBusy(false);
    }
  };
  const handleSettingsScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextScrolled = event.nativeEvent.contentOffset.y > 0;
      setSettingsScrolled((previous) =>
        previous === nextScrolled ? previous : nextScrolled,
      );
    },
    [],
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar hidden={!prefs.statusBar} style={theme.light ? "dark" : "light"} />
      <ThemeBackdrop
        theme={theme}
        wallpaperTheme={wallpaperTheme}
        left={prefs.left}
        customWallpaper={
          prefs.customWallpaper ? wallpaperUri(prefs.customWallpaper) : null
        }
        dimming={prefs.wallpaperDimming}
        wallpaperBlur={prefs.wallpaperBlur}
        wallpaperTint={prefs.wallpaperTint}
        wallpaperGrain={prefs.wallpaperGrain}
        onWallpaperError={() => {
          const failed = prefs.customWallpaper;
          if (!failed) return;
          setPrefs((previous) =>
            previous.customWallpaper === failed
              ? { ...previous, customWallpaper: null }
              : previous,
          );
          Alert.alert(
            "Wallpaper unavailable",
            "Your theme wallpaper is shown. Choose another photo in settings.",
          );
        }}
      />
      <HomeSurface
        loading={loading}
        ready={ready}
        error={error}
        themeDialMode={themeDialMode}
        width={width}
        height={height}
        scale={k}
        insets={insets}
        theme={theme}
        prefs={prefs}
        apps={onDial}
        now={now}
        scrubbing={scrubbing}
        previewThemeIndex={previewThemeIndex}
        themeTargetIndex={themeTargetIndex}
        notificationPackageNames={notificationPackageNames}
        nextAlarmAt={nextAlarmAt}
        nextEvent={nextEvent}
        media={media}
        onRetry={() => {
          setLoading(true);
          void refresh();
        }}
        onScrubChange={setScrubbing}
        onThemeTick={handleThemeTick}
        onThemeSelect={handleThemeDone}
        onJumpGroup={handleJumpGroup}
        onCancelTheme={handleThemeCancel}
        onDoneTheme={handleThemeDone}
        onLaunch={(app) => {
          void open(app);
        }}
        onMenu={menu}
        onSettings={openSettings}
        onOpenSearch={() => setPanel("search")}
        onOpenDateSettings={() => {
          void openDateSettings().catch(() => {
            Alert.alert(
              "Settings unavailable",
              "Could not open date and time settings.",
            );
          });
        }}
        onMediaControl={(action) => {
          void controlMedia(action);
        }}
      />

      {/* Detent QuickMenu popup card on long press */}
      <QuickMenu
        app={heldApp}
        theme={theme}
        left={prefs.left}
        scale={k}
        centerY={height / 2}
        onClose={() => setHeldApp(null)}
        onAppInfo={() => {
          if (heldApp) void openAppDetails(heldApp.packageName);
        }}
        onAppNotifications={() => {
          if (heldApp) void openAppNotificationSettings(heldApp.packageName);
        }}
        shortcuts={shortcuts}
        shortcutCapability={shortcutCapability}
        onShortcut={(shortcut) => {
          if (!heldApp) return;
          void launchShortcut(heldApp.packageName, shortcut.id).then((started) => {
            if (!started) {
              Alert.alert(
                "Shortcut unavailable",
                "This app could not open that shortcut.",
              );
            }
          });
        }}
        onRemoveFromDial={() => {
          if (heldApp) favorite(heldApp.packageName);
        }}
        onHideApp={() => {
          if (heldApp) hideApp(heldApp);
        }}
      />

      <LaunchTransition
        label={launchingApp}
        theme={theme}
        reducedMotion={prefs.reducedMotion}
      />

      {/* Detent SearchSheet */}
      <SearchSheet
        visible={panel === "search"}
        apps={labeledApps}
        favorites={prefs.favorites}
        hiddenApps={prefs.hiddenApps}
        customCategories={prefs.customCategories}
        recentApps={prefs.recentApps}
        showRecentApps={prefs.showRecentApps}
        theme={theme}
        statusBarVisible={prefs.statusBar}
        searchListTransparency={prefs.searchListTransparency}
        iconStyle={prefs.iconStyle}
        onClose={() => setPanel(null)}
        onLaunch={(app) => {
          setPanel(null);
          void open(app);
        }}
        onToggleFavorite={favorite}
        onToggleHidden={(packageName) => {
          const app = labeledApps.find((item) => item.packageName === packageName);
          if (app) hideApp(app);
        }}
      />

      <SettingsPanel
        visible={panel === "settings" || panel === "licenses"}
        panel={panel === "licenses" ? "licenses" : "settings"}
        settingsScreen={settingsScreen}
        theme={theme}
        activeThemeName={activeTheme}
        headingColor={headingColor}
        prefs={prefs}
        wallpaperTheme={prefs.wallpaperTheme}
        dialPreviewApps={dialPreviewApps}
        installedApps={labeledApps}
        customWallpaperUri={
          prefs.customWallpaper ? wallpaperUri(prefs.customWallpaper) : null
        }
        wallpaperBusy={wallpaperBusy}
        ready={ready}
        settingsScrolled={settingsScrolled}
        onRequestClose={() => {
          handleSettingsBack();
        }}
        onBack={() => setSettingsScreen("root")}
        onScroll={handleSettingsScroll}
        onSettingsScreenChange={changeSettingsScreen}
        onStatusBarChange={(value) => change("statusBar", value)}
        onOpenNotifications={() => {
          void openNotificationSettings().catch(() =>
            Alert.alert(
              "Notifications",
              "Open Android Settings → Notifications to manage per-app switches.",
            ),
          );
        }}
        onSetHome={() => {
          void setHome().catch(() =>
            Alert.alert(
              "Choose Iris",
              "Open Android Settings → Apps → Default apps → Home app.",
            ),
          );
        }}
        onOpenLicenses={openLicenses}
        onStartThemeDial={startThemeDial}
        onChooseWallpaper={() => void chooseWallpaper()}
        onSelectThemeWallpaper={(themeName: ThemeName) =>
          setPrefs((previous) => ({
            ...previous,
            wallpaperTheme: themeName,
            customWallpaper: null,
            setupDone: true,
          }))
        }
        onWallpaperDimmingChange={(value) => change("wallpaperDimming", value)}
        onWallpaperBlurChange={(value) => change("wallpaperBlur", value)}
        onWallpaperTintChange={(value) => change("wallpaperTint", value)}
        onWallpaperGrainChange={(value) => change("wallpaperGrain", value)}
        onLayoutChange={(index) => change("layout", index)}
        onLeftChange={(value) => change("left", value)}
        onDotsChange={(value) => change("dots", value)}
        onSoundChange={(value) => change("sound", value)}
        onHapticsChange={(value) => change("haptics", value)}
        onSearchListTransparencyChange={(value) =>
          change("searchListTransparency", value)
        }
        onSearchButtonTransparencyChange={(value) =>
          change("searchButtonTransparency", value)
        }
        onShowRecentAppsChange={(value) => change("showRecentApps", value)}
        onLaunchAnimationChange={(value) => change("launchAnimation", value)}
        onDoubleTapSearchChange={(value) => change("doubleTapSearch", value)}
        onSwipeUpSearchChange={(value) => change("swipeUpSearch", value)}
        onThemeModeChange={(value) => change("themeMode", value)}
        onDayThemeChange={(value) => change("dayTheme", value)}
        onNightThemeChange={(value) => change("nightTheme", value)}
        onDayStartHourChange={(value) => change("dayStartHour", value)}
        onNightStartHourChange={(value) => change("nightStartHour", value)}
        onReducedMotionChange={(value) => change("reducedMotion", value)}
        onLargeTextChange={(value) => change("largeText", value)}
        onHighContrastChange={(value) => change("highContrast", value)}
        onShowDeviceStatusChange={(value) => change("showDeviceStatus", value)}
        onShowBlueprintChange={(value) => change("showBlueprint", value)}
        showContextCards={prefs.showContextCards}
        calendarCapability={calendarCapability}
        nextAlarmAt={nextAlarmAt}
        nextEvent={nextEvent}
        onShowContextCardsChange={(value) => change("showContextCards", value)}
        onRequestCalendar={() => {
          void requestCalendar();
        }}
        showMediaControls={prefs.showMediaControls}
        mediaCapability={mediaCapability}
        media={media}
        onShowMediaControlsChange={(value) => change("showMediaControls", value)}
        onMediaControl={(action) => {
          void controlMedia(action);
        }}
        onRenameApp={renameApp}
        onCategorizeApp={categorizeApp}
        onToggleFavorite={favorite}
        onToggleHidden={(packageName) => {
          const app = labeledApps.find((item) => item.packageName === packageName);
          if (app) hideApp(app);
        }}
        onMoveFavorite={moveFavorite}
        onIconStyleChange={(value) => change("iconStyle", value)}
        onExportBackup={exportBackup}
        onExportBackupFile={exportPortableBackup}
        onRestoreBackup={restoreBackup}
        onRestoreLocalBackup={restoreLocal}
        onImportBackupFile={importPortableBackup}
        onChooseApps={() => setPanel("search")}
        notificationCapability={notificationCapability}
        onOpenNotificationAccess={openNotificationAccess}
      />
      <BlueprintOverlay enabled={prefs.showBlueprint} />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});
