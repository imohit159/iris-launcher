import { useCallback, useState } from "react";
import {
  controlMedia,
  readMediaState,
  type MediaCapability,
  type MediaState,
} from "./media";

type State = {
  capability: MediaCapability;
  media: MediaState | null;
};

const initialState: State = { capability: "unavailable", media: null };

export function useMediaControls() {
  const [state, setState] = useState<State>(initialState);
  const refresh = useCallback(async () => {
    setState(await readMediaState());
  }, []);
  const control = useCallback(
    async (action: "play" | "pause" | "next" | "previous") => {
      const changed = await controlMedia(action);
      if (changed) await refresh();
      return changed;
    },
    [refresh],
  );
  return { ...state, refresh, control };
}
