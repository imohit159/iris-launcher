import { test } from "node:test";
import assert from "node:assert/strict";
import {
  catalog,
  favorites,
  iconUri,
  letterIndex,
  search,
} from "../src/launcher/catalog.ts";
const apps = [
  { label: "Browser", packageName: "browser", icon: "" },
  { label: "Alarm", packageName: "alarm", icon: "" },
];
test("catalog excludes Iris, removes duplicate packages and sorts labels", () => {
  assert.deepEqual(
    catalog([
      ...apps,
      apps[0],
      { label: "Iris", packageName: "com.irislauncher", icon: "" },
    ]).map((app) => app.packageName),
    ["alarm", "browser"],
  );
});
test("search handles whitespace, casing and empty results", () => {
  assert.equal(search(apps, " BROw ")[0]?.packageName, "browser");
  assert.deepEqual(search(apps, "missing"), []);
});
test("favorites do not silently populate an empty dial", () => {
  assert.deepEqual(favorites(apps, []), []);
  assert.deepEqual(favorites(apps, ["removed"]), []);
  assert.equal(favorites(apps, ["alarm"])[0]?.label, "Alarm");
});
test("alphabet jump and base64/native icon URIs", () => {
  assert.equal(letterIndex(apps, "A"), 1);
  assert.equal(letterIndex(apps, "Z"), -1);
  assert.equal(iconUri("/cache/icon.png"), "file:///cache/icon.png");
  assert.equal(iconUri("abc"), "data:image/png;base64,abc");
  assert.equal(iconUri("file:///icon.png"), "file:///icon.png");
});
