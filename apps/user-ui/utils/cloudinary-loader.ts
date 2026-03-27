import { ImageLoaderProps } from "next/image";

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  // If it's not a Cloudinary URL, return as is (but with width param to satisfy Next.js warning)
  if (!src.includes("res.cloudinary.com")) {
    return src.includes("?") ? `${src}&w=${width}` : `${src}?w=${width}`;
  }

  // Parameters for Cloudinary transformation
  // f_auto: Automatically choose the best format (WebP, AVIF, etc.)
  // q_auto: Automatically choose the best quality
  // w_{width}: Resize to the requested width
  // c_limit: Resize only if the original image is larger, preserving aspect ratio
  const params = [
    "f_auto",
    "q_auto",
    `w_${width}`,
    "c_limit",
  ].join(",");

  // Check if the URL already has transformations
  // Standard Cloudinary URL: https://res.cloudinary.com/cloud_name/image/upload/v12345/sample.jpg
  // We want to insert params after /upload/
  return src.replace("/upload/", `/upload/${params}/`);
}
