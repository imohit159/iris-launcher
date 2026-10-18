import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as IntentLauncher from "expo-intent-launcher";
import { Dial } from "./src/components/Dial";
import {
  launch,
  loadApps,
  openClock,
  setHome,
  watchApps,
} from "./src/launcher/android";
import {
  favorites,
  iconUri,
  search,
  type App as InstalledApp,
} from "./src/launcher/catalog";
import {
  defaults,
  readPreferences,
  savePreferences,
  themes,
  type Preferences,
} from "./src/preferences";
import { useFonts } from "expo-font";
import { DESIGN, layouts } from "./src/dial/reference";
import notices from "./licenses/notices.json";
import { tick } from "./src/feedback";

function Home() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = width / DESIGN.width;
  const [fontsLoaded] = useFonts({
    JetBrainsMono: require("./assets/fonts/jetbrains_mono_regular.ttf"),
  });
  const [scrubbing, setScrubbing] = useState(false);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [prefs, setPrefs] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"search" | "settings" | "licenses" | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(new Date());
  const alive = useRef(true);
  const writes = useRef(Promise.resolve());
  const theme = themes[prefs.theme];
  const onDial = useMemo(
    () => favorites(apps, prefs.favorites),
    [apps, prefs.favorites],
  );
  const results = useMemo(() => search(apps, query), [apps, query]);
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
        if (alive.current) setReady(true);
      });
    void refresh();
    const stop = watchApps(() => {
      void refresh();
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setNow(new Date());
        void refresh();
      }
    });
    const timer = setInterval(() => setNow(new Date()), 15000);
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      setPanel(null);
      return true;
    });
    return () => {
      alive.current = false;
      stop();
      subscription.remove();
      back.remove();
      clearInterval(timer);
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
      setQuery("");
    } catch {
      Alert.alert(
        "Could not open app",
        `${app.label} may have been removed or disabled.`,
      );
      void refresh();
    }
  };
  const menu = (app: InstalledApp) =>
    Alert.alert(app.label, "Manage this app", [
      {
        text: "App info",
        onPress: () => {
          void IntentLauncher.startActivityAsync(
            "android.settings.APPLICATION_DETAILS_SETTINGS",
            { data: `package:${app.packageName}` },
          ).catch(() =>
            Alert.alert("Unavailable", "Could not open app settings."),
          );
        },
      },
      { text: "Remove from dial", onPress: () => favorite(app.packageName) },
      { text: "Cancel", style: "cancel" },
    ]);
  const button = (label: string, action: () => void) => (
    <Pressable
      accessibilityRole="button"
      onPress={action}
      style={[styles.button, { backgroundColor: theme.panel }]}
    >
      <Text style={{ color: theme.accent }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar style={prefs.theme === "paper" ? "dark" : "light"} />
      {loading || !ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: theme.fg }}>{error}</Text>
          {button("Try again", () => {
            setLoading(true);
            void refresh();
          })}
        </View>
      ) : (
        <Dial
          key={onDial.map((app) => app.packageName).join("|")}
          apps={onDial}
          theme={theme}
          left={prefs.left}
          onLaunch={(app) => {
            void open(app);
          }}
          onMenu={menu}
          layout={prefs.layout}
          onSettings={() => setPanel("settings")}
          onScrubChange={setScrubbing}
          onTick={() => tick(prefs.sound, prefs.haptics)}
        />
      )}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.brand, { color: theme.accent }]}>
          iris <Text style={{ color: theme.muted }}> / home</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => setPanel("settings")}
          style={styles.touch}
        >
          <Text style={{ color: theme.muted, fontSize: 24 }}>☷</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => {
          try {
            openClock();
          } catch {
            Alert.alert("Clock unavailable");
          }
        }}
        onLongPress={() => setPanel("settings")}
        accessibilityRole="button"
        accessibilityLabel="Open clock; hold for settings"
        style={[styles.clockBlock, { opacity: scrubbing ? 0 : 1 }]}
        pointerEvents={scrubbing ? "none" : "auto"}
      >
        <Text style={[styles.clock, { color: theme.fg }]}>
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </Text>
        <Text style={[styles.date, { color: theme.muted }]}>
          {now
            .toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
            .toLocaleLowerCase()}
        </Text>
      </Pressable>
      {!scrubbing && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search apps"
          onPress={() => {
            setQuery("");
            setPanel("search");
          }}
          style={[
            styles.searchPill,
            {
              top: Math.min(height - 96 * k, height - insets.bottom - 56 * k),
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
      <Modal
        visible={panel !== null}
        animationType="slide"
        onRequestClose={() => setPanel(null)}
      >
        <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.fg }]}>
              {panel === "search"
                ? "your apps"
                : panel === "licenses"
                  ? "licenses"
                  : "make it yours"}
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
          {panel === "search" ? (
            <>
              <TextInput
                accessibilityLabel="Search installed apps"
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Find an app…"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  { backgroundColor: theme.panel, color: theme.fg },
                ]}
              />
              <Text style={[styles.note, { color: theme.muted }]}>
                Tap + to add an app to your dial.
              </Text>
              <FlatList
                data={results}
                keyExtractor={(app) => app.packageName}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={[styles.note, { color: theme.muted }]}>
                    No matching apps.
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        void open(item);
                      }}
                      style={styles.app}
                    >
                      {item.icon ? (
                        <Image
                          source={{ uri: iconUri(item.icon) }}
                          style={styles.icon}
                        />
                      ) : null}
                      <Text
                        numberOfLines={1}
                        style={{ color: theme.fg, flex: 1, fontSize: 16 }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${prefs.favorites.includes(item.packageName) ? "Remove" : "Add"} ${item.label} ${prefs.favorites.includes(item.packageName) ? "from" : "to"} dial`}
                      onPress={() => favorite(item.packageName)}
                      style={styles.touch}
                    >
                      <Text style={{ color: theme.accent, fontSize: 24 }}>
                        {prefs.favorites.includes(item.packageName) ? "−" : "+"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              />
            </>
          ) : panel === "licenses" ? (
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
              <Text style={[styles.eyebrow, { color: theme.muted }]}>
                COLOUR
              </Text>
              <View style={styles.swatches}>
                {(Object.keys(themes) as (keyof typeof themes)[]).map(
                  (name) => (
                    <Pressable
                      key={name}
                      accessibilityRole="button"
                      accessibilityState={{ selected: prefs.theme === name }}
                      onPress={() => change("theme", name)}
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: themes[name].panel,
                          borderColor:
                            prefs.theme === name ? theme.accent : theme.panel,
                        },
                      ]}
                    >
                      <Text style={{ color: themes[name].accent }}>{name}</Text>
                    </Pressable>
                  ),
                )}
              </View>
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
              {(["left", "sound", "haptics"] as const).map((key) => (
                <View style={styles.setting} key={key}>
                  <Text style={{ color: theme.fg }}>
                    {key === "left"
                      ? "Dial on the left"
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
              ))}
              <Text style={[styles.note, { color: theme.muted }]}>
                Sound follows your phone’s ringer mode. System touch sounds can
                stay off. Add your favorite apps from search to fill the dial.
              </Text>
              {button("Choose apps for your dial", () => {
                setQuery("");
                setPanel("search");
              })}
              {button("Open-source licenses", () => setPanel("licenses"))}
              {button("Set Iris as your home app", () => {
                void setHome().catch(() =>
                  Alert.alert(
                    "Choose Iris",
                    "Open Android Settings → Apps → Default apps → Home app.",
                  ),
                );
              })}
              <Text style={[styles.note, { color: theme.muted }]}>
                To switch back later: Android Settings → Apps → Default apps →
                Home app.
              </Text>
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
  brand: { fontSize: 15, letterSpacing: 2 },
  touch: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  clockBlock: { paddingHorizontal: 28, paddingTop: 24 },
  clock: {
    fontSize: 76,
    fontWeight: "200",
    letterSpacing: -4,
    fontVariant: ["tabular-nums"],
  },
  date: { fontSize: 12, letterSpacing: 1 },
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
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  swatch: { padding: 16, borderRadius: 12, borderWidth: 1 },
  setting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
});
