import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
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
}: {
  theme: Theme;
  left: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const wall = left && theme.wallLeft ? theme.wallLeft : theme.wall;
  const image = useImage(artwork[wall ?? "hands"]);
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
