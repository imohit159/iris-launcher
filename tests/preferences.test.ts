import assert from "node:assert/strict";
import test from "node:test";
import {
  defaults,
  PREFERENCES_VERSION,
  parsePreferences,
} from "../src/preferences/schema.ts";
import { parseBackup, serializePreferences } from "../src/preferences/backup.ts";

test("preferences migrate legacy records and keep the current schema version", () => {
  const parsed = parsePreferences(
    JSON.stringify({
      theme: "dusk",
      favorites: ["com.example.mail", 42, ""],
      recentApps: ["com.example.mail", "com.example.browser", "too-many"],
      customLabels: {
        "com.example.mail": " Mail ",
        invalid: 12,
      },
    }),
  );

  assert.equal(parsed.schemaVersion, PREFERENCES_VERSION);
  assert.deepEqual(parsed.favorites, ["com.example.mail"]);
  assert.deepEqual(parsed.recentApps, [
    "com.example.mail",
    "com.example.browser",
    "too-many",
  ]);
  assert.deepEqual(parsed.customLabels, { "com.example.mail": " Mail " });
});

test("malformed preference values fall back to safe defaults", () => {
  const parsed = parsePreferences(
    JSON.stringify({
      schemaVersion: 999,
      layout: -1,
      searchListTransparency: 4,
      wallpaperDimming: -1,
      hiddenApps: "com.example.hidden",
      customLabels: [],
    }),
  );

  assert.equal(parsed.schemaVersion, PREFERENCES_VERSION);
  assert.equal(parsed.layout, defaults.layout);
  assert.equal(parsed.searchListTransparency, defaults.searchListTransparency);
  assert.equal(parsed.wallpaperDimming, defaults.wallpaperDimming);
  assert.deepEqual(parsed.hiddenApps, []);
  assert.deepEqual(parsed.customLabels, {});
});

test("invalid JSON never blocks first launch", () => {
  const parsed = parsePreferences("{not-json");
  assert.equal(parsed.schemaVersion, PREFERENCES_VERSION);
  assert.equal(parsed.theme, defaults.theme);
});

test("preference backups round-trip through the validated schema", () => {
  const source = {
    ...defaults,
    theme: "tokyo-night" as const,
    favorites: ["com.example.mail"],
    customLabels: { "com.example.mail": "Inbox" },
  };
  const restored = parseBackup(serializePreferences(source));
  assert.equal(restored.theme, source.theme);
  assert.deepEqual(restored.favorites, source.favorites);
  assert.deepEqual(restored.customLabels, source.customLabels);
  assert.throws(() => parseBackup("{}"));
});

test("custom labels and categories are preserved", () => {
  const parsed = parsePreferences(
    JSON.stringify({
      customLabels: { "com.example.mail": "Inbox" },
      customCategories: { "com.example.mail": "Work" },
    }),
  );
  assert.equal(parsed.customLabels["com.example.mail"], "Inbox");
  assert.equal(parsed.customCategories["com.example.mail"], "Work");
});

test("context cards default off and opt in through validated preferences", () => {
  assert.equal(parsePreferences(null).showContextCards, false);
  assert.equal(
    parsePreferences(JSON.stringify({ showContextCards: true })).showContextCards,
    true,
  );
  assert.equal(
    parsePreferences(JSON.stringify({ showContextCards: "yes" })).showContextCards,
    false,
  );
});

test("media controls default off and accept only a boolean opt in", () => {
  assert.equal(parsePreferences(null).showMediaControls, false);
  assert.equal(
    parsePreferences(JSON.stringify({ showMediaControls: true })).showMediaControls,
    true,
  );
  assert.equal(
    parsePreferences(JSON.stringify({ showMediaControls: 1 })).showMediaControls,
    false,
  );
});

test("launcher gesture preferences are validated", () => {
  assert.equal(parsePreferences(null).doubleTapSearch, false);
  assert.equal(parsePreferences(null).swipeUpSearch, true);
  assert.equal(
    parsePreferences(JSON.stringify({ doubleTapSearch: true, swipeUpSearch: false }))
      .doubleTapSearch,
    true,
  );
  assert.equal(
    parsePreferences(JSON.stringify({ doubleTapSearch: "yes", swipeUpSearch: 1 }))
      .swipeUpSearch,
    true,
  );
});

test("blueprint guides are disabled by default and opt in explicitly", () => {
  assert.equal(parsePreferences(null).showBlueprint, false);
  assert.equal(
    parsePreferences(JSON.stringify({ showBlueprint: true })).showBlueprint,
    true,
  );
  assert.equal(
    parsePreferences(JSON.stringify({ showBlueprint: "yes" })).showBlueprint,
    false,
  );
});
