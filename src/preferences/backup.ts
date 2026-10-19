import {
  parsePreferences,
  PREFERENCES_VERSION,
  type Preferences,
} from "./schema.ts";

const BACKUP_FORMAT = "iris-launcher-preferences";

export function serializePreferences(prefs: Preferences): string {
  return JSON.stringify(
    {
      format: BACKUP_FORMAT,
      version: PREFERENCES_VERSION,
      preferences: prefs,
    },
    null,
    2,
  );
}

export function parseBackup(raw: string): Preferences {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") throw new Error("Backup is not an object");
  const record = value as Record<string, unknown>;
  if (record.format !== BACKUP_FORMAT || !record.preferences)
    throw new Error("This file is not an Iris backup");
  return parsePreferences(JSON.stringify(record.preferences));
}
