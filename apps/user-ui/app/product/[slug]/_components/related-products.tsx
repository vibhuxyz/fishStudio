import { fetchStorefrontProductListing } from "@/lib/storefront";
import { ProductCarousel } from "@/components/shared/product-carousel";

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

export async function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  // Fetch up to 12 products from the same category
  const listing = await fetchStorefrontProductListing({
    scope: "category",
    category,
    limit: 12,
  }).catch(() => undefined);

  if (!listing || listing.products.length <= 1) return null;

  // Filter out the current product
  const otherProducts = listing.products.filter((p) => p.id !== currentProductId);

  return (
    <section className="mt-10 px-0 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          More from {category}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
          You May Also Like
        </h2>
      </div>
      <ProductCarousel products={otherProducts} variant="compact" />
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section className="mt-10 px-0 py-10 opacity-50">
      <div className="mb-6 text-center">
        <div className="mx-auto h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="mx-auto mt-2 h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 w-60 flex-shrink-0 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </section>
  );
}
