// Theme definitions and palette mixing ported from local Detent Model.kt.
// Artwork provenance and notices: docs/DETENT-REFERENCE.md, licenses/notices.json.
export type Theme = {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  muted2: string;
  panel: string;
  light: boolean;
  hand: string;
  wall: string | null;
  wallLeft: string | null;
};
export function mix(fg: string, bg: string, amount: number): string {
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(fg.slice(i, i + 2), 16) * amount +
            parseInt(bg.slice(i, i + 2), 16) * (1 - amount),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
function palette(
  light: boolean,
  bg: string,
  fg: string,
  accent: string,
  hand: string,
  wall: string | null,
): Theme {
  return {
    light,
    bg,
    fg,
    accent,
    hand,
    wall,
    wallLeft: wall === "last-horizon" ? "last-horizon-left" : null,
    muted: mix(fg, bg, 0.5),
    muted2: mix(fg, bg, 0.68),
    panel: mix(fg, bg, 0.1),
  };
}
export const themes = {
  dusk: palette(false, "#1d2021", "#ebdbb2", "#fe8019", "#504945", null),
  ember: palette(false, "#000000", "#ebe5dc", "#df6124", "#3a3733", null),
  signal: palette(false, "#000000", "#ffffff", "#ff453a", "#3a3a3a", null),
  paper: palette(true, "#f1ede4", "#1c1a17", "#c2410c", "#cbc3b4", null),
  catppuccin: palette(
    false,
    "#1e1e2e",
    "#cdd6f4",
    "#89b4fa",
    "#504945",
    "catppuccin",
  ),
  "catppuccin-latte": palette(
    true,
    "#eff1f5",
    "#4c4f69",
    "#1e66f5",
    "#504945",
    "catppuccin-latte",
  ),
  ethereal: palette(
    false,
    "#060b1e",
    "#ffcead",
    "#7d82d9",
    "#504945",
    "ethereal",
  ),
  everforest: palette(
    false,
    "#2d353b",
    "#d3c6aa",
    "#7fbbb3",
    "#504945",
    "everforest",
  ),
  "flexoki-light": palette(
    true,
    "#fffcf0",
    "#100f0f",
    "#205ea6",
    "#504945",
    "flexoki-light",
  ),
  gruvbox: palette(
    false,
    "#282828",
    "#d4be98",
    "#7daea3",
    "#504945",
    "gruvbox",
  ),
  hackerman: palette(
    false,
    "#0b0c16",
    "#ddf7ff",
    "#82fb9c",
    "#504945",
    "hackerman",
  ),
  kanagawa: palette(
    false,
    "#1f1f28",
    "#dcd7ba",
    "#dcd7ba",
    "#504945",
    "kanagawa",
  ),
  "last-horizon": palette(
    false,
    "#0c0b0c",
    "#fafcfb",
    "#b59790",
    "#504945",
    "last-horizon",
  ),
  lumon: palette(false, "#16242d", "#d6e2ee", "#8bc9eb", "#504945", "lumon"),
  lupine: palette(true, "#fafafa", "#212121", "#3264eb", "#504945", "lupine"),
  "matte-black": palette(
    false,
    "#121212",
    "#bebebe",
    "#e68e0d",
    "#504945",
    "matte-black",
  ),
  miasma: palette(false, "#222222", "#c2c2b0", "#78824b", "#504945", "miasma"),
  nord: palette(false, "#2e3440", "#d8dee9", "#81a1c1", "#504945", "nord"),
  "osaka-jade": palette(
    false,
    "#111c18",
    "#c1c497",
    "#509475",
    "#504945",
    "osaka-jade",
  ),
  "retro-82": palette(
    false,
    "#05182e",
    "#f6dcac",
    "#faa968",
    "#504945",
    "retro-82",
  ),
  ristretto: palette(
    false,
    "#2c2525",
    "#e6d9db",
    "#f38d70",
    "#504945",
    "ristretto",
  ),
  "rose-pine": palette(
    true,
    "#faf4ed",
    "#575279",
    "#56949f",
    "#504945",
    "rose-pine",
  ),
  solitude: palette(
    false,
    "#101315",
    "#cacccc",
    "#798186",
    "#504945",
    "solitude",
  ),
  starship: palette(
    false,
    "#1c1c1e",
    "#f5f5f7",
    "#ff9f0a",
    "#504945",
    "starship",
  ),
  "tokyo-night": palette(
    false,
    "#1a1b26",
    "#a9b1d6",
    "#7aa2f7",
    "#504945",
    "tokyo-night",
  ),
  vantablack: palette(false, "#000000", "#ffffff", "#8d8d8d", "#505050", null),
  white: palette(true, "#ffffff", "#000000", "#6e6e6e", "#504945", "white"),
};
export type ThemeName = keyof typeof themes;
