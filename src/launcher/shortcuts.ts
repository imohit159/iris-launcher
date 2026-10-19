import { requireOptionalNativeModule } from "expo";

export type ShortcutCapability =
  | "available"
  | "unavailable"
  | "error";

export type AppShortcut = {
  id: string;
  label: string;
  longLabel?: string;
};

type NativeShortcuts = {
  isAvailable(): boolean;
  getShortcuts(packageName: string): Promise<AppShortcut[]>;
  startShortcut(packageName: string, shortcutId: string): Promise<boolean>;
};

const native = requireOptionalNativeModule<NativeShortcuts>("LauncherShortcuts");

export function shortcutCapability(): ShortcutCapability {
  if (!native) return "unavailable";
  try {
    return native.isAvailable() ? "available" : "unavailable";
  } catch {
    return "error";
  }
}

export async function readShortcuts(packageName: string) {
  const capability = shortcutCapability();
  if (capability !== "available") return { capability, shortcuts: [] as AppShortcut[] };
  try {
    const shortcuts = await native!.getShortcuts(packageName);
    return { capability, shortcuts: sanitizeShortcuts(shortcuts) };
  } catch {
    return { capability: "error" as const, shortcuts: [] as AppShortcut[] };
  }
}

export async function launchShortcut(packageName: string, shortcutId: string) {
  if (shortcutCapability() !== "available") return false;
  try {
    return await native!.startShortcut(packageName, shortcutId);
  } catch {
    return false;
  }
}

function sanitizeShortcuts(value: unknown): AppShortcut[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const label = typeof record.label === "string" ? record.label.trim() : "";
    if (!id || !label || seen.has(id)) return [];
    seen.add(id);
    const longLabel =
      typeof record.longLabel === "string" && record.longLabel.trim()
        ? record.longLabel.trim()
        : undefined;
    return [{ id, label, longLabel }];
  });
}
