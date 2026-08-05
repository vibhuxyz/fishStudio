// Mirrors user-ui's cloudinaryLoader (apps/user-ui/utils/cloudinary-loader.ts) —
// product photos are uploaded as a single 1200-1600px derivative, so list/grid
// cards were downloading and decoding the full-size image just to show it at
// ~130px tall.
export function cloudinaryThumbnail(url?: string, width = 300) {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const params = ["f_auto", "q_auto", `w_${width}`, "c_limit"].join(",");
  return url.replace("/upload/", `/upload/${params}/`);
}
