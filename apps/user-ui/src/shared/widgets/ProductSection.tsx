import { ChevronLeft, ChevronRight } from "lucide-react";
import { StaticImageData } from "next/image";
import ProductCard from "./ProductCard";
import fishImage from "@/assets/product-fish-1.jpg";
import chickenImage from "@/assets/product-chicken-1.jpg";
import meatImage from "@/assets/product-meat-1.jpg";
import prawnsImage from "@/assets/product-prawns.jpg";

interface ProductSectionProps {
  label: string;
  title: string;
  variant?: "simple" | "detailed";
}

interface Product {
  name: string;
  price: number;
  weight: string;
  image: StaticImageData;
  rating: number;
  description: string;
}

const products: Product[] = [
  {
    name: "Bhetki Fish",
    price: 220,
    weight: "400g",
    image: fishImage,
    rating: 4.9,
    description: "Fresh sea bass fillet",
  },
  {
    name: "Chicken Breast",
    price: 220,
    weight: "400g",
    image: chickenImage,
    rating: 4.9,
    description: "Boneless chicken breast",
  },
  {
    name: "Mutton Curry Cut",
    price: 220,
    weight: "400g",
    image: meatImage,
    rating: 4.9,
    description: "Premium lamb pieces",
  },
  {
    name: "Fresh Prawns",
    price: 220,
    weight: "400g",
    image: prawnsImage,
    rating: 4.9,
    description: "Large tiger prawns",
  },
];

const ProductSection = ({
  label,
  title,
  variant = "simple",
}: ProductSectionProps) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="section-label">{label}</span>
          <h2 className="section-title mt-2">{title}</h2>
        </div>
        <div className="relative">
          {/* Carousel Navigation */}
          <button className="carousel-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="carousel-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex">
            <ChevronRight className="h-5 w-5" />
          </button>
          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={index}
                name={product.name}
                price={product.price}
                weight={product.weight}
                image={product.image}
                rating={variant === "detailed" ? product.rating : undefined}
                description={
                  variant === "detailed" ? product.description : undefined
                }
                variant={variant}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
