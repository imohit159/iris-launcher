import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseBackup, serializePreferences } from "./backup.ts";
import type { Preferences } from "./schema.ts";

const backupKey = "iris.expo.preferences.backup.v1";

export async function saveLocalBackup(prefs: Preferences) {
  await AsyncStorage.setItem(backupKey, serializePreferences(prefs));
}

export async function restoreLocalBackup(): Promise<Preferences | null> {
  const raw = await AsyncStorage.getItem(backupKey);
  return raw ? parseBackup(raw) : null;
}
