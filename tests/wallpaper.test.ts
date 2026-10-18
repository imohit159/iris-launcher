import assert from "node:assert/strict";
import test from "node:test";
import { wallpaperCrop, isWallpaperName } from "../src/wallpaper/model.ts";

test("wallpaper crop covers portrait screen without stretching or keeping oversized pixels", () => {
  const plan = wallpaperCrop(4000, 3000, 1080, 2400);
  assert.deepEqual(plan.resize, { width: 3200, height: 2400 });
  assert.deepEqual(plan.crop, {
    originX: 1060,
    originY: 0,
    width: 1080,
    height: 2400,
  });
  const small = wallpaperCrop(300, 600, 1080, 2400);
  assert.deepEqual(small.resize, { width: 300, height: 600 });
  assert.equal(small.crop.width, 270);
  assert.equal(small.crop.height, 600);
  assert.throws(() => wallpaperCrop(0, 300, 1080, 2400));
  assert.throws(() => wallpaperCrop(NaN, 300, 1080, 2400));
});
test("wallpaper persistence accepts only app-generated filenames", () => {
  assert.equal(isWallpaperName("wallpaper-12345678-abcdef12.jpg"), true);
  for (const value of [
    null,
    42,
    "../photo.jpg",
    "file:///sdcard/photo.jpg",
    "wallpaper-123-abc.jpg/../prefs",
    "photo.png",
  ])
    assert.equal(isWallpaperName(value), false);
});
