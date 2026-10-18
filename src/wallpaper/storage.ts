import * as FileSystem from "expo-file-system/legacy";
import { isWallpaperName } from "./model";

function directory() {
  if (!FileSystem.documentDirectory)
    throw new Error("Wallpaper storage is unavailable");
  return `${FileSystem.documentDirectory}wallpapers/`;
}
export function wallpaperUri(name: string): string {
  if (!isWallpaperName(name)) throw new Error("Invalid wallpaper name");
  return `${directory()}${name}`;
}
export async function storeWallpaper(source: string): Promise<string> {
  const name = `wallpaper-${Date.now()}-${Math.random().toString(36).slice(2, 10).padEnd(8, "0")}.jpg`;
  await FileSystem.makeDirectoryAsync(directory(), { intermediates: true });
  try {
    await FileSystem.copyAsync({ from: source, to: wallpaperUri(name) });
    return name;
  } catch (error) {
    await FileSystem.deleteAsync(wallpaperUri(name), {
      idempotent: true,
    }).catch(() => {});
    throw error;
  }
}
// Startup only, before wallpaper controls become ready. Never delete an unsaved future selection.
export async function restoreWallpaper(
  saved: string | null,
): Promise<string | null> {
  const name = saved && isWallpaperName(saved) ? saved : null;
  const exists = name
    ? await FileSystem.getInfoAsync(wallpaperUri(name)).catch(() => ({
        exists: false,
      }))
    : null;
  const keep = exists?.exists ? name : null;
  try {
    const files = await FileSystem.readDirectoryAsync(directory());
    await Promise.allSettled(
      files
        .filter((file) => isWallpaperName(file) && file !== keep)
        .map((file) =>
          FileSystem.deleteAsync(wallpaperUri(file), { idempotent: true }),
        ),
    );
  } catch {
    /* Missing directory or cleanup failure must not discard valid settings. */
  }
  return keep;
}
