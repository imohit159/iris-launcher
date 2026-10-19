import AsyncStorage from "@react-native-async-storage/async-storage";
import { restoreWallpaper } from "./wallpaper/storage.ts";
import {
  parsePreferences,
  PREFERENCES_VERSION,
  type Preferences,
} from "./preferences/schema.ts";

export {
  themes,
  THEME_LIST,
  THEME_NAMES,
  type Theme,
  type ThemeDef,
  type ThemeName,
} from "./themes/catalog";
export {
  defaults,
  parsePreferences,
  PREFERENCES_VERSION,
  type Preferences,
  type ThemeMode,
} from "./preferences/schema.ts";

const key = "iris.expo.preferences.v1";

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
  AsyncStorage.setItem(
    key,
    JSON.stringify({ ...prefs, schemaVersion: PREFERENCES_VERSION }),
  );
