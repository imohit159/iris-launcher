import { layouts } from "./dial/reference";
import { isWallpaperName } from "./wallpaper/model";
import { restoreWallpaper } from "./wallpaper/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "./themes/catalog";
export { themes, type Theme } from "./themes/catalog";
export type Preferences = {
  theme: keyof typeof themes;
  customWallpaper: string | null;
  layout: number;
  left: boolean;
  sound: boolean;
  haptics: boolean;
  favorites: string[];
  setupDone: boolean;
};
export const defaults: Preferences = {
  theme: "dusk",
  customWallpaper: null,
  layout: 0,
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
    customWallpaper: isWallpaperName(saved.customWallpaper)
      ? saved.customWallpaper
      : null,
    layout:
      typeof saved.layout === "number" &&
      Number.isInteger(saved.layout) &&
      saved.layout >= 0 &&
      saved.layout < layouts.length
        ? saved.layout
        : 0,
    left: saved.left === true,
    sound: saved.sound !== false,
    haptics: saved.haptics !== false,
    favorites: Array.isArray(saved.favorites)
      ? saved.favorites.filter((id): id is string => typeof id === "string")
      : [],
    setupDone: saved.setupDone === true,
  };
}
export const readPreferences = async () => {
  const prefs = parsePreferences(await AsyncStorage.getItem(key));
  return {
    ...prefs,
    customWallpaper: await restoreWallpaper(prefs.customWallpaper),
  };
};
export const savePreferences = (prefs: Preferences) =>
  AsyncStorage.setItem(key, JSON.stringify(prefs));
