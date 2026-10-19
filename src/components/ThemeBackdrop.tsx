import { useEffect, useEffectEvent, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Skia,
  type SkImage,
  ColorMatrix,
  Blur,
  Group,
  Image,
  LinearGradient,
  Rect,
  FractalNoise,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import type { Theme } from "../themes/catalog";
import { artwork } from "../themes/assets";

export function ThemeBackdrop({
  theme,
  wallpaperTheme,
  left,
  customWallpaper,
  dimming = 0,
  wallpaperBlur = 0,
  wallpaperTint = false,
  wallpaperGrain = false,
  onWallpaperError,
}: {
  theme: Theme;
  wallpaperTheme?: Theme | null;
  left: boolean;
  customWallpaper: string | null;
  dimming?: number;
  wallpaperBlur?: 0 | 4 | 8 | 12;
  wallpaperTint?: boolean;
  wallpaperGrain?: boolean;
  onWallpaperError(): void;
}) {
  const { width, height } = useWindowDimensions();
  const visualTheme = wallpaperTheme ?? theme;
  const visualWall = left && visualTheme.wallLeft ? visualTheme.wallLeft : visualTheme.wall;
  const wall =
    customWallpaper ?? visualWall;
  const builtin = useImage(artwork[visualWall ?? "hands"]);
  const [customImage, setCustomImage] = useState<SkImage | null>(null);
  const [loadedWallpaper, setLoadedWallpaper] = useState<string | null>(null);
  const customImageRef = useRef<SkImage | null>(null);
  const reportError = useEffectEvent(onWallpaperError);
  useEffect(() => {
    customImageRef.current?.dispose();
    customImageRef.current = null;
    if (!customWallpaper) return;
    let cancelled = false;
    void Skia.Data.fromURI(customWallpaper)
      .then((data) => {
        const decoded = Skia.Image.MakeImageFromEncoded(data);
        if (!decoded) throw new Error("Cannot decode wallpaper");
        if (cancelled) decoded.dispose();
        else {
          customImageRef.current = decoded;
          setCustomImage(decoded);
          setLoadedWallpaper(customWallpaper);
        }
      })
      .catch(() => {
        if (!cancelled) reportError();
      });
    return () => {
      cancelled = true;
    };
  }, [customWallpaper]);
  useEffect(
    () => () => {
      customImageRef.current?.dispose();
      customImageRef.current = null;
    },
    [],
  );
  const image =
    customWallpaper && loadedWallpaper === customWallpaper
      ? customImage
      : builtin;
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
          >
            {wallpaperBlur > 0 ? <Blur blur={wallpaperBlur} /> : null}
          </Image>
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
              {wallpaperBlur > 0 ? <Blur blur={wallpaperBlur} /> : null}
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
      {wall && wallpaperTint ? (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          color={theme.accent}
          opacity={0.1}
        />
      ) : null}
      {wall && wallpaperGrain ? (
        <Rect x={0} y={0} width={width} height={height} opacity={0.06}>
          <FractalNoise
            freqX={0.06}
            freqY={0.06}
            octaves={2}
            seed={0.42}
            tileWidth={width}
            tileHeight={height}
          />
        </Rect>
      ) : null}
      {wall && dimming > 0 ? (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          color="#000000"
          opacity={dimming}
        />
      ) : null}
    </Canvas>
  );
}
