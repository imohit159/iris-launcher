import { useCallback, useRef, useState } from "react";
import {
  launchShortcut,
  readShortcuts,
  type AppShortcut,
  type ShortcutCapability,
} from "./shortcuts";

type State = {
  capability: ShortcutCapability;
  packageName: string | null;
  shortcuts: AppShortcut[];
};

const initialState: State = {
  capability: "unavailable",
  packageName: null,
  shortcuts: [],
};

export function useAppShortcuts() {
  const [state, setState] = useState<State>(initialState);
  const requestId = useRef(0);
  const refresh = useCallback(async (packageName: string) => {
    const currentRequest = ++requestId.current;
    setState({ ...initialState, packageName });
    const result = await readShortcuts(packageName);
    if (currentRequest === requestId.current) {
      setState({ packageName, ...result });
    }
  }, []);
  const launch = useCallback(
    async (packageName: string, shortcutId: string) => {
      const started = await launchShortcut(packageName, shortcutId);
      return started;
    },
    [],
  );

  return { ...state, refresh, launch };
}
