import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { App } from "../launcher/catalog";
import type { Theme } from "../preferences";

type Props = {
  app: App | null;
  theme: Theme;
  left: boolean;
  scale: number;
  centerY: number;
  onClose(): void;
  onAppInfo(): void;
  onAppNotifications(): void;
  onRemoveFromDial(): void;
};

export function QuickMenu({
  app,
  theme,
  left,
  scale,
  centerY,
  onClose,
  onAppInfo,
  onAppNotifications,
  onRemoveFromDial,
}: Props) {
  if (!app) return null;

  const cardWidth = Math.min(260, 220 * scale);
  const cardTop = centerY + 30 * scale;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.veil}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      >
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              top: cardTop,
              backgroundColor: theme.panel,
              borderColor: theme.muted2,
            },
            left ? { right: 24 * scale } : { left: 24 * scale },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* App display title */}
          <Text
            style={[
              styles.appTitle,
              { color: theme.muted },
            ]}
            numberOfLines={1}
          >
            {app.label.toLowerCase()}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.muted2 }]} />

          {/* App Info item */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open app info"
            onPress={() => {
              onAppInfo();
              onClose();
            }}
            style={styles.menuItem}
          >
            <Text style={[styles.itemText, { color: theme.muted2 }]}>
              app info
            </Text>
          </Pressable>

          {/* App Notifications item (on and off switches) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open app notifications"
            onPress={() => {
              onAppNotifications();
              onClose();
            }}
            style={styles.menuItem}
          >
            <Text style={[styles.itemText, { color: theme.muted2 }]}>
              app notifications
            </Text>
          </Pressable>

          {/* Remove from dial item */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove from dial"
            onPress={() => {
              onRemoveFromDial();
              onClose();
            }}
            style={styles.menuItem}
          >
            <Text style={[styles.itemText, { color: theme.muted2 }]}>
              remove from dial
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  veil: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  card: {
    position: "absolute",
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  appTitle: {
    fontSize: 11,
    fontFamily: "JetBrainsMono",
    letterSpacing: 0.6,
    paddingStart: 12,
    paddingTop: 10,
    paddingEnd: 12,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    opacity: 0.3,
    marginVertical: 2,
  },
  menuItem: {
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 13,
    fontFamily: "JetBrainsMono",
  },
});
