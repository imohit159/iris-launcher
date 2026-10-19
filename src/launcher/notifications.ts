import { requireOptionalNativeModule } from "expo";

export type NotificationCapability =
  | "available"
  | "needs-permission"
  | "unavailable"
  | "error";

type NotificationIndicatorsModule = {
  isAccessGranted(): Promise<boolean>;
  getActivePackages(): Promise<string[]>;
  openSettings(): void;
  clear(): Promise<void>;
};

const native = requireOptionalNativeModule<NotificationIndicatorsModule>(
  "NotificationIndicators",
);

export async function readNotificationState() {
  if (!native) {
    return {
      capability: "unavailable" as const,
      packageNames: [] as string[],
    };
  }
  try {
    const granted = await native.isAccessGranted();
    if (!granted) {
      return {
        capability: "needs-permission" as const,
        packageNames: [] as string[],
      };
    }
    return {
      capability: "available" as const,
      packageNames: await native.getActivePackages(),
    };
  } catch {
    return {
      capability: "error" as const,
      packageNames: [] as string[],
    };
  }
}

export function openNotificationAccessSettings() {
  native?.openSettings();
}
