import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { Section } from "./Section";
import { TYPOGRAPHY } from "../design/tokens";
import type { NotificationCapability } from "../launcher/notifications";

type Props = {
  theme: Theme;
  hiddenAppCount: number;
  notificationCapability: NotificationCapability;
  onOpenNotificationAccess(): void;
};

export function PrivacySettings({
  theme,
  hiddenAppCount,
  notificationCapability,
  onOpenNotificationAccess,
}: Props) {
  const notificationDescription =
    notificationCapability === "available"
      ? "Android notification access is active. Iris reads package names only to show dots."
      : notificationCapability === "needs-permission"
        ? "Allow Android notification access to show package-level dots; message text is never read."
        : notificationCapability === "error"
          ? "Android notification access could not be read. Try opening its settings again."
          : "This build does not include the optional notification access adapter.";
  return (
    <View style={styles.screen}>
      <Section first label="On device" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.fg }]}>Your themes, favorites, wallpapers, and launcher preferences stay on this device.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Iris does not include analytics, accounts, or a remote settings service.</Text>
      </Section>
      <Section label="App visibility" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.fg }]}>
          {hiddenAppCount === 0
            ? "No apps are hidden. Manage visibility from Apps and labels."
            : `${hiddenAppCount} app${hiddenAppCount === 1 ? " is" : "s are"} hidden from the launcher.`}
        </Text>
        <Text style={[styles.body, { color: theme.muted }]}>Notification indicators are shown only when Android provides the required access.</Text>
      </Section>
      <Section label="Notification indicators" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.muted }]}>
          {notificationDescription}
        </Text>
        {notificationCapability !== "unavailable" ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenNotificationAccess}
            style={styles.action}
          >
            <Text style={[styles.actionText, { color: theme.accent }]}>Open Android notification access</Text>
          </Pressable>
        ) : null}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { ...TYPOGRAPHY.body, marginBottom: 12 },
  action: { paddingVertical: 12 },
  actionText: { ...TYPOGRAPHY.button },
});
