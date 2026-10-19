import { StyleSheet, Switch, Text, View } from "react-native";
import {
  THEME_LIST,
  type Theme,
  type ThemeName,
  type ThemeMode,
} from "../preferences";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";
import { Section } from "./Section";
import { SettingRow } from "./SettingRow";
import { TransparencyControl } from "./TransparencyControl";
import { ChoiceChips } from "./ChoiceChips";

type Props = {
  theme: Theme;
  searchListTransparency: number;
  searchButtonTransparency: number;
  showRecentApps: boolean;
  launchAnimation: boolean;
  doubleTapSearch: boolean;
  swipeUpSearch: boolean;
  onSearchListTransparencyChange(value: number): void;
  onSearchButtonTransparencyChange(value: number): void;
  onShowRecentAppsChange(value: boolean): void;
  onLaunchAnimationChange(value: boolean): void;
  onDoubleTapSearchChange(value: boolean): void;
  onSwipeUpSearchChange(value: boolean): void;
  themeMode: ThemeMode;
  dayTheme: ThemeName;
  nightTheme: ThemeName;
  dayStartHour: number;
  nightStartHour: number;
  onThemeModeChange(value: ThemeMode): void;
  onDayThemeChange(value: ThemeName): void;
  onNightThemeChange(value: ThemeName): void;
  onDayStartHourChange(value: number): void;
  onNightStartHourChange(value: number): void;
};

const DAY_START_OPTIONS = [6, 7, 8, 9] as const;
const NIGHT_START_OPTIONS = [18, 19, 20, 21] as const;

function closestOption<T extends number>(value: number, options: readonly T[]): T {
  return options.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  options[0]);
}

export function BehaviorSettings({
  theme,
  searchListTransparency,
  searchButtonTransparency,
  showRecentApps,
  launchAnimation,
  doubleTapSearch,
  swipeUpSearch,
  onSearchListTransparencyChange,
  onSearchButtonTransparencyChange,
  onShowRecentAppsChange,
  onLaunchAnimationChange,
  onDoubleTapSearchChange,
  onSwipeUpSearchChange,
  themeMode,
  dayTheme,
  nightTheme,
  dayStartHour,
  nightStartHour,
  onThemeModeChange,
  onDayThemeChange,
  onNightThemeChange,
  onDayStartHourChange,
  onNightStartHourChange,
}: Props) {
  return (
    <View style={styles.screen}>
      <Section first label="Search" labelColor={theme.muted}>
        <TransparencyControl
          label="Search list"
          description="Adjust how see-through app results appear"
          value={searchListTransparency}
          theme={theme}
          onChange={onSearchListTransparencyChange}
        />
        <TransparencyControl
          label="Search button"
          description="Adjust how see-through the home shortcut appears"
          value={searchButtonTransparency}
          theme={theme}
          onChange={onSearchButtonTransparencyChange}
        />
      </Section>
      <Section label="App discovery" labelColor={theme.muted}>
        <SettingRow
          label="Recent apps"
          description="Keep recently opened apps close to the dial"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Recent apps"
              value={showRecentApps}
              onValueChange={onShowRecentAppsChange}
            />
          }
        />
      </Section>
      <Section label="Launch" labelColor={theme.muted}>
        <SettingRow
          label="Launch animation"
          description="Use a short transition when opening an app"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Launch animation"
              value={launchAnimation}
              onValueChange={onLaunchAnimationChange}
            />
          }
        />
      </Section>
      <Section label="Gestures" labelColor={theme.muted}>
        <SettingRow
          label="Swipe up to search"
          description="Swipe upward on the clock to open app search"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Swipe up to search"
              value={swipeUpSearch}
              onValueChange={onSwipeUpSearchChange}
            />
          }
        />
        <SettingRow
          label="Double tap to search"
          description="Double tap the clock to open app search"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Double tap to search"
              value={doubleTapSearch}
              onValueChange={onDoubleTapSearchChange}
            />
          }
        />
      </Section>
      <Section label="Theme schedule" labelColor={theme.muted}>
        <Text style={[styles.description, { color: theme.muted }]}>Keep a fixed theme, follow Android appearance, or switch between two themes by time.</Text>
        <ChoiceChips
          options={["manual", "system", "schedule"] as const}
          value={themeMode}
          theme={theme}
          label={(value) => value}
          onChange={onThemeModeChange}
        />
        {themeMode !== "manual" ? (
          <>
            <Text style={[styles.subLabel, { color: theme.muted }]}>Day theme</Text>
            <ChoiceChips
              options={THEME_LIST.map(({ name }) => name)}
              value={dayTheme}
              theme={theme}
              label={(value) => value.replaceAll("-", " ")}
              onChange={onDayThemeChange}
            />
            <Text style={[styles.subLabel, { color: theme.muted }]}>Night theme</Text>
            <ChoiceChips
              options={THEME_LIST.map(({ name }) => name)}
              value={nightTheme}
              theme={theme}
              label={(value) => value.replaceAll("-", " ")}
              onChange={onNightThemeChange}
            />
          </>
        ) : null}
        {themeMode === "schedule" ? (
          <>
            <Text style={[styles.subLabel, { color: theme.muted }]}>Day starts</Text>
            <ChoiceChips
              options={DAY_START_OPTIONS}
              value={closestOption(dayStartHour, DAY_START_OPTIONS)}
              theme={theme}
              label={(value) => `${value}:00`}
              onChange={onDayStartHourChange}
            />
            <Text style={[styles.subLabel, { color: theme.muted }]}>Night starts</Text>
            <ChoiceChips
              options={NIGHT_START_OPTIONS}
              value={closestOption(nightStartHour, NIGHT_START_OPTIONS)}
              theme={theme}
              label={(value) => `${value}:00`}
              onChange={onNightStartHourChange}
            />
          </>
        ) : null}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  note: {
    ...TYPOGRAPHY.body,
    marginTop: 12,
    padding: 16,
    backgroundColor: SURFACES.elevated,
    borderRadius: 14,
  },
  description: {
    ...TYPOGRAPHY.description,
    marginBottom: 6,
  },
  subLabel: {
    ...TYPOGRAPHY.meta,
    marginTop: 10,
  },
});
