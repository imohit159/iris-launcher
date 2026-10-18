import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { wallpaperCrop } from "./model";
import { storeWallpaper } from "./storage";

export async function pickWallpaper(
  width: number,
  height: number,
): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [width, height],
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error("No photo selected");
  const plan = wallpaperCrop(asset.width, asset.height, width, height);
  const context = ImageManipulator.manipulate(asset.uri);
  let image: Awaited<ReturnType<typeof context.renderAsync>> | undefined;
  let temporary: string | undefined;
  try {
    context.resize(plan.resize).crop(plan.crop);
    image = await context.renderAsync();
    const output = await image.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.92,
    });
    temporary = output.uri;
    return await storeWallpaper(output.uri);
  } finally {
    image?.release();
    context.release();
    if (temporary)
      await FileSystem.deleteAsync(temporary, { idempotent: true }).catch(
        () => {},
      );
  }
}
