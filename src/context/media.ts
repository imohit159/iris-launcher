import { requireOptionalNativeModule } from "expo";

export type MediaCapability =
  | "available"
  | "needs-permission"
  | "unavailable"
  | "error";

export type MediaState = {
  packageName: string;
  title: string;
  artist?: string;
  playing: boolean;
  canPlay: boolean;
  canPause: boolean;
  canNext: boolean;
  canPrevious: boolean;
};

type NativeMedia = {
  isAccessGranted(): boolean;
  getState(): Promise<MediaState | null>;
  control(action: "play" | "pause" | "next" | "previous"): Promise<boolean>;
};

const native = requireOptionalNativeModule<NativeMedia>("MediaControls");

export async function readMediaState() {
  if (!native) {
    return {
      capability: "unavailable" as const,
      media: null,
    };
  }
  try {
    if (!native.isAccessGranted()) {
      return { capability: "needs-permission" as const, media: null };
    }
    return {
      capability: "available" as const,
      media: sanitizeMedia(await native.getState()),
    };
  } catch {
    return { capability: "error" as const, media: null };
  }
}

export async function controlMedia(
  action: "play" | "pause" | "next" | "previous",
) {
  if (!native) return false;
  try {
    return await native.control(action);
  } catch {
    return false;
  }
}

function sanitizeMedia(value: unknown): MediaState | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const packageName = typeof record.packageName === "string" ? record.packageName : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!packageName || !title) return null;
  return {
    packageName,
    title,
    artist: typeof record.artist === "string" ? record.artist.trim() || undefined : undefined,
    playing: record.playing === true,
    canPlay: record.canPlay === true,
    canPause: record.canPause === true,
    canNext: record.canNext === true,
    canPrevious: record.canPrevious === true,
  };
}
