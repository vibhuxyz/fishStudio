"use client";

import { useState } from "react";

import { products, getBestsellers, type Product } from "@/data/siteConfig";

import {
  Header,
  Hero,
  ProductCustomizationModal,
  ProductSection,
  Testimonials,
  Footer,
} from "@/shared/widgets";

interface CustomizationOptions {
  size: string;
  cuttingType: string;
  pieceSize: string;
  quantity: number;
}

const HomePage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalAddToCart = (
    product: Product,
    options: CustomizationOptions,
  ) => {
    console.log("Added to cart:", product, options);
  };

  const bestsellers = getBestsellers();

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ HEADER MUST BE FIRST */}
      <Header />

      {/* ✅ HERO COMES AFTER HEADER */}
      <Hero />

      <ProductSection
        title="Live-Cut. Fresh. Packed For You."
        label="OUR PRODUCTS"
        products={products}
        onAddToCart={handleAddToCart}
      />

      <section className="bg-secondary/30">
        <ProductSection
          title="Quick Delivery"
          label="CUSTOMER FAVORITES"
          products={products.slice(0, 4)}
          onAddToCart={handleAddToCart}
        />
      </section>

      <ProductSection
        title="Live-Cut. Fresh. Packed For You."
        label="BESTSELLERS"
        products={bestsellers}
        onAddToCart={handleAddToCart}
      />

      <Testimonials />
      <Footer />

      <ProductCustomizationModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default HomePage;
