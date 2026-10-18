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
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  letterIndex,
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
import { tick } from "./src/feedback";

function Home() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [prefs, setPrefs] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"search" | "settings" | "letters" | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(new Date());
  const [jump, setJump] = useState(-1);
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
    setJump(-1);
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
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar style={prefs.theme === "paper" ? "dark" : "light"} />
      <View style={styles.header}>
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
        style={styles.clockBlock}
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
          jump={jump}
          onLaunch={(app) => {
            void open(app);
          }}
          onMenu={menu}
          onAlphabet={() => setPanel("letters")}
          onTick={() => tick(prefs.sound, prefs.haptics)}
        />
      )}
      <View style={styles.footer}>
        <Text style={[styles.eyebrow, { color: theme.muted }]}>
          A LITTLE LESS NOISE.
        </Text>
        {button("search apps  ↗", () => {
          setQuery("");
          setPanel("search");
        })}
      </View>
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
                : panel === "letters"
                  ? "jump to a letter"
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
          ) : panel === "letters" ? (
            <ScrollView contentContainerStyle={styles.letters}>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                const index = letterIndex(onDial, letter);
                return (
                  <Pressable
                    key={letter}
                    accessibilityRole="button"
                    accessibilityLabel={`Jump to ${letter}`}
                    disabled={index < 0}
                    onPress={() => {
                      tick(prefs.sound, prefs.haptics, true);
                      setJump(-1);
                      setPanel(null);
                      setTimeout(() => setJump(index), 0);
                    }}
                    style={[
                      styles.letter,
                      {
                        backgroundColor: theme.panel,
                        opacity: index < 0 ? 0.25 : 1,
                      },
                    ]}
                  >
                    <Text style={{ color: theme.accent, fontSize: 24 }}>
                      {letter}
                    </Text>
                  </Pressable>
                );
              })}
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
                Sound follows your phone’s ringer mode and system touch sounds.
                Add your favorite apps from search to fill the dial.
              </Text>
              {button("Choose apps for your dial", () => {
                setQuery("");
                setPanel("search");
              })}
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
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Home />
    </SafeAreaProvider>
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  footer: { padding: 24 },
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
  letters: { padding: 24, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  letter: {
    width: 58,
    height: 58,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
