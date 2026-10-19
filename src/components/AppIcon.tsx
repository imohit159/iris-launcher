import { Image, StyleSheet } from "react-native";
import type { App } from "../launcher/catalog";
import { iconUri } from "../launcher/catalog";
import type { Theme } from "../preferences";

export type IconStyle = "native" | "monochrome" | "outline";

type Props = {
  app: Pick<App, "icon" | "label">;
  theme: Theme;
  style: IconStyle;
  size?: number;
};

/** One presentation path for app icons in search, organization, and future lists. */
export function AppIcon({ app, theme, style, size = 32 }: Props) {
  return (
    <Image
      source={{ uri: iconUri(app.icon) }}
      accessibilityLabel={`${app.label} icon`}
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: Math.round(size * 0.24) },
        style === "monochrome" && { tintColor: theme.fg },
        style === "outline" && {
          tintColor: theme.fg,
          opacity: 0.72,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.muted2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: "transparent",
  },
});
