import { useCallback, useState } from "react";
import {
  openNotificationAccessSettings,
  readNotificationState,
  type NotificationCapability,
} from "../launcher/notifications";

type State = {
  capability: NotificationCapability;
  packageNames: string[];
};

const initialState: State = {
  capability: "unavailable",
  packageNames: [],
};

export function useNotificationIndicators() {
  const [state, setState] = useState<State>(initialState);
  const refresh = useCallback(async () => {
    setState(await readNotificationState());
  }, []);

  return {
    ...state,
    refresh,
    openSettings: openNotificationAccessSettings,
  };
}
