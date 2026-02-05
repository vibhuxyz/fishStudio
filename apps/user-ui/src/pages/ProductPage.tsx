"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getProductById,
  products,
  cuttingTypes,
  pieceSizes,
  sizes,
  processingWeightLoss,
} from "@/data/siteConfig";
import Header from "@/shared/widgets/Header";
import { Footer } from "@/shared/widgets";

const ProductPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : undefined;

  const product = getProductById(id ?? "") ?? products[0];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cuttingType, setCuttingType] = useState("gadaPeti");
  const [pieceSize, setPieceSize] = useState("small");
  const [quantity, setQuantity] = useState(0.25);

  const availableSizes = sizes[product.subCategory] ?? sizes.default;

  const productImages = [product.image, product.image];

  const getWeightLoss = () => {
    const loss =
      processingWeightLoss[cuttingType] ?? processingWeightLoss.default;

    if (typeof loss === "number") return `${loss}%`;
    return `${loss.min}% - ${loss.max}%`;
  };

  const totalPrice = product.price * quantity;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(0.25, Math.round((prev + delta) * 4) / 4));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/" className="hover:text-primary">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                <Image
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-bold text-sm -rotate-12">
                  BIG SAVE
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-4">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      className="object-cover"
                      width={80}
                      height={80}
                    />
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <button className="w-8 h-8 rounded-full border flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full border flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold text-accent">
                {product.name}
              </h1>

              <p className="text-accent text-2xl font-bold">
                ₹{product.price} {product.unit}
              </p>

              {/* Cutting + Piece Size */}
              <div className="grid md:grid-cols-2 gap-4">
                <Select value={cuttingType} onValueChange={setCuttingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cuttingTypes.map((cut) => (
                      <SelectItem key={cut.id} value={cut.id}>
                        {cut.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={pieceSize} onValueChange={setPieceSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pieceSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name} ({size.range})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-0.25)}
                    className="w-10 h-10 bg-accent text-accent-foreground rounded-full"
                  >
                    <Minus />
                  </button>

                  <span className="text-xl font-bold">
                    {quantity.toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleQuantityChange(0.25)}
                    className="w-10 h-10 bg-accent text-accent-foreground rounded-full"
                  >
                    <Plus />
                  </button>
                </div>

                <p className="text-lg font-semibold">
                  Total: ₹{totalPrice.toFixed(2)}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Processing weight loss ({getWeightLoss()})
              </p>

              <div className="flex gap-4">
                <Button className="flex-1 btn-accent py-6">Add to cart</Button>
                <Button className="flex-1 btn-primary py-6">Buy Now</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
