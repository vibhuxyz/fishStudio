import { fetchStorefrontProductListing, fetchStorefrontCategories } from "@/lib/storefront";
import { normalizeSlug } from "@/lib/normalize-slug";
import { CategoryShell } from "./category-shell";

interface CategoryDataStreamProps {
  slug: string;
  initialSub?: string;
}

export async function CategoryDataStream({ slug, initialSub }: CategoryDataStreamProps) {
  const decodedSlug = decodeURIComponent(slug);
  
  // 1. Initial parallel fetch for SEO data + Categories
  const [categoriesData, primaryListing] = await Promise.all([
    fetchStorefrontCategories(),
    fetchStorefrontProductListing({
      scope: "category",
      category: decodedSlug,
      limit: 12,
    }).catch(() => undefined),
  ]);

  const resolvedCategory = categoriesData.categories.find(
    (cat) => normalizeSlug(cat) === normalizeSlug(decodedSlug)
  ) ?? null;

  const displayName = resolvedCategory ?? decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <CategoryShell
      slug={slug}
      initialSub={initialSub}
      displayName={displayName}
      matchedCategory={resolvedCategory}
      initialCategories={categoriesData}
      primaryListing={primaryListing as any}
    />
  );
}
