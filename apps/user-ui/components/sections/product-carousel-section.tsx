import { ProductCarousel } from "@/components/shared/product-carousel";
import type { Product } from "@/lib/types";

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  priorityImages?: boolean;
  variant?: "compact" | "full";
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
}: ProductCarouselSectionProps) {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Server-rendered heading -- fully crawlable by search engines */}
        <div className="mb-6 text-center">
          {subtitle && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {subtitle}
            </p>
          )}
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h2>
        </div>

        {/* Client island -- only the scrollable carousel is interactive */}
        <ProductCarousel
          products={products}
          priorityImages={priorityImages}
          variant={variant}
        />
      </div>
    </section>
  );
}
