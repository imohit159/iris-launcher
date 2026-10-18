import { useEffect, useEffectEvent, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Skia,
  type SkImage,
  ColorMatrix,
  Group,
  Image,
  LinearGradient,
  Rect,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import type { Theme } from "../themes/catalog";
import { artwork } from "../themes/assets";

export function ThemeBackdrop({
  theme,
  left,
  customWallpaper,
  onWallpaperError,
}: {
  theme: Theme;
  left: boolean;
  customWallpaper: string | null;
  onWallpaperError(): void;
}) {
  const { width, height } = useWindowDimensions();
  const wall =
    customWallpaper ?? (left && theme.wallLeft ? theme.wallLeft : theme.wall);
  const builtin = useImage(
    artwork[(left && theme.wallLeft ? theme.wallLeft : theme.wall) ?? "hands"],
  );
  const [customImage, setCustomImage] = useState<SkImage | null>(null);
  const reportError = useEffectEvent(onWallpaperError);
  useEffect(() => {
    if (!customWallpaper) return;
    let cancelled = false;
    void Skia.Data.fromURI(customWallpaper)
      .then((data) => {
        const decoded = Skia.Image.MakeImageFromEncoded(data);
        if (!decoded) throw new Error("Cannot decode wallpaper");
        if (cancelled) decoded.dispose();
        else setCustomImage(decoded);
      })
      .catch(() => {
        if (!cancelled) reportError();
      });
    return () => {
      cancelled = true;
    };
  }, [customWallpaper]);
  const image = customWallpaper ? (customImage ?? builtin) : builtin;
  const rgb = (color: string) =>
    [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
  const bg = rgb(theme.bg),
    hand = rgb(theme.hand);
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {image &&
        (wall ? (
          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        ) : (
          <Group
            transform={left ? [{ translateX: width }, { scaleX: -1 }] : []}
          >
            <Image
              image={image}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="cover"
            >
              <ColorMatrix
                matrix={[
                  hand[0] - bg[0],
                  0,
                  0,
                  0,
                  bg[0],
                  hand[1] - bg[1],
                  0,
                  0,
                  0,
                  bg[1],
                  hand[2] - bg[2],
                  0,
                  0,
                  0,
                  bg[2],
                  0,
                  0,
                  0,
                  1,
                  0,
                ]}
              />
            </Image>
          </Group>
        ))}
      {wall && (
        <>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              positions={[0, 0.32, 0.7, 1]}
              colors={[
                `${theme.bg}99`,
                `${theme.bg}26`,
                `${theme.bg}33`,
                `${theme.bg}bf`,
              ]}
            />
          </Rect>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, 0)}
              positions={[0, 0.5, 1]}
              colors={
                left
                  ? [`${theme.bg}db`, `${theme.bg}80`, `${theme.bg}33`]
                  : [`${theme.bg}33`, `${theme.bg}80`, `${theme.bg}db`]
              }
            />
          </Rect>
        </>
      )}
    </Canvas>
  );
}
