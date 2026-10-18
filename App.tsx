import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Image,
  Modal,
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
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
} from "./src/preferences";
import { useFonts } from "expo-font";
import { DESIGN, layouts } from "./src/dial/reference";
import notices from "./licenses/notices.json";
import { tick } from "./src/feedback";

function SettingButton({
  label,
  onPress,
  disabled = false,
  backgroundColor,
  accentColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  backgroundColor: string;
  accentColor: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={{ color: accentColor }}>{label}</Text>
    </Pressable>
  );
}

function WallpaperCard({
  uri,
  busy,
  disabled,
  backgroundColor,
  accentColor,
  onPress,
}: {
  uri: string | null;
  busy: boolean;
  disabled: boolean;
  backgroundColor: string;
  accentColor: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        uri ? "Change custom wallpaper" : "Choose custom wallpaper"
      }
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={[styles.wallpaperCard, { backgroundColor, opacity: disabled ? 0.5 : 1 }]}
    >
      {uri && (
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.wallpaperCardShade} />
      <Text style={[styles.wallpaperCardText, { color: accentColor }]}>
        {busy
          ? "Saving wallpaper…"
          : uri
            ? "Change wallpaper"
            : "Choose custom wallpaper"}
      </Text>
    </Pressable>
  );
}

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
  const [heldApp, setHeldApp] = useState<InstalledApp | null>(null);
  const [themeDialMode, setThemeDialMode] = useState(false);
  const [previewThemeIndex, setPreviewThemeIndex] = useState(0);
  const [themeTargetIndex, setThemeTargetIndex] = useState<number | null>(null);
  const previousThemeRef = useRef(prefs.theme);
  const [now, setNow] = useState(new Date());
  const alive = useRef(true);
  const writes = useRef(Promise.resolve());
  const theme = themes[prefs.theme];
  const onDial = useMemo(
    () => favorites(apps, prefs.favorites),
    [apps, prefs.favorites],
  );
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
      if (panel !== null) {
        setPanel(null);
        return true;
      }
      return false;
    });
    return () => back.remove();
  }, [heldApp, themeDialMode, panel]);
  useEffect(() => {
    if (ready)
      writes.current = writes.current
        .then(() => savePreferences(prefs))
        .catch(() =>
          Alert.alert("Settings not saved", "Try changing the setting again."),
        );
  }, [prefs, ready]);
  const change = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((previous) => ({ ...previous, [key]: value }));
  const favorite = (id: string) => {
    setPrefs((previous) => ({
      ...previous,
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
          : { ...previous, theme: themeDef.name },
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
  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar hidden={!prefs.statusBar} style={theme.light ? "dark" : "light"} />
      <ThemeBackdrop
        theme={theme}
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
            backgroundColor={theme.panel}
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
            onSettings={() => setPanel("settings")}
            onScrubChange={setScrubbing}
            onTick={() => tick(prefs.sound, prefs.haptics)}
          />
          <HomeClock
            now={now}
            scale={k}
            top={Math.max(84 * k, insets.top + 44 * k)}
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
            onSettings={() => setPanel("settings")}
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
                  fontSize: 13 * k,
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
        onClose={() => setPanel(null)}
        onLaunch={(app) => {
          setPanel(null);
          void open(app);
        }}
        onToggleFavorite={favorite}
      />

      <Modal
        visible={panel === "settings" || panel === "licenses"}
        animationType="slide"
        onRequestClose={() => setPanel(null)}
      >
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.fg }]}>
              {panel === "licenses" ? "licenses" : "make it yours"}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                change("setupDone", true);
                setPanel(null);
              }}
              style={styles.touch}
            >
              <Text style={{ color: theme.accent }}>Done</Text>
            </Pressable>
          </View>
          {panel === "licenses" ? (
            <ScrollView contentContainerStyle={styles.settings}>
              {Object.entries(notices).map(([name, text]) => (
                <View key={name}>
                  <Text style={[styles.title, { color: theme.accent }]}>
                    {name}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: theme.fg,
                      fontSize: 12,
                      lineHeight: 19,
                      marginVertical: 16,
                    }}
                  >
                    {text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.settings}>
              <Text style={[styles.note, { color: theme.muted }]}>
                A quiet home. Turn the dial. Find your focus.
              </Text>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>APPEARANCE</Text>
              <Text style={[styles.eyebrow, { color: theme.muted }]}>
                WALLPAPER
              </Text>
              <WallpaperCard
                uri={
                  prefs.customWallpaper
                    ? wallpaperUri(prefs.customWallpaper)
                    : null
                }
                busy={wallpaperBusy}
                disabled={wallpaperBusy || !ready}
                onPress={() => {
                  void chooseWallpaper();
                }}
                backgroundColor={theme.panel}
                accentColor={theme.accent}
              />
              {prefs.customWallpaper && (
                <SettingButton
                  label="Use theme wallpaper"
                  onPress={() => change("customWallpaper", null)}
                  disabled={wallpaperBusy}
                  backgroundColor={theme.panel}
                  accentColor={theme.accent}
                />
              )}
              <Text
                style={{
                  color: theme.muted,
                  fontSize: 13,
                  lineHeight: 20,
                  marginBottom: 24,
                }}
              >
                {prefs.customWallpaper
                  ? "Your photo · theme colours stay active."
                  : "Theme wallpaper. Choose a photo to make it yours."}
              </Text>
              <View style={styles.themeHeaderRow}>
                <Text
                  style={[
                    styles.eyebrow,
                    { color: theme.muted, marginBottom: 0 },
                  ]}
                >
                  THEME
                </Text>
                <Text
                  style={{
                    color: theme.fg,
                    fontSize: 13,
                    letterSpacing: 0.4,
                  }}
                >
                  {prefs.theme}
                </Text>
              </View>
              <SettingButton
                label="Turn dial to choose theme"
                onPress={startThemeDial}
                backgroundColor={theme.panel}
                accentColor={theme.accent}
              />
              <Text style={[styles.note, { color: theme.muted }]}>
                Turn the dial to preview all 27 themes. Press done to keep the
                theme under the notch.
              </Text>
              <Text style={[styles.eyebrow, { color: theme.muted }]}>DIAL</Text>
              {layouts.map((layout, index) => (
                <Pressable
                  key={layout.name}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: prefs.layout === index }}
                  onPress={() => change("layout", index)}
                  style={styles.setting}
                >
                  <Text
                    style={{
                      color: prefs.layout === index ? theme.accent : theme.fg,
                    }}
                  >
                    {layout.name}
                  </Text>
                </Pressable>
              ))}
              {(["left", "dots", "sound", "haptics"] as const).map(
                (key) => (
                  <View style={styles.setting} key={key}>
                    <Text style={{ color: theme.fg }}>
                      {key === "left"
                        ? "Dial on the left"
                        : key === "dots"
                            ? "Notification dots"
                            : key === "sound"
                              ? "Dial sound"
                              : "Haptics"}
                    </Text>
                    <Switch
                      accessibilityLabel={key}
                      value={prefs[key]}
                      onValueChange={(value) => change(key, value)}
                    />
                  </View>
                ),
              )}
              <SettingButton
                label="Choose apps for your dial"
                onPress={() => {
                  setPanel("search");
                }}
                backgroundColor={theme.panel}
                accentColor={theme.accent}
              />
              <Text style={[styles.note, { color: theme.muted }]}>Add your favorite apps from search to fill the dial.</Text>
              <Text style={[styles.note, { color: theme.muted }]}>Sound follows your phone’s ringer mode. System touch sounds can stay off.</Text>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>SYSTEM</Text>
              <View style={styles.setting}>
                <Text style={{ color: theme.fg }}>Status bar</Text>
                <Switch
                  accessibilityLabel="Status bar"
                  value={prefs.statusBar}
                  onValueChange={(value) => change("statusBar", value)}
                />
              </View>
              <SettingButton
                label="Manage app notifications"
                onPress={() => {
                  void openNotificationSettings().catch(() =>
                    Alert.alert(
                      "Notifications",
                      "Open Android Settings → Notifications to manage per-app switches.",
                    ),
                  );
                }}
                backgroundColor={theme.panel}
                accentColor={theme.accent}
              />
              <SettingButton
                label="Set Iris as your home app"
                onPress={() => {
                  void setHome().catch(() =>
                    Alert.alert(
                      "Choose Iris",
                      "Open Android Settings → Apps → Default apps → Home app.",
                    ),
                  );
                }}
                backgroundColor={theme.panel}
                accentColor={theme.accent}
              />
              <Text style={[styles.note, { color: theme.muted }]}>To switch back later: Android Settings → Apps → Default apps → Home app.</Text>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>ABOUT</Text>
              <SettingButton
                label="Open-source licenses"
                onPress={() => setPanel("licenses")}
                backgroundColor={theme.panel}
                accentColor={theme.accent}
              />
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  touch: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
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
  eyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 16 },
  button: { padding: 20, borderRadius: 16, marginBottom: 12 },
  title: { fontSize: 25, fontWeight: "300" },
  input: { margin: 24, padding: 16, borderRadius: 14, fontSize: 16 },
  note: {
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24 },
  app: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  icon: { width: 40, height: 40, borderRadius: 10 },
  settings: { padding: 24 },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 18,
    marginBottom: 16,
  },
  wallpaperCard: {
    minHeight: 180,
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  wallpaperCardShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  wallpaperCardText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  themeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
});
