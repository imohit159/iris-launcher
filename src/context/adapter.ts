import { PermissionsAndroid, Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

export type ContextCapability =
  | "available"
  | "needs-permission"
  | "unavailable"
  | "error";

export type CalendarEvent = {
  title: string;
  startAt: number;
  location?: string;
};

type ContextualInfoModule = {
  getNextAlarm(): Promise<number | null>;
  getNextCalendarEvent(): Promise<CalendarEvent | null>;
};

const native = requireOptionalNativeModule<ContextualInfoModule>("ContextualInfo");

export async function readCalendarCapability(): Promise<ContextCapability> {
  if (Platform.OS !== "android" || !native) return "unavailable";
  try {
    return (await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
    ))
      ? "available"
      : "needs-permission";
  } catch {
    return "error";
  }
}

export async function requestCalendarAccess(): Promise<boolean> {
  if (Platform.OS !== "android" || !native) return false;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function readContextSnapshot() {
  if (!native) {
    return {
      calendarCapability: "unavailable" as const,
      nextAlarmAt: null,
      nextEvent: null,
    };
  }
  try {
    const calendarCapability = await readCalendarCapability();
    const [nextAlarmAt, nextEvent] = await Promise.all([
      native.getNextAlarm(),
      calendarCapability === "available"
        ? native.getNextCalendarEvent()
        : Promise.resolve(null),
    ]);
    return { calendarCapability, nextAlarmAt, nextEvent };
  } catch {
    return {
      calendarCapability: "error" as const,
      nextAlarmAt: null,
      nextEvent: null,
    };
  }
}
