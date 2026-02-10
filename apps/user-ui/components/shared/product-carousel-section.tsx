import { ProductCarousel } from "@/components/shared/product-carousel";
import type { Product } from "@repo/types";

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  priorityImages?: boolean;
  variant?: "compact" | "full";
  isLoading?: boolean; // ✅ Add prop
}

export function ProductCarouselSection({
  title,
  subtitle,
  products,
  priorityImages = false,
  variant = "compact",
  isLoading = false, // ✅ Default false
}: ProductCarouselSectionProps) {
  // If not loading and no products, don't render the section at all
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
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

        <ProductCarousel
          products={products}
          priorityImages={priorityImages}
          variant={variant}
          isLoading={isLoading} // ✅ Pass it down
        />
      </div>
    </section>
  );
}
