import { fetchStorefrontProductListing } from "@/lib/storefront";
import { ProductSectionsPrimary, ProductSectionsSecondary } from "./product-sections-client";

export async function HomeProductsPrimary() {
  // Fetch only the first 8 items for the topmost carousel
  // This is significantly faster than fetching 32 items
  const initialProductListing = await fetchStorefrontProductListing({
    scope: "homepage",
    limit: 8,
  }).catch(() => undefined);

  return <ProductSectionsPrimary initialProductListing={initialProductListing as any} />;
}

export async function HomeProductsSecondary() {
  // Fetch the rest of the homepage pool for the filtering/bestsellers sections
  const initialProductListing = await fetchStorefrontProductListing({
    scope: "homepage",
    limit: 32,
  }).catch(() => undefined);

  return <ProductSectionsSecondary initialProductListing={initialProductListing as any} />;
}
