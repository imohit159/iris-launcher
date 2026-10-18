import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PixelRatio,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { pickWallpaper } from "./src/wallpaper/picker";
import { wallpaperUri } from "./src/wallpaper/storage";
import { HomeClock } from "./src/components/HomeClock";
import { ThemeBackdrop } from "./src/components/ThemeBackdrop";
import { Dial } from "./src/components/Dial";
import { SearchSheet } from "./src/components/SearchSheet";
import { QuickMenu } from "./src/components/QuickMenu";
import { ThemeDialOverlay } from "./src/components/ThemeDialOverlay";
import { SettingsPanel } from "./src/components/SettingsPanel";
import { SettingButton } from "./src/components/SettingsPrimitives";
import {
  launch,
  loadApps,
  openAppDetails,
  openAppNotificationSettings,
  openDateSettings,
  openNotificationSettings,
  setHome,
  watchApps,
} from "./src/launcher/android";
import {
  favorites,
  type App as InstalledApp,
} from "./src/launcher/catalog";
import {
  defaults,
  readPreferences,
  savePreferences,
  themes,
  THEME_LIST,
  THEME_NAMES,
  type Preferences,
  type ThemeName,
} from "./src/preferences";
import { useFonts } from "expo-font";
import { DESIGN } from "./src/dial/reference";
import { tick } from "./src/feedback";
import { SURFACES, TYPOGRAPHY } from "./src/design/tokens";

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

function Home() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = width / DESIGN.width;
  const [fontsLoaded] = useFonts({
    JetBrainsMono: require("./assets/fonts/jetbrains_mono_regular.ttf"),
  });
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
  const [settingsScreen, setSettingsScreen] = useState<
    "root" | "wallpaper" | "dial"
  >("root");
  const [settingsScrolled, setSettingsScrolled] = useState(false);
  const [heldApp, setHeldApp] = useState<InstalledApp | null>(null);
  const [themeDialMode, setThemeDialMode] = useState(false);
  const [previewThemeIndex, setPreviewThemeIndex] = useState(0);
  const [themeTargetIndex, setThemeTargetIndex] = useState<number | null>(null);
  const previousThemeRef = useRef(prefs.theme);
  const [now, setNow] = useState(new Date());
  const alive = useRef(true);
  const writes = useRef(Promise.resolve());
  const theme = themes[prefs.theme];
  const wallpaperTheme = prefs.wallpaperTheme
    ? themes[prefs.wallpaperTheme]
    : null;
  // Semantic text roles keep hierarchy consistent across every settings screen.
  const headingColor = theme.light ? theme.fg : "#ffffff";
  const onDial = useMemo(
    () => favorites(apps, prefs.favorites),
    [apps, prefs.favorites],
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
  }, [refresh]);
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
      await launch(app);
      setPanel(null);
    } catch {
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
  const openSettings = useCallback(() => {
    setSettingsScrolled(false);
    setPanel("settings");
  }, []);
  const openLicenses = useCallback(() => {
    setSettingsScrolled(false);
    setPanel("licenses");
  }, []);
  const changeSettingsScreen = useCallback(
    (screen: "root" | "wallpaper" | "dial") => {
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
      {loading || !ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: theme.fg }}>{error}</Text>
          <SettingButton
            label="Try again"
            onPress={() => {
              setLoading(true);
              void refresh();
            }}
            backgroundColor={SURFACES.elevated}
            accentColor={theme.accent}
          />
        </View>
      ) : themeDialMode ? (
        <>
          <Dial
            key="theme-dial"
            themeMode
            themeNames={THEME_NAMES}
            initialIndex={previewThemeIndex}
            targetIndex={themeTargetIndex}
            apps={onDial}
            theme={theme}
            left={prefs.left}
            layout={prefs.layout}
            onSettings={() => {}}
            onScrubChange={setScrubbing}
            onTick={() => tick(prefs.sound, prefs.haptics)}
            onThemeTick={handleThemeTick}
            onThemeSelect={handleThemeDone}
          />
          <ThemeDialOverlay
            theme={theme}
            themeDef={THEME_LIST[previewThemeIndex] ?? THEME_LIST[0]}
            left={prefs.left}
            statusBarVisible={prefs.statusBar}
            scale={k}
            insets={insets}
            onJumpGroup={handleJumpGroup}
            onCancel={handleThemeCancel}
            onDone={handleThemeDone}
          />
        </>
      ) : (
        <>
          <Dial
            key={onDial.map((app) => app.packageName).join("|")}
            apps={onDial}
            theme={theme}
            left={prefs.left}
            layout={prefs.layout}
            onLaunch={(app) => {
              void open(app);
            }}
            onMenu={menu}
            onSettings={openSettings}
            onScrubChange={setScrubbing}
            onTick={() => tick(prefs.sound, prefs.haptics)}
          />
          <HomeClock
            now={now}
            scale={k}
            top={
              prefs.statusBar
                ? Math.max(84 * k, insets.top + 44 * k)
                : 28 * k
            }
            width={width - 56 * k}
            left={prefs.left}
            scrubbing={scrubbing}
            theme={theme}
            onPress={() => {
              void openDateSettings().catch(() => {
                Alert.alert(
                  "Settings unavailable",
                  "Could not open date and time settings.",
                );
              });
            }}
            onSettings={openSettings}
          />
          {!scrubbing && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search apps"
              onPress={() => setPanel("search")}
              style={[
                styles.searchPill,
                {
                  top: Math.min(
                    height - 96 * k,
                    height - insets.bottom - 56 * k,
                  ),
                  [prefs.left ? "right" : "left"]: 24 * k,
                  height: 44 * k,
                  paddingLeft: 14 * k,
                  paddingRight: 18 * k,
                  gap: 10 * k,
                  borderColor: `${theme.fg}38`,
                  backgroundColor: `${theme.bg}8c`,
                },
              ]}
            >
              <View style={{ width: 14 * k, height: 14 * k }}>
                <View
                  style={{
                    width: 9 * k,
                    height: 9 * k,
                    borderRadius: 9 * k,
                    borderWidth: 1.3 * k,
                    borderColor: theme.fg,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    width: 6 * k,
                    height: 1.3 * k,
                    left: 8 * k,
                    top: 10 * k,
                    backgroundColor: theme.fg,
                    transform: [{ rotate: "45deg" }],
                  }}
                />
              </View>
              <Text
                style={{
                  color: theme.fg,
                  fontSize: Number(TYPOGRAPHY.utility.fontSize) * k,
                  fontFamily: fontsLoaded ? "JetBrainsMono" : "monospace",
                }}
              >
                search
              </Text>
            </Pressable>
          )}
        </>
      )}

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
        onRemoveFromDial={() => {
          if (heldApp) favorite(heldApp.packageName);
        }}
      />

      {/* Detent SearchSheet */}
      <SearchSheet
        visible={panel === "search"}
        apps={apps}
        favorites={prefs.favorites}
        theme={theme}
        statusBarVisible={prefs.statusBar}
        onClose={() => setPanel(null)}
        onLaunch={(app) => {
          setPanel(null);
          void open(app);
        }}
        onToggleFavorite={favorite}
      />

      <SettingsPanel
        visible={panel === "settings" || panel === "licenses"}
        panel={panel === "licenses" ? "licenses" : "settings"}
        settingsScreen={settingsScreen}
        theme={theme}
        headingColor={headingColor}
        prefs={prefs}
        wallpaperTheme={prefs.wallpaperTheme}
        dialPreviewApps={dialPreviewApps}
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
        onLayoutChange={(index) => change("layout", index)}
        onLeftChange={(value) => change("left", value)}
        onDotsChange={(value) => change("dots", value)}
        onSoundChange={(value) => change("sound", value)}
        onHapticsChange={(value) => change("haptics", value)}
        onChooseApps={() => setPanel("search")}
      />
    </View>
  );
}
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Home />
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
  searchPill: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
