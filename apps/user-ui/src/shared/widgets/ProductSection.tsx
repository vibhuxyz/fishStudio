"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/siteConfig";

interface ProductSectionProps {
  title: string;
  label: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductSection = ({
  title,
  label,
  products,
  onAddToCart,
}: ProductSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-10">
          <span className="section-label">{label}</span>
          <h2 className="section-title mt-2">{title}</h2>
        </div>

        <div className="relative">
          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next products"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slider */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                >
                  <ProductCard product={product} onAddToCart={onAddToCart} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
