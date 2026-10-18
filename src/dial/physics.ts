// Ported from Detent LauncherState.step; MIT notice in licenses/notices.json.
export type MotionState = {
  current: number;
  velocity: number;
  target: number;
  fling: boolean;
  timestamp: number;
};
export function stepMotion(state: MotionState, elapsed: number) {
  "worklet";
  const dt = Math.min(40, Math.max(0, elapsed));
  if (state.fling) {
    state.current += state.velocity * dt;
    state.velocity *= 0.9965 ** dt;
    if (Math.abs(state.velocity) < 0.004) {
      state.target = Math.round(
        state.current + Math.sign(state.velocity) * 0.3,
      );
      state.fling = false;
    }
  } else {
    const delta = state.target - state.current;
    state.current += delta * (1 - 0.78 ** (dt / 16));
    if (Math.abs(delta) < 0.002) {
      state.current = state.target;
      return true;
    }
  }
  return false;
}
