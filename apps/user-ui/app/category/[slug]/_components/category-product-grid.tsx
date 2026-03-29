"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shared/product-card";
import type { Product } from "@repo/zod-schema";

interface CategoryProductGridProps {
  activeSubCategory: string | null;
  products: Product[];
  isLoading: boolean;
}

export function CategoryProductGrid({
  activeSubCategory,
  products,
  isLoading,
}: CategoryProductGridProps) {
  const displayedProducts = useMemo(() => {
    if (!activeSubCategory) return products;
    return products.filter((p) => p.subCategory === activeSubCategory);
  }, [products, activeSubCategory]);

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-foreground">No products available yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Check back soon for products in this category.</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{displayedProducts.length}</span>{" "}
          {activeSubCategory ? `products in "${activeSubCategory}"` : "products"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeSubCategory || "all"}
           initial={{ opacity: 0, y: 8 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.2 }}
           className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
        >
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 8}
              variant="compact"
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
