import { Linking } from "react-native";
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
export const openClock = () => RNLauncherKitHelper.openAlarmApp();
export function watchApps(refresh: () => void) {
  InstalledApps.startListeningForAppInstallations(refresh);
  InstalledApps.startListeningForAppRemovals(refresh);
  return () => {
    InstalledApps.stopListeningForAppInstallations();
    InstalledApps.stopListeningForAppRemovals();
  };
}
