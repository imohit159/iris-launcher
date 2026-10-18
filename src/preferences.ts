import { DEFAULT_LAYOUT_INDEX, layouts } from "./dial/reference";
import { isWallpaperName } from "./wallpaper/model";
import { restoreWallpaper } from "./wallpaper/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "./themes/catalog";
export {
  themes,
  THEME_LIST,
  THEME_NAMES,
  type Theme,
  type ThemeDef,
  type ThemeName,
} from "./themes/catalog";
export type Preferences = {
  theme: keyof typeof themes;
  wallpaperTheme: keyof typeof themes | null;
  customWallpaper: string | null;
  layout: number;
  left: boolean;
  sound: boolean;
  haptics: boolean;
  statusBar: boolean;
  dots: boolean;
  favorites: string[];
  setupDone: boolean;
};
export const defaults: Preferences = {
  theme: "dusk",
  wallpaperTheme: null,
  customWallpaper: null,
  layout: DEFAULT_LAYOUT_INDEX,
  left: false,
  sound: true,
  haptics: true,
  statusBar: true,
  dots: true,
  favorites: [],
  setupDone: false,
};
const key = "iris.expo.preferences.v1";
export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return defaults;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return defaults;
  }
  if (!value || typeof value !== "object") return defaults;
  const saved = value as Record<string, unknown>;
  return {
    theme:
      typeof saved.theme === "string" && Object.hasOwn(themes, saved.theme)
        ? (saved.theme as Preferences["theme"])
        : "dusk",
    wallpaperTheme:
      typeof saved.wallpaperTheme === "string" &&
      Object.hasOwn(themes, saved.wallpaperTheme)
        ? (saved.wallpaperTheme as Preferences["wallpaperTheme"])
        : null,
    customWallpaper: isWallpaperName(saved.customWallpaper)
      ? saved.customWallpaper
      : null,
    layout:
      typeof saved.layout === "number" &&
      Number.isInteger(saved.layout) &&
      saved.layout >= 0 &&
      saved.layout < layouts.length
        ? saved.layout
        : DEFAULT_LAYOUT_INDEX,
    left: saved.left === true,
    sound: saved.sound !== false,
    haptics: saved.haptics !== false,
    statusBar: saved.statusBar !== false,
    dots: saved.dots !== false,
    favorites: Array.isArray(saved.favorites)
      ? saved.favorites.filter((id): id is string => typeof id === "string")
      : [],
    setupDone: saved.setupDone === true,
  };
}
export const readPreferences = async () => {
  const prefs = parsePreferences(await AsyncStorage.getItem(key));
  try {
    return {
      ...prefs,
      customWallpaper: await restoreWallpaper(prefs.customWallpaper),
    };
  } catch {
    return { ...prefs, customWallpaper: null };
  }
};
export const savePreferences = (prefs: Preferences) =>
  AsyncStorage.setItem(key, JSON.stringify(prefs));
