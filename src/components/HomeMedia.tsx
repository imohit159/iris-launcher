import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MediaState } from "../context/media";
import type { Theme } from "../preferences";
import { SURFACES, TYPOGRAPHY } from "../design/tokens";

type Props = {
  theme: Theme;
  scale: number;
  top: number;
  left: boolean;
  media: MediaState | null;
  onControl(action: "play" | "pause" | "next" | "previous"): void;
};

export function HomeMedia({ theme, scale, top, left, media, onControl }: Props) {
  if (!media) return null;
  const actionColor = theme.fg;
  return (
    <View
      style={[
        styles.card,
        {
          top,
          [left ? "left" : "right"]: 24 * scale,
          alignItems: left ? "flex-start" : "flex-end",
          backgroundColor: `${SURFACES.elevated}dd`,
          borderColor: `${theme.muted2}66`,
          transform: [{ scale }],
          transformOrigin: left ? "top left" : "top right",
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.fg }]} numberOfLines={1}>
        {media.title}
      </Text>
      {media.artist ? (
        <Text style={[styles.artist, { color: theme.muted }]} numberOfLines={1}>
          {media.artist}
        </Text>
      ) : null}
      <View style={styles.controls}>
        <ControlButton
          icon="play-skip-back"
          label="Previous track"
          enabled={media.canPrevious}
          color={actionColor}
          onPress={() => onControl("previous")}
        />
        <ControlButton
          icon={media.playing ? "pause" : "play"}
          label={media.playing ? "Pause" : "Play"}
          enabled={media.playing ? media.canPause : media.canPlay}
          color={theme.accent}
          onPress={() => onControl(media.playing ? "pause" : "play")}
        />
        <ControlButton
          icon="play-skip-forward"
          label="Next track"
          enabled={media.canNext}
          color={actionColor}
          onPress={() => onControl("next")}
        />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  enabled,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  enabled: boolean;
  color: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={[styles.control, { opacity: enabled ? 1 : 0.3 }]}
    >
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: 236,
    minHeight: 74,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  title: {
    ...TYPOGRAPHY.option,
    maxWidth: 206,
  },
  artist: {
    ...TYPOGRAPHY.meta,
    maxWidth: 206,
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 6,
  },
  control: {
    minWidth: 28,
    minHeight: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});
