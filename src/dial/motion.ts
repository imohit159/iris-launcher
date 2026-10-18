// Ported from Detent LauncherState.step; MIT license in licenses/notices.json.
import { defineAnimation, type AnimationObject } from "react-native-reanimated";
import { stepMotion, type MotionState } from "./physics";
type DialAnimation = AnimationObject & MotionState;
export function withDialMotion(target: number, velocity = 0): number {
  "worklet";
  return defineAnimation<DialAnimation>(target, () => {
    "worklet";
    return {
      current: target,
      target,
      velocity,
      fling: Math.abs(velocity) > 0.006,
      timestamp: 0,
      onStart(animation, current: number, timestamp: number) {
        "worklet";
        animation.current = current;
        animation.timestamp = timestamp;
      },
      onFrame(animation, timestamp: number) {
        "worklet";
        const done = stepMotion(animation, timestamp - animation.timestamp);
        animation.timestamp = timestamp;
        return done;
      },
    };
  }) as unknown as number;
}

export function withPawl(): number {
  "worklet";
  return defineAnimation<
    AnimationObject & { current: number; timestamp: number }
  >(1, () => {
    "worklet";
    return {
      current: 1,
      timestamp: 0,
      onStart(animation, _current: number, timestamp: number) {
        "worklet";
        animation.current = 1;
        animation.timestamp = timestamp;
      },
      onFrame(animation, timestamp: number) {
        "worklet";
        animation.current *=
          0.8 ** (Math.min(40, timestamp - animation.timestamp) / 16);
        animation.timestamp = timestamp;
        if (animation.current < 0.002) {
          animation.current = 0;
          return true;
        }
        return false;
      },
    };
  }) as unknown as number;
}
