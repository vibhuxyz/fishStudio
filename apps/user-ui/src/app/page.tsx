import { CategoryNav, Footer } from "@/shared/widgets";
import Hero from "@/shared/widgets/Hero";
import ProductSection from "@/shared/widgets/ProductSection";
import Testimonials from "@/shared/widgets/Testimonials";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/*<Header />*/}
      <CategoryNav />
      <Hero />
      <ProductSection
        label="OUR PRODUCTS"
        title="Live-Cut. Fresh. Packed For You."
      />
      <ProductSection label="CUSTOMER FAVORITES" title="Quick Delivery" />
      <ProductSection
        label="BESTSELLERS"
        title="Live-Cut. Fresh. Packed For You."
        variant="detailed"
      />
      <Testimonials />
      <Footer />
    </div>
  );
}
