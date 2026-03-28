// "use client";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { Product } from "@repo/zod-schema";

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  priorityImages?: boolean;
  variant?: "compact" | "full";
  isLoading?: boolean;
  viewAllHref?: string;
}

/**
 * Server Component wrapper -- the heading text is rendered on the server
 * for SEO. The interactive carousel scrolling is delegated to the client
 * ProductCarousel island.
 */
export function ProductCarouselSection({
  title,
  subtitle,
  products,
  priorityImages = false,
  variant = "compact",
  isLoading = false,
  viewAllHref,
}: ProductCarouselSectionProps) {
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Server-rendered heading -- fully crawlable by search engines */}
        <div className="mb-6 text-center">
          {subtitle && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-xs">
              {subtitle}
            </p>
          )}
          <h2 className="mt-1 font-serif text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            {title}
          </h2>
        </div>

        {/* Client island -- only the scrollable carousel is interactive */}
        <ProductCarousel
          products={products}
          priorityImages={priorityImages}
          variant={variant}
          isLoading={isLoading}
          viewAllHref={viewAllHref}
        />
      </div>
    </section>
  );
}
