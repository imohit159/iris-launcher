// Geometry and drawing ported from the local Detent Dial.kt (MIT).
import { Skia, PaintStyle, type SkFont } from "@shopify/react-native-skia";
import {
  DESIGN,
  DEFAULT_LAYOUT_INDEX,
  layouts,
  geometry,
  distance,
  labelPose,
  mod,
} from "./reference";
import type { Theme } from "../preferences";
export type GlyphLabel = {
  text: string;
  glyphs: number[];
  notification?: boolean;
};
export function drawDial(
  width: number,
  height: number,
  position: number,
  layoutIndex: number,
  left: boolean,
  theme: Theme,
  labels: GlyphLabel[],
  regular: SkFont,
  medium: SkFont,
  large: SkFont,
  scrubbing: boolean,
  kick: number,
  showNotificationDots: boolean,
) {
  "worklet";
  const layout = layouts[layoutIndex] ?? layouts[DEFAULT_LAYOUT_INDEX];
  const g = geometry(width, height, layout.radius),
    r = layout.radius;
  const recorder = Skia.PictureRecorder();
  const c = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));
  c.scale(g.scale, g.scale);
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  const color = (value: string, alpha = 1) => {
    "worklet";
    paint.setColor(Skia.Color(value));
    paint.setAlphaf(alpha);
  };
  const x = (v: number) => {
    "worklet";
    return left ? DESIGN.width - v : v;
  };
  const circle = (px: number, py: number, radius: number) => {
    "worklet";
    c.drawCircle(px, py, radius, paint);
  };
  if (layout.markers === "ticks" || layout.markers === "nodes") {
    color(theme.fg, 0.14);
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(1);
    circle(x(g.cx), g.cy, r);
    paint.setStyle(PaintStyle.Fill);
  }
  for (
    let i = Math.ceil((position - g.span) * layout.ticks);
    i <= Math.floor((position + g.span) * layout.ticks);
    i++
  ) {
    const d = i / layout.ticks - position,
      a = Math.abs(d),
      angle = d * g.step;
    const px = g.cx - r * Math.cos(angle),
      py = g.cy + r * Math.sin(angle);
    const major = mod(i, layout.ticks) === 0,
      hot = major && a < 0.5,
      fade = Math.max(0, 1 - a / g.span) ** 0.8;
    if (layout.markers === "ticks") {
      color(theme.fg, (major ? 0.6 : 0.25) * fade);
      paint.setStrokeWidth(1);
      const length = major ? 14 : 6;
      c.drawLine(
        x(px),
        py,
        x(px) + (left ? -1 : 1) * length * Math.cos(angle),
        py - length * Math.sin(angle),
        paint,
      );
    } else if (layout.markers === "double") {
      const f = Math.max(0, 1 - a / 3.6),
        size = hot ? 9 : major ? 3 + 5 * f : 2 + 2.6 * f;
      color(
        hot ? theme.accent : theme.fg,
        hot ? 1 : 0.65 * (0.3 + 0.7 * f) * fade,
      );
      circle(x(px), py, size / 2);
      if (major) {
        color(theme.fg, 0.65 * (0.25 + 0.5 * f) * fade);
        circle(
          x(g.cx - (r - 16) * Math.cos(angle)),
          g.cy + (r - 16) * Math.sin(angle),
          (2.5 + 3 * f) / 2,
        );
      }
    } else {
      color(
        hot ? theme.accent : theme.fg,
        fade *
          (hot ? 1 : major ? 0.65 : layout.markers === "dots" ? 0.3 : 0.22),
      );
      circle(x(px), py, (major ? (layout.markers === "nodes" ? 6 : 4) : 2) / 2);
    }
  }
  // Only nearby rows are recorded; circular distance prevents duplicates on short lists.
  const n = labels.length,
    seen: number[] = [];
  for (
    let row = Math.ceil(position - g.span);
    row <= Math.floor(position + g.span) && n > 0;
    row++
  ) {
    const index = mod(row, n);
    if (seen.includes(index)) continue;
    seen.push(index);
    const d = distance(index, position, n),
      a = Math.abs(d);
    if (a >= g.span) continue;
    const label = labels[index],
      pose = labelPose(
        d,
        label.text.length,
        r,
        layout.markers,
        g.cy,
        left,
        scrubbing,
      );
    const font = a < 0.5 ? medium : regular,
      metrics = font.getMetrics();
    color(a < 0.5 ? theme.accent : theme.fg, (1 - a / g.span) ** 1.35);
    c.save();
    c.translate(pose.x, pose.y);
    c.rotate((pose.rotation * 180) / Math.PI, 0, 0);
    c.scale(pose.scale, pose.scale);
    const textWidth = label.glyphs.length * DESIGN.glyphAdvance;
    c.drawGlyphs(
      label.glyphs,
      label.glyphs.map((_, i) => ({ x: i * DESIGN.glyphAdvance, y: 0 })),
      left ? -textWidth : 0,
      -(metrics.ascent + metrics.descent) / 2,
      font,
      paint,
    );
    if (showNotificationDots && label.notification && !scrubbing) {
      color(theme.accent, (1 - a / g.span) ** 1.35);
      circle(left ? -textWidth - 8 : textWidth + 8, 0, 3);
    }
    c.restore();
  }
  const off = (left ? 1 : -1) * kick * 4;
  color(theme.accent);
  if (layout.markers === "double") {
    color(theme.bg);
    circle(x(226) + off, g.cy, 8);
    color(theme.accent);
    circle(x(226) + off, g.cy, 5);
  } else if (layout.markers === "nodes") {
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(1.5);
    circle(x(226) + off, g.cy, 9.25);
  } else if (layout.markers === "ticks")
    c.drawRect(
      Skia.XYWHRect(x(left ? 242 : 204) + off, g.cy - 1, 38, 2),
      paint,
    );
  else {
    for (let i = 0; i < 3; i++) {
      color(theme.accent, [0.45, 0.7, 1][i]);
      circle(x([191.5, 200, 209.5][i]) + off, g.cy, [3, 4, 5][i] / 2);
    }
  }
  if (scrubbing && n) {
    paint.setStyle(PaintStyle.Fill);
    color(theme.accent);
    const text = labels[mod(Math.round(position), n)].text,
      metrics = large.getMetrics();
    c.drawText(
      text,
      left ? DESIGN.width - 36 - large.measureText(text).width : 36,
      g.cy - (metrics.ascent + metrics.descent) / 2,
      paint,
      large,
    );
  }
  const picture = recorder.finishRecordingAsPicture();
  paint.dispose();
  recorder.dispose();
  return picture;
}
