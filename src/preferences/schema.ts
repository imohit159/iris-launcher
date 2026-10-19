import { DEFAULT_LAYOUT_INDEX, layouts } from "../dial/reference.ts";
import { isWallpaperName } from "../wallpaper/model.ts";
import { themes } from "../themes/catalog.ts";

export type ThemeMode = "manual" | "system" | "schedule";

export type Preferences = {
  schemaVersion: number;
  theme: keyof typeof themes;
  themeMode: ThemeMode;
  dayTheme: keyof typeof themes;
  nightTheme: keyof typeof themes;
  dayStartHour: number;
  nightStartHour: number;
  wallpaperTheme: keyof typeof themes | null;
  customWallpaper: string | null;
  layout: number;
  left: boolean;
  sound: boolean;
  haptics: boolean;
  statusBar: boolean;
  dots: boolean;
  searchListTransparency: number;
  searchButtonTransparency: number;
  showRecentApps: boolean;
  launchAnimation: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  iconStyle: "native" | "monochrome" | "outline";
  wallpaperDimming: number;
  wallpaperBlur: 0 | 4 | 8 | 12;
  wallpaperTint: boolean;
  wallpaperGrain: boolean;
  showDeviceStatus: boolean;
  showContextCards: boolean;
  showMediaControls: boolean;
  doubleTapSearch: boolean;
  swipeUpSearch: boolean;
  showBlueprint: boolean;
  hiddenApps: string[];
  customLabels: Record<string, string>;
  customCategories: Record<string, string>;
  recentApps: string[];
  favorites: string[];
  setupDone: boolean;
};

export const PREFERENCES_VERSION = 5;

const DAY_START_HOURS = [6, 7, 8, 9] as const;
const NIGHT_START_HOURS = [18, 19, 20, 21] as const;

export const defaults: Preferences = {
  schemaVersion: PREFERENCES_VERSION,
  theme: "dusk",
  themeMode: "manual",
  dayTheme: "catppuccin-latte",
  nightTheme: "dusk",
  dayStartHour: 7,
  nightStartHour: 19,
  wallpaperTheme: null,
  customWallpaper: null,
  layout: DEFAULT_LAYOUT_INDEX,
  left: false,
  sound: true,
  haptics: true,
  statusBar: true,
  dots: true,
  searchListTransparency: 0,
  searchButtonTransparency: 0,
  showRecentApps: true,
  launchAnimation: true,
  reducedMotion: false,
  largeText: false,
  highContrast: false,
  iconStyle: "native",
  wallpaperDimming: 0,
  wallpaperBlur: 0,
  wallpaperTint: false,
  wallpaperGrain: false,
  showDeviceStatus: true,
  showContextCards: false,
  showMediaControls: false,
  doubleTapSearch: false,
  swipeUpSearch: true,
  showBlueprint: false,
  hiddenApps: [],
  customLabels: {},
  customCategories: {},
  recentApps: [],
  favorites: [],
  setupDone: false,
};

function safeDefaults(): Preferences {
  return { ...defaults, hiddenApps: [], recentApps: [], favorites: [] };
}

function stringList(value: unknown, limit?: number): string[] {
  const items = Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  return limit === undefined ? items : items.slice(0, limit);
}

function labels(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([id, label]) =>
        id.length > 0 && typeof label === "string" && label.trim().length > 0,
    ),
  );
}

function enumNumber<T extends number>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T {
  if (typeof value !== "number" || !Number.isInteger(value)) return fallback;
  return options.includes(value as T) ? (value as T) : fallback;
}

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return safeDefaults();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return safeDefaults();
  }
  if (!value || typeof value !== "object") return safeDefaults();

  const saved = value as Record<string, unknown>;
  const transparency = (candidate: unknown, fallback: number) =>
    typeof candidate === "number" &&
    Number.isFinite(candidate) &&
    candidate >= 0 &&
    candidate <= 0.8
      ? candidate
      : fallback;

  return {
    schemaVersion: PREFERENCES_VERSION,
    theme:
      typeof saved.theme === "string" && Object.hasOwn(themes, saved.theme)
        ? (saved.theme as Preferences["theme"])
        : defaults.theme,
    themeMode:
      saved.themeMode === "system" || saved.themeMode === "schedule"
        ? saved.themeMode
        : "manual",
    dayTheme:
      typeof saved.dayTheme === "string" && Object.hasOwn(themes, saved.dayTheme)
        ? (saved.dayTheme as Preferences["dayTheme"])
        : defaults.dayTheme,
    nightTheme:
      typeof saved.nightTheme === "string" && Object.hasOwn(themes, saved.nightTheme)
        ? (saved.nightTheme as Preferences["nightTheme"])
        : defaults.nightTheme,
    dayStartHour: enumNumber(saved.dayStartHour, DAY_START_HOURS, defaults.dayStartHour),
    nightStartHour: enumNumber(
      saved.nightStartHour,
      NIGHT_START_HOURS,
      defaults.nightStartHour,
    ),
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
    searchListTransparency: transparency(
      saved.searchListTransparency,
      defaults.searchListTransparency,
    ),
    searchButtonTransparency: transparency(
      saved.searchButtonTransparency,
      defaults.searchButtonTransparency,
    ),
    showRecentApps: saved.showRecentApps !== false,
    launchAnimation: saved.launchAnimation !== false,
    reducedMotion: saved.reducedMotion === true,
    largeText: saved.largeText === true,
    highContrast: saved.highContrast === true,
    iconStyle:
      saved.iconStyle === "monochrome" || saved.iconStyle === "outline"
        ? saved.iconStyle
        : "native",
    wallpaperDimming: transparency(
      saved.wallpaperDimming,
      defaults.wallpaperDimming,
    ),
    wallpaperBlur:
      saved.wallpaperBlur === 4 || saved.wallpaperBlur === 8 || saved.wallpaperBlur === 12
        ? saved.wallpaperBlur
        : 0,
    wallpaperTint: saved.wallpaperTint === true,
    wallpaperGrain: saved.wallpaperGrain === true,
    showDeviceStatus: saved.showDeviceStatus !== false,
    showContextCards: saved.showContextCards === true,
    showMediaControls: saved.showMediaControls === true,
    doubleTapSearch: saved.doubleTapSearch === true,
    swipeUpSearch: saved.swipeUpSearch !== false,
    showBlueprint: saved.showBlueprint === true,
    hiddenApps: stringList(saved.hiddenApps),
    customLabels: labels(saved.customLabels),
    customCategories: labels(saved.customCategories),
    recentApps: stringList(saved.recentApps, 12),
    favorites: stringList(saved.favorites),
    setupDone: saved.setupDone === true,
  };
}
