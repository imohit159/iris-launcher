import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { clockTime, clockDate } from "../src/home/clock.ts";
import { themes } from "../src/themes/catalog.ts";

test("clock uses 24-hour local time including midnight, noon and afternoon", () => {
  assert.equal(clockTime(new Date(2026, 9, 18, 0, 0)), "00:00");
  assert.equal(clockTime(new Date(2026, 9, 18, 9, 5)), "09:05");
  assert.equal(clockTime(new Date(2026, 9, 18, 12, 0)), "12:00");
  assert.equal(clockTime(new Date(2026, 9, 18, 23, 59)), "23:59");
  assert.equal(clockDate(new Date(2026, 9, 18)), "sun 18 oct");
});
test("all 27 reference themes provide complete palettes and correct wallpaper variants", () => {
  assert.equal(Object.keys(themes).length, 27);
  assert.equal(themes.dusk.bg, "#1d2021");
  assert.equal(themes.dusk.accent, "#fe8019");
  assert.equal(themes["retro-82"].wall, "retro-82");
  assert.equal(themes["last-horizon"].wallLeft, "last-horizon-left");
  assert.equal(themes.vantablack.wall, null);
  assert.equal(themes["catppuccin-latte"].light, true);
  assert.equal(themes["tokyo-night"].light, false);
  assert.equal(
    existsSync(new URL("../assets/themes/hands.webp", import.meta.url)),
    true,
  );
  for (const theme of Object.values(themes)) {
    for (const wall of [theme.wall, theme.wallLeft]) {
      if (wall)
        assert.equal(
          existsSync(new URL(`../assets/themes/${wall}.webp`, import.meta.url)),
          true,
          `Missing wallpaper: ${wall}`,
        );
    }
    for (const key of [
      "bg",
      "fg",
      "accent",
      "muted",
      "muted2",
      "panel",
      "hand",
    ] as const)
      assert.match(theme[key], /^#[a-f0-9]{6}$/);
    assert.equal(
      theme.wallLeft === null || theme.wall === "last-horizon",
      true,
    );
  }
});
