/**
 * Downscale and re-encode a picked photo into a data URL fit to upload.
 *
 * A still from a phone camera is 3–12 MB, and base64 adds a third on top. That
 * payload is large enough to die somewhere between the phone and the upstream
 * — the gateway turns any such failure into a bare 502, which tells the person
 * holding the phone nothing at all.
 *
 * The other staff photo flows never hit this because useCameraCapture draws a
 * live video frame (1080p at most) onto a canvas. This does the same job for a
 * file the camera app handed back, so both paths upload comparable sizes.
 *
 * `imageOrientation: "from-image"` is not incidental: a phone writes rotation
 * into EXIF rather than into the pixels, and a canvas that ignores it turns
 * every portrait selfie on its side.
 */
export async function downscaleImageToDataUrl(
  file: File,
  { maxDimension = 1280, quality = 0.85 }: { maxDimension?: number; quality?: number } = {},
): Promise<string> {
  const bitmap = await loadBitmap(file);

  // Only ever shrink. Scaling a small photo up would cost bytes and add nothing.
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process that photo");
  context.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();

  // JPEG, not PNG: a photograph as PNG is several times larger, which is the
  // whole problem this function exists to avoid.
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * createImageBitmap is the path that can apply EXIF orientation itself. Safari
 * only grew the options argument recently, so fall back to an <img> when it
 * throws — there the browser applies orientation while decoding anyway.
 */
async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Older Safari rejects the options object outright; the <img> path below
      // handles the same file correctly.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read that photo"));
      image.src = url;
    });
  } finally {
    // Safe here: drawImage has either already run against a decoded image or
    // the load failed, so nothing still needs the object URL.
    URL.revokeObjectURL(url);
  }
}
