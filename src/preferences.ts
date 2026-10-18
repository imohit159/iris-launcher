import AsyncStorage from "@react-native-async-storage/async-storage";
export const themes = {
  dusk: {
    bg: "#111814",
    fg: "#e5e9dc",
    muted: "#829080",
    accent: "#c2e69a",
    panel: "#1d281f",
  },
  ember: {
    bg: "#201712",
    fg: "#f4e5d6",
    muted: "#ad8b77",
    accent: "#f3a874",
    panel: "#33231b",
  },
  signal: {
    bg: "#10171f",
    fg: "#e0e8ee",
    muted: "#7c94a5",
    accent: "#96d8eb",
    panel: "#1d2b38",
  },
  paper: {
    bg: "#f2eee4",
    fg: "#29352b",
    muted: "#77816f",
    accent: "#526b39",
    panel: "#e4e2d7",
  },
};
export type Theme = typeof themes.dusk;
export type Preferences = {
  theme: keyof typeof themes;
  left: boolean;
  sound: boolean;
  haptics: boolean;
  favorites: string[];
  setupDone: boolean;
};
export const defaults: Preferences = {
  theme: "dusk",
  left: false,
  sound: true,
  haptics: true,
  favorites: [],
  setupDone: false,
};
const key = "iris.expo.preferences.v1";
export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return defaults;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") return defaults;
  const saved = value as Record<string, unknown>;
  return {
    theme:
      typeof saved.theme === "string" && Object.hasOwn(themes, saved.theme)
        ? (saved.theme as Preferences["theme"])
        : "dusk",
    left: saved.left === true,
    sound: saved.sound !== false,
    haptics: saved.haptics !== false,
    favorites: Array.isArray(saved.favorites)
      ? saved.favorites.filter((id): id is string => typeof id === "string")
      : [],
    setupDone: saved.setupDone === true,
  };
}
export const readPreferences = async () =>
  parsePreferences(await AsyncStorage.getItem(key));
export const savePreferences = (prefs: Preferences) =>
  AsyncStorage.setItem(key, JSON.stringify(prefs));
