import { fetchStorefrontProductListing, fetchStorefrontCategories } from "@/lib/storefront";
import { normalizeSlug } from "@/lib/normalize-slug";
import { CategoryShell } from "./category-shell";

interface CategoryDataStreamProps {
  slug: string;
  initialSub?: string;
}

export async function CategoryDataStream({ slug, initialSub }: CategoryDataStreamProps) {
  const decodedSlug = decodeURIComponent(slug);
  
  const categoriesData = await fetchStorefrontCategories();
  const resolvedCategory = categoriesData.categories.find(
    (cat) => normalizeSlug(cat) === normalizeSlug(decodedSlug)
  ) ?? null;

  // 2. Fetch products using the resolved (Official) name
  const primaryListing = await fetchStorefrontProductListing({
    scope: "category",
    category: resolvedCategory || decodedSlug,
    limit: 12,
  }).catch(() => undefined);

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
