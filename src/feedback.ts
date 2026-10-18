import { requireNativeModule } from "expo";
import * as Haptics from "expo-haptics";
const feedback = requireNativeModule<{ click(): void }>("DialFeedback");
export function tick(sound: boolean, haptics: boolean, letter = false) {
  if (sound) feedback.click();
  if (haptics)
    void Haptics.performAndroidHapticsAsync(
      letter
        ? Haptics.AndroidHaptics.Gesture_End
        : Haptics.AndroidHaptics.Clock_Tick,
    ).catch(() => {});
}
