import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ⬇️ slugify is CommonJS, load it this way
const slugify: (
  input: string,
  options?: {
    lower?: boolean;
    strict?: boolean;
    trim?: boolean;
  },
) => string = require("slugify");

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
