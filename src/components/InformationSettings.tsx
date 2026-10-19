import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { Theme } from "../preferences";
import { Section } from "./Section";
import { SettingRow } from "./SettingRow";
import { TYPOGRAPHY } from "../design/tokens";
import type { CalendarEvent, ContextCapability } from "../context/adapter";
import type { MediaCapability, MediaState } from "../context/media";

type Props = {
  theme: Theme;
  showDeviceStatus: boolean;
  onShowDeviceStatusChange(value: boolean): void;
  showContextCards: boolean;
  onShowContextCardsChange(value: boolean): void;
  calendarCapability: ContextCapability;
  nextAlarmAt: number | null;
  nextEvent: CalendarEvent | null;
  onRequestCalendar(): void;
  showMediaControls: boolean;
  onShowMediaControlsChange(value: boolean): void;
  mediaCapability: MediaCapability;
  media: MediaState | null;
  onMediaControl(action: "play" | "pause" | "next" | "previous"): void;
  showBlueprint: boolean;
  onShowBlueprintChange(value: boolean): void;
};

export function InformationSettings({
  theme,
  showDeviceStatus,
  onShowDeviceStatusChange,
  showContextCards,
  onShowContextCardsChange,
  calendarCapability,
  nextAlarmAt,
  nextEvent,
  onRequestCalendar,
  showMediaControls,
  onShowMediaControlsChange,
  mediaCapability,
  media,
  onMediaControl,
  showBlueprint,
  onShowBlueprintChange,
}: Props) {
  const calendarDescription =
    calendarCapability === "available"
      ? nextEvent
        ? `Next: ${nextEvent.title}`
        : "Calendar access is active; no event is scheduled in the next seven days."
      : calendarCapability === "needs-permission"
        ? "Allow calendar access to show the next local event."
        : "Calendar data is unavailable in this build.";
  return (
    <View style={styles.screen}>
      <Section first label="Context" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.fg }]}>Clock and date follow the phone’s regional format.</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Battery, network, calendar, weather, and media cards will be optional home modules.</Text>
      </Section>
      <Section label="Build" labelColor={theme.muted}>
        <Text style={[styles.value, { color: theme.fg }]}>Iris Launcher</Text>
        <Text style={[styles.body, { color: theme.muted }]}>Local-first Android launcher · Expo development build</Text>
      </Section>
      <Section label="Developer" labelColor={theme.muted}>
        <SettingRow
          label="Blueprint guides"
          description="Show alignment lines while refining layouts"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Blueprint guides"
              value={showBlueprint}
              onValueChange={onShowBlueprintChange}
            />
          }
        />
        <Text style={[styles.body, { color: theme.muted }]}>Guides are visual only, do not capture touches, and are disabled by default.</Text>
      </Section>
      <Section label="Home status" labelColor={theme.muted}>
        <SettingRow
          label="Device status"
          description="Show battery and network details on the home screen"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Device status"
              value={showDeviceStatus}
              onValueChange={onShowDeviceStatusChange}
            />
          }
        />
        <SettingRow
          label="Context cards"
          description="Show the next alarm and calendar event near the home status"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Context cards"
              value={showContextCards}
              onValueChange={onShowContextCardsChange}
            />
          }
        />
      </Section>
      <Section label="Calendar and alarms" labelColor={theme.muted}>
        <Text style={[styles.body, { color: theme.muted }]}>{calendarDescription}</Text>
        {nextAlarmAt ? (
          <Text style={[styles.body, { color: theme.fg }]}>Next alarm: {formatDate(nextAlarmAt)}</Text>
        ) : null}
        {calendarCapability === "needs-permission" ? (
          <Pressable onPress={onRequestCalendar} style={styles.action}>
            <Text style={[styles.actionText, { color: theme.accent }]}>Allow calendar access</Text>
          </Pressable>
        ) : null}
        <Text style={[styles.body, { color: theme.muted }]}>Weather remains an optional provider adapter. Media controls use Android notification access and stay local to this device.</Text>
      </Section>
      <Section label="Media" labelColor={theme.muted}>
        <SettingRow
          label="Media controls"
          description="Show the active player and playback controls on the home screen"
          theme={theme}
          trailing={
            <Switch
              accessibilityLabel="Media controls"
              value={showMediaControls}
              onValueChange={onShowMediaControlsChange}
            />
          }
        />
        <Text style={[styles.body, { color: theme.muted }]}>
          {mediaCapability === "available"
            ? media
              ? `Connected to ${media.title}.`
              : "Notification access is active; no player is currently publishing media."
            : mediaCapability === "needs-permission"
              ? "Enable notification access in Privacy to read local media sessions."
              : "Media controls are unavailable in this build."}
        </Text>
        {media ? (
          <View style={styles.mediaActions}>
            {media.canPrevious ? (
              <Pressable style={styles.action} onPress={() => onMediaControl("previous")}>
                <Text style={[styles.actionText, { color: theme.accent }]}>Previous</Text>
              </Pressable>
            ) : null}
            {(media.playing ? media.canPause : media.canPlay) ? (
              <Pressable style={styles.action} onPress={() => onMediaControl(media.playing ? "pause" : "play")}>
                <Text style={[styles.actionText, { color: theme.accent }]}>{media.playing ? "Pause" : "Play"}</Text>
              </Pressable>
            ) : null}
            {media.canNext ? (
              <Pressable style={styles.action} onPress={() => onMediaControl("next")}>
                <Text style={[styles.actionText, { color: theme.accent }]}>Next</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  value: { ...TYPOGRAPHY.sectionHeading },
  body: { ...TYPOGRAPHY.body, marginBottom: 12 },
  action: { paddingVertical: 10 },
  actionText: { ...TYPOGRAPHY.button },
  mediaActions: { flexDirection: "row", gap: 18 },
});

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
