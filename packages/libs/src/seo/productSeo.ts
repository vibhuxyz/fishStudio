import slugify from "slugify";

/* ---------------- SLUG ---------------- */

export function generateProductSlug(input: {
  title: string;
  category: string;
  subCategory: string;
  size: string;
  cuttingType: string;
}) {
  return slugify(
    [
      input.title,
      input.category,
      input.subCategory,
      input.size,
      input.cuttingType,
    ].join(" "),
    {
      lower: true,
      strict: true,
      trim: true,
    },
  );
}

/* ---------------- TAGS ---------------- */

export function generateProductTags(input: {
  category: string;
  subCategory: string;
  size: string;
  cuttingType: string;
  pieceSize?: string;
  origin?: string;
}) {
  const rawTags = [
    input.category,
    input.subCategory,
    input.size,
    input.cuttingType,
    input.pieceSize && `${input.pieceSize}-cut`,
    input.origin,
  ];

  return Array.from(
    new Set(
      rawTags.filter(Boolean).map((tag) =>
        tag!
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      ),
    ),
  );
}
