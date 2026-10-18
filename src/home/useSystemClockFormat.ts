import { useEffect, useReducer } from "react";
import { AppState } from "react-native";
import { getCalendars, useCalendars } from "expo-localization";

export function useSystemClockFormat(): boolean {
  // Subscribe to OS configuration changes as well as foreground transitions.
  useCalendars();
  const [, refresh] = useReducer((value) => value + 1, 0);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, []);
  // Android clock settings can change while Iris is behind the Settings app.
  return getCalendars()[0].uses24hourClock === true;
}
