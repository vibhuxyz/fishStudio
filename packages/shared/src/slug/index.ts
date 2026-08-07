/** Normalize a category name or slug for comparison. */
export const normalizeSlug = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[&\s\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
