import { useCallback, useState } from "react";
import {
  readContextSnapshot,
  requestCalendarAccess,
  type CalendarEvent,
  type ContextCapability,
} from "./adapter";

type State = {
  calendarCapability: ContextCapability;
  nextAlarmAt: number | null;
  nextEvent: CalendarEvent | null;
};

const initialState: State = {
  calendarCapability: "unavailable",
  nextAlarmAt: null,
  nextEvent: null,
};

export function useContextualInfo() {
  const [state, setState] = useState<State>(initialState);
  const refresh = useCallback(async () => {
    setState(await readContextSnapshot());
  }, []);
  const requestCalendar = useCallback(async () => {
    const granted = await requestCalendarAccess();
    await refresh();
    return granted;
  }, [refresh]);

  return { ...state, refresh, requestCalendar };
}
