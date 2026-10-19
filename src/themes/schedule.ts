import type { ThemeMode } from "../preferences/schema.ts";
import type { ThemeName } from "./catalog.ts";

export function isNightHour(hour: number, dayStart: number, nightStart: number) {
  const current = ((Math.floor(hour) % 24) + 24) % 24;
  const day = ((Math.floor(dayStart) % 24) + 24) % 24;
  const night = ((Math.floor(nightStart) % 24) + 24) % 24;
  if (day === night) return false;
  if (day < night) return current < day || current >= night;
  return current >= night && current < day;
}

export function activeThemeName({
  manualTheme,
  mode,
  systemScheme,
  dayTheme,
  nightTheme,
  hour,
  dayStart,
  nightStart,
}: {
  manualTheme: ThemeName;
  mode: ThemeMode;
  systemScheme: "light" | "dark" | null | undefined;
  dayTheme: ThemeName;
  nightTheme: ThemeName;
  hour: number;
  dayStart: number;
  nightStart: number;
}): ThemeName {
  if (mode === "system") {
    return systemScheme === "light" ? dayTheme : nightTheme;
  }
  if (mode === "schedule") {
    return isNightHour(hour, dayStart, nightStart) ? nightTheme : dayTheme;
  }
  return manualTheme;
}
