import { Linking } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import { InstalledApps, RNLauncherKitHelper } from "react-native-launcher-kit";
import { catalog, type App } from "./catalog";
export async function loadApps() {
  return catalog(
    await InstalledApps.getSortedApps({
      includeVersion: false,
      includeAccentColor: false,
    }),
  );
}
export async function launch(app: App) {
  if (!(await RNLauncherKitHelper.checkIfPackageInstalled(app.packageName)))
    throw new Error("App is no longer installed.");
  RNLauncherKitHelper.launchApplication(app.packageName);
}
export async function setHome() {
  if (!(await RNLauncherKitHelper.requestDefaultLauncher()))
    await Linking.sendIntent("android.settings.HOME_SETTINGS");
}
export async function openDateSettings() {
  try {
    await Linking.sendIntent("android.settings.DATE_SETTINGS");
  } catch {
    try {
      await Linking.sendIntent("android.settings.SETTINGS");
    } catch {
      RNLauncherKitHelper.openAlarmApp();
    }
  }
}
export const openClock = openDateSettings;

export async function openNotificationSettings() {
  try {
    await Linking.sendIntent("android.settings.ALL_APPS_NOTIFICATION_SETTINGS");
  } catch {
    try {
      await Linking.sendIntent("android.settings.NOTIFICATION_SETTINGS");
    } catch {
      await Linking.sendIntent("android.settings.SETTINGS");
    }
  }
}

export async function openAppNotificationSettings(packageName: string) {
  try {
    await Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS", [
      { key: "android.provider.extra.APP_PACKAGE", value: packageName },
    ]);
  } catch {
    await openAppDetails(packageName);
  }
}

export async function openAppDetails(packageName: string) {
  try {
    await IntentLauncher.startActivityAsync(
      "android.settings.APPLICATION_DETAILS_SETTINGS",
      { data: `package:${packageName}` },
    );
  } catch {
    try {
      await Linking.sendIntent("android.settings.SETTINGS");
    } catch {
      // noop
    }
  }
}
export function watchApps(refresh: () => void) {
  InstalledApps.startListeningForAppInstallations(refresh);
  InstalledApps.startListeningForAppRemovals(refresh);
  return () => {
    InstalledApps.stopListeningForAppInstallations();
    InstalledApps.stopListeningForAppRemovals();
  };
}
