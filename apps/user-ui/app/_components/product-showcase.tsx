import { cache } from "react";
import { fetchStorefrontProductListing } from "@/lib/storefront";
import { ProductSectionsPrimary, ProductSectionsSecondary } from "./product-sections-client";

// Single shared fetch for the homepage. React.cache dedupes across the two
// Suspense boundaries so we hit the backend once instead of twice.
// Primary slices the first 8; Secondary uses the full 32 for bestsellers/favorites.
const getHomepageListing = cache(() =>
  fetchStorefrontProductListing({ scope: "homepage", limit: 32 }).catch(() => undefined),
);

export async function HomeProductsPrimary() {
  const initialProductListing = await getHomepageListing();
  return <ProductSectionsPrimary initialProductListing={initialProductListing as any} />;
}

export async function HomeProductsSecondary() {
  const initialProductListing = await getHomepageListing();
  return <ProductSectionsSecondary initialProductListing={initialProductListing as any} />;
}
