import { Platform } from "react-native";
import { File } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import { parseBackup, serializePreferences } from "./backup";
import type { Preferences } from "./schema";

export type FileBackupResult = "saved" | "cancelled";

/** Export through Android's system document picker after an explicit user choice. */
export async function exportBackupFile(
  prefs: Preferences,
): Promise<FileBackupResult> {
  if (Platform.OS !== "android") {
    throw new Error("Portable backups are currently supported on Android only");
  }

  const permission =
    await LegacyFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return "cancelled";

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const uri = await LegacyFileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    `iris-backup-${stamp}`,
    "application/json",
  );
  await LegacyFileSystem.StorageAccessFramework.writeAsStringAsync(
    uri,
    serializePreferences(prefs),
    { encoding: LegacyFileSystem.EncodingType.UTF8 },
  );
  return "saved";
}

/** Open the system picker and validate the selected Iris JSON backup. */
export async function importBackupFile(): Promise<Preferences | null> {
  const picked = await File.pickFileAsync({
    mimeTypes: ["application/json", "text/plain"],
  });
  if (picked.canceled || !picked.result) return null;
  return parseBackup(await picked.result.text());
}
