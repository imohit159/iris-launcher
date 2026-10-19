import { StyleSheet, Text, View } from "react-native";
import type { CalendarEvent } from "../context/adapter";
import type { Theme } from "../preferences";
import { TYPOGRAPHY } from "../design/tokens";

type Props = {
  theme: Theme;
  scale: number;
  top: number;
  left: boolean;
  nextAlarmAt: number | null;
  nextEvent: CalendarEvent | null;
};

export function HomeContext({
  theme,
  scale,
  top,
  left,
  nextAlarmAt,
  nextEvent,
}: Props) {
  if (!nextAlarmAt && !nextEvent) return null;
  const detail = nextEvent
    ? `${nextEvent.title} · ${formatDate(nextEvent.startAt)}`
    : null;
  const alarm = nextAlarmAt ? `alarm ${formatTime(nextAlarmAt)}` : null;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top,
          [left ? "left" : "right"]: 28 * scale,
          alignItems: left ? "flex-start" : "flex-end",
        },
      ]}
    >
      {detail ? <Text style={[styles.text, { color: theme.muted }]} numberOfLines={1}>{detail}</Text> : null}
      {alarm ? <Text style={[styles.text, { color: theme.muted2 }]}>{alarm}</Text> : null}
    </View>
  );
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

const styles = StyleSheet.create({
  container: { position: "absolute", maxWidth: 240 },
  text: { ...TYPOGRAPHY.meta, fontFamily: "JetBrainsMono" },
});
