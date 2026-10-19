import { useMemo } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import {
  Canvas,
  Picture,
  Skia,
  useFont,
  type SkFont,
} from "@shopify/react-native-skia";
import type { Theme } from "../themes/catalog";
import { useSystemClockFormat } from "../home/useSystemClockFormat";
import { clockDate, clockTime } from "../home/clock";

type Props = {
  now: Date;
  scale: number;
  top: number;
  width: number;
  left: boolean;
  scrubbing: boolean;
  textScale?: number;
  theme: Theme;
  onPress(): void;
  onSettings(): void;
  onDoubleTap?: () => void;
  onSwipeUp?: () => void;
};
export function HomeClock({
  now,
  scale,
  top,
  width,
  left,
  scrubbing,
  textScale = 1,
  theme,
  onPress,
  onSettings,
  onDoubleTap,
  onSwipeUp,
}: Props) {
  const timeFont = useFont(
    require("../../assets/fonts/jetbrains_mono_light.ttf"),
    68 * textScale,
  );
  const dateFont = useFont(
    require("../../assets/fonts/jetbrains_mono_regular.ttf"),
    13 * textScale,
  );
  const uses24hourClock = useSystemClockFormat();
  const time = clockTime(now, uses24hourClock),
    date = clockDate(now);
  const picture = useMemo(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(
      Skia.XYWHRect(0, 0, width, 89.6 * scale),
    );
    canvas.scale(scale, scale);
    if (timeFont && dateFont) {
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      const text = (
        value: string,
        font: SkFont,
        spacing: number,
        y: number,
        lineHeight: number,
        color: string,
      ) => {
        const chars = Array.from(value),
          glyphs = font.getGlyphIDs(value),
          advances = font.getGlyphWidths(glyphs);
        let advance = 0;
        const positions = advances.map((length) => {
          const point = { x: advance, y: 0 };
          advance += length + spacing;
          return point;
        });
        // Align visible glyph edges, not the different side bearings of digits and letters.
        const bounds = chars.map((char, i) => {
          const b = font.measureText(char);
          return {
            left: positions[i].x + b.x,
            right: positions[i].x + b.x + b.width,
          };
        });
        const minX = Math.min(...bounds.map((b) => b.left)),
          maxX = Math.max(...bounds.map((b) => b.right));
        const metrics = font.getMetrics(),
          baseline =
            y +
            (lineHeight - (metrics.descent - metrics.ascent)) / 2 -
            metrics.ascent;
        paint.setColor(Skia.Color(color));
        canvas.drawGlyphs(
          glyphs,
          positions,
          left ? width / scale - maxX : -minX,
          baseline,
          font,
          paint,
        );
      };
      text(time, timeFont, -3.4, 0, 68, theme.fg);
      text(date, dateFont, 0.26, 74, 15.6, theme.muted2);
      paint.dispose();
    }
    const result = recorder.finishRecordingAsPicture();
    recorder.dispose();
    return result;
  }, [timeFont, dateFont, time, date, width, scale, left, theme]);
  const gestures = useMemo(() => {
    const tap = onDoubleTap
      ? Gesture.Exclusive(
          Gesture.Tap()
            .numberOfTaps(2)
            .onEnd(() => scheduleOnRN(onDoubleTap)),
          Gesture.Tap().onEnd(() => scheduleOnRN(onPress)),
        )
      : Gesture.Tap().onEnd(() => scheduleOnRN(onPress));
    return Gesture.Race(
      Gesture.LongPress()
        .minDuration(500)
        .onStart(() => scheduleOnRN(onSettings)),
      Gesture.Pan()
        .minDistance(18 * scale)
        .onEnd((event) => {
          if (onSwipeUp && event.translationY < -36 * scale) {
            scheduleOnRN(onSwipeUp);
          }
        }),
      tap,
    );
  }, [onDoubleTap, onPress, onSettings, onSwipeUp, scale]);
  return (
    <GestureDetector gesture={gestures}>
      <View
        accessibilityRole="button"
        accessibilityLabel={`${time}, ${date}. Open date and time settings; hold for settings`}
        onAccessibilityTap={onPress}
        accessible
        pointerEvents={scrubbing ? "none" : "auto"}
        style={{
          position: "absolute",
          left: 28 * scale,
          top,
          width,
          height: 89.6 * scale,
          opacity: scrubbing ? 0.25 : 1,
        }}
      >
        <Canvas style={{ width, height: 89.6 * scale }} pointerEvents="none">
          <Picture picture={picture} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}
