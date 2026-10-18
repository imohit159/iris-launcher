// Ported from Detent Model.kt / LauncherState.kt. See licenses/notices.json.
export const DESIGN = {
  width: 412,
  height: 892,
  axis: 226,
  centerY: 470,
  gap: 54,
  glyphAdvance: 9.15,
  holdMs: 500,
  slop: 6,
} as const;
export const layouts = [
  { name: "soft · radial · double", radius: 330, markers: "double", ticks: 4 },
  { name: "round · radial · double", radius: 200, markers: "double", ticks: 5 },
  { name: "soft · radial · ticks", radius: 330, markers: "ticks", ticks: 4 },
  { name: "flat · radial · dots", radius: 560, markers: "dots", ticks: 6 },
  { name: "flat · radial · nodes", radius: 560, markers: "nodes", ticks: 4 },
] as const;
export const DEFAULT_LAYOUT_INDEX = 0;
export function mod(value: number, count: number) {
  "worklet";
  return count > 0 ? ((value % count) + count) % count : 0;
}
export function distance(index: number, position: number, count: number) {
  "worklet";
  let d = mod(index - position, count);
  if (d > count / 2) d -= count;
  return d;
}
export function displayName(name: string) {
  return name.length > 17 ? `${name.slice(0, 16).trimEnd()}…` : name;
}
export function initial(name: string) {
  return Array.from(name)[0] ?? "?";
}
export function geometry(width: number, height: number, radius: number) {
  "worklet";
  const scale = width / DESIGN.width;
  const cy = DESIGN.centerY + (height / scale - DESIGN.height) / 2;
  return {
    scale,
    cy,
    cx: DESIGN.axis + radius,
    step: DESIGN.gap / radius,
    span: Math.min(6.5, 1.55 / (DESIGN.gap / radius)),
  };
}
export function labelPose(
  d: number,
  chars: number,
  radius: number,
  markers: string,
  cy: number,
  left: boolean,
  scrub = false,
) {
  "worklet";
  const angle = (d * DESIGN.gap) / radius;
  const r =
    radius - (markers === "ticks" ? 28 : markers === "double" ? 34 : 22);
  const closeness = Math.max(0, 1 - Math.abs(d));
  const scale = scrub
    ? 1 + 0.9 * closeness ** 2
    : Math.min(1 + 0.45 * closeness ** 2, Math.max(1, 150 / (chars * 9)));
  const x = DESIGN.axis + radius - r * Math.cos(angle);
  return {
    x: left ? DESIGN.width - x : x,
    y: cy + r * Math.sin(angle),
    rotation: left ? angle : -angle,
    scale,
  };
}
export function zoneAt(
  x: number,
  y: number,
  position: number,
  radius: number,
  cy: number,
  height: number,
  left: boolean,
) {
  "worklet";
  if (y < 200 || y > height - 102) return "empty";
  const dx = DESIGN.axis + radius - (left ? DESIGN.width - x : x),
    dy = y - cy;
  const length = Math.hypot(dx, dy),
    step = DESIGN.gap / radius;
  const row = position + Math.atan2(dy, dx) / step;
  if (
    length <= radius - 200 ||
    length >= radius + 40 ||
    Math.abs(row - position) > Math.min(6.5, 1.55 / step)
  )
    return "empty";
  return Math.round(row) === Math.round(position) ? "selected" : "dial";
}
export function rowAt(
  x: number,
  y: number,
  position: number,
  radius: number,
  cy: number,
  height: number,
  left: boolean,
) {
  "worklet";
  if (y < 200 || y > height - 102) return null;
  const dx = DESIGN.axis + radius - (left ? DESIGN.width - x : x),
    dy = y - cy;
  if (Math.abs(Math.hypot(dx, dy) - radius) > 210) return null;
  const row = Math.round(position + Math.atan2(dy, dx) / (DESIGN.gap / radius));
  return Math.abs(row - position) <= Math.min(6.5, 1.55 / (DESIGN.gap / radius))
    ? row
    : null;
}

export function dragPosition(
  origin: number,
  translation: number,
  anchor: number,
  scale: number,
) {
  "worklet";
  return origin - (translation - anchor) / (DESIGN.gap * scale);
}
export function scrubTarget(base: number, index: number, count: number) {
  "worklet";
  return base + distance(index, base, count);
}
