"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  categories,
  subCategories,
  getCategoryKey,
  type Category,
  type SubCategory,
  getProductsBySubCategory,
} from "@/data/siteConfig";

interface CategoryNavDropdownProps {
  onProductClick?: (productId: string) => void;
}

const CategoryNavDropdown = ({ onProductClick }: CategoryNavDropdownProps) => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const getSubcategories = (category: Category): readonly SubCategory[] => {
    const key = getCategoryKey(category);
    return subCategories[key];
  };

  const icons: Record<Category, string> = {
    "Fresh Water": "🐟",
    "Sea Fish": "🦈",
    "Premium Sea Food": "🦞",
    "Meat & Poultry": "🍗",
    "Fry Ready": "🍳",
    "Moms Magic": "✨",
    "Rice & Spice": "🌾",
    "Pet Serve": "🐕",
  };

  return (
    <nav
      ref={navRef}
      className="relative w-full border-b border-border bg-background z-[9999]"
      style={{ overflow: "visible" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
          {categories.map((category) => (
            <div
              key={category}
              className="relative z-[9999]"
              onMouseEnter={() => setActiveCategory(category)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              {/* Category Button with Icon and Chevron */}
              <button className="flex items-center gap-2 px-3 py-3 md:px-4 text-sm md:text-base font-medium hover:text-primary group transition-colors">
                <span className="text-lg">{icons[category]}</span>
                <span className="hidden sm:inline">{category}</span>
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              {activeCategory === category && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-80 bg-background border border-border rounded-lg shadow-2xl p-4 z-[9999]"
                  onMouseEnter={() => setActiveCategory(category)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {/* Category Title */}
                  <h3 className="font-semibold text-primary mb-3 pb-2 border-b text-base">
                    {category}
                  </h3>

                  {/* Subcategories Grid - 2 columns on larger screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getSubcategories(category).map((subCategory) => {
                      const products = getProductsBySubCategory(subCategory);
                      const firstProduct =
                        products.length > 0 ? products[0] : null;

                      return (
                        <Link
                          key={subCategory}
                          href={`/product/${subCategory
                            .toLowerCase()
                            .replace(/[/\s]/g, "-")}`}
                          className="px-3 py-2 rounded-md hover:bg-secondary text-sm transition-colors cursor-pointer"
                        >
                          <span className="font-medium text-foreground block">
                            {subCategory}
                          </span>
                          {firstProduct && (
                            <span className="text-xs text-muted-foreground block mt-1">
                              From ₹{firstProduct.price}/{firstProduct.unit}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavDropdown;
