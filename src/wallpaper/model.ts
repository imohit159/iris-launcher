export function isWallpaperName(value: unknown): value is string {
  return (
    typeof value === "string" && /^wallpaper-[0-9]+-[a-z0-9]+\.jpg$/.test(value)
  );
}
// Match Detent: centre-cover crop, never upscale, and retain at most screen-sized pixels.
export function wallpaperCrop(
  imageWidth: number,
  imageHeight: number,
  screenWidth: number,
  screenHeight: number,
) {
  if (
    ![imageWidth, imageHeight, screenWidth, screenHeight].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  )
    throw new Error("Invalid photo dimensions");
  const scale = Math.min(
    1,
    Math.max(screenWidth / imageWidth, screenHeight / imageHeight),
  );
  const width = Math.max(1, Math.round(imageWidth * scale)),
    height = Math.max(1, Math.round(imageHeight * scale));
  const cropWidth = Math.max(
    1,
    Math.min(width, Math.round((height * screenWidth) / screenHeight)),
  );
  const cropHeight = Math.max(
    1,
    Math.min(height, Math.round((width * screenHeight) / screenWidth)),
  );
  return {
    resize: { width, height },
    crop: {
      originX: Math.floor((width - cropWidth) / 2),
      originY: Math.floor((height - cropHeight) / 2),
      width: cropWidth,
      height: cropHeight,
    },
  };
}
