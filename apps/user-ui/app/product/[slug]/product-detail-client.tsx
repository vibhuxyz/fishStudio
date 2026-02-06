"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Star,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { useModals } from "@/components/providers/modal-provider";
import { addToCart } from "@/lib/cart-store";
import { siteConfig } from "@/lib/data";
import type { Product, ProcessingWeightLoss } from "@/lib/types";

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const modals = useModals();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCutting, setSelectedCutting] = useState(
    siteConfig.cuttingTypes[0].id,
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState(
    siteConfig.pieceSizes[2].id,
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(0.25);

  const cuttingType = siteConfig.cuttingTypes.find(
    (c) => c.id === selectedCutting,
  );
  const pieceSize = siteConfig.pieceSizes.find(
    (p) => p.id === selectedPieceSize,
  );

  const availableSizes = useMemo(() => {
    return siteConfig.sizes[product.subCategory] || siteConfig.sizes.default;
  }, [product]);

  const weightLossInfo = useMemo(() => {
    const wl = siteConfig.processingWeightLoss[selectedCutting];
    if (typeof wl === "number") return null;
    return wl as ProcessingWeightLoss;
  }, [selectedCutting]);

  const totalPayable = useMemo(() => {
    return Number.parseFloat((product.price * quantity).toFixed(2));
  }, [product, quantity]);

  const productImages = [product.image, product.image];

  const handleAddToCart = () => {
    if (!cuttingType || !pieceSize) return;
    addToCart(
      product,
      quantity,
      cuttingType,
      pieceSize,
      selectedSize || availableSizes[0],
    );
    modals.openCart();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${encodeURIComponent(product.category.toLowerCase().replace(/[\s&]+/g, "-"))}`}
              className="transition-colors hover:text-foreground"
            >
              {product.category}
            </Link>
            <span>/</span>
            <Link
              href={`/category/${encodeURIComponent(product.category.toLowerCase().replace(/[\s&]+/g, "-"))}?sub=${encodeURIComponent(product.subCategory)}`}
              className="transition-colors hover:text-foreground"
            >
              {product.subCategory}
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{product.name}</span>
          </nav>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
              {/* Left - Images */}
              <div className="flex-shrink-0">
                <div className="relative h-72 w-full overflow-hidden rounded-xl md:h-80 md:w-96">
                  <Image
                    src={productImages[currentImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    loading="eager"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA}
                  />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === currentImageIndex
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA}
                      />
                    </button>
                  ))}
                  <div className="ml-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        setCurrentImageIndex(
                          (currentImageIndex - 1 + productImages.length) %
                            productImages.length,
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous image</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        setCurrentImageIndex(
                          (currentImageIndex + 1) % productImages.length,
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next image</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right - Details */}
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {product.subCategory}
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold text-primary md:text-3xl">
                  {product.name}
                </h1>
                <p className="mt-2 text-base text-muted-foreground">
                  {product.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Product Code: {product.id}</span>
                  {weightLossInfo && (
                    <span>
                      Weight Loss: {weightLossInfo.min}% -{" "}
                      {weightLossInfo.max}% kg
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>

                <p className="mt-4 text-xl font-bold text-primary">
                  Price: Rs. {product.price} per Kg
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Cutting Type
                    </label>
                    <Select
                      value={selectedCutting}
                      onValueChange={setSelectedCutting}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {siteConfig.cuttingTypes.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>
                            {ct.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Piece Size
                    </label>
                    <Select
                      value={selectedPieceSize}
                      onValueChange={setSelectedPieceSize}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {siteConfig.pieceSizes.map((ps) => (
                          <SelectItem key={ps.id} value={ps.id}>
                            {ps.name} ({ps.range})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">
                    Fish Size
                  </label>
                  <Select
                    value={selectedSize || availableSizes[0]}
                    onValueChange={setSelectedSize}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {weightLossInfo && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Processing weight loss ({weightLossInfo.min}% -{" "}
                      {weightLossInfo.max}%) basis cut type.{" "}
                      {weightLossInfo.description}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-transparent"
                      onClick={() =>
                        setQuantity(Math.max(0.25, quantity - 0.25))
                      }
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="min-w-[3rem] text-center text-lg font-bold text-foreground">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-transparent"
                      onClick={() => setQuantity(quantity + 0.25)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Total Payable
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      Rs. {totalPayable.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleAddToCart}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-10 px-0 py-10">
              <div className="mb-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  More from {product.subCategory} & {product.category}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
                  You May Also Like
                </h2>
              </div>
              <ProductCarousel
                products={relatedProducts}
                variant="compact"
              />
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
