import assert from "node:assert/strict";
import test from "node:test";
import { activeThemeName, isNightHour } from "../src/themes/schedule.ts";

test("scheduled themes handle daytime and overnight windows", () => {
  assert.equal(isNightHour(6, 7, 19), true);
  assert.equal(isNightHour(7, 7, 19), false);
  assert.equal(isNightHour(18, 7, 19), false);
  assert.equal(isNightHour(19, 7, 19), true);
  assert.equal(isNightHour(2, 19, 7), false);
  assert.equal(isNightHour(12, 19, 7), true);
});

test("theme mode chooses manual, system, or scheduled palettes", () => {
  assert.equal(
    activeThemeName({
      manualTheme: "rose-pine",
      mode: "manual",
      systemScheme: "dark",
      dayTheme: "paper",
      nightTheme: "dusk",
      hour: 22,
      dayStart: 7,
      nightStart: 19,
    }),
    "rose-pine",
  );
  assert.equal(
    activeThemeName({
      manualTheme: "rose-pine",
      mode: "system",
      systemScheme: "light",
      dayTheme: "paper",
      nightTheme: "dusk",
      hour: 22,
      dayStart: 7,
      nightStart: 19,
    }),
    "paper",
  );
  assert.equal(
    activeThemeName({
      manualTheme: "rose-pine",
      mode: "schedule",
      systemScheme: "light",
      dayTheme: "paper",
      nightTheme: "dusk",
      hour: 22,
      dayStart: 7,
      nightStart: 19,
    }),
    "dusk",
  );
});
