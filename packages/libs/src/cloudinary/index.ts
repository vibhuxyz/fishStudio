import { v2 as cloudinary } from "cloudinary";
import { ENV } from "@repo/env-config";
import { ValidationError } from "@repo/error-handlers";

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Hard limit on base64 upload size (~10 MB of image data -> ~13.3 MB base64).
export const MAX_BASE64_IMAGE_LENGTH = 15 * 1024 * 1024;

// Cloudinary's SDK default is a 60s socket-inactivity timeout, which a batch of
// full-size images uploading in parallel blows through and returns as a 499.
export const CLOUDINARY_UPLOAD_TIMEOUT_MS = 2 * 60 * 1000;

// Only allow `data:image/<type>;base64,...` URIs to prevent Cloudinary from
// fetching arbitrary URLs (SSRF / metadata-service exfiltration / cost abuse).
export const assertSafeImageSource = (value: unknown): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError("Invalid image payload");
  }
  if (value.length > MAX_BASE64_IMAGE_LENGTH) {
    throw new ValidationError("Image is too large (max ~10 MB)");
  }
  const match = value.match(/^data:image\/(png|jpe?g|webp|gif|avif|heic|heif);base64,/i);
  if (!match) {
    throw new ValidationError("Only base64-encoded image data URIs are accepted");
  }
  return value;
};
