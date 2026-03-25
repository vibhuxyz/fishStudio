"use client";

import { useEffect, useMemo, useState } from "react";
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

import { ProductCarousel } from "@/components/shared/product-carousel";
import { useModals } from "@/components/providers/modal-provider";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@repo/types";
import { resolveProductSizePricing } from "@/lib/storefront";
import { toast } from "sonner";

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const modals = useModals();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize state with the first available option from the backend data
  const [selectedCutting, setSelectedCutting] = useState(
    product.cuttingTypes?.[0] || "",
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState(
    product.pieceSizes?.[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState(product.weight || product.sizes?.[0] || "");

  const { normalizedPricing, selected } = useMemo(
    () => resolveProductSizePricing(product, selectedSize),
    [product, selectedSize],
  );
  const [selectedWeightGrams, setSelectedWeightGrams] = useState(
    selected.weightGrams || 50,
  );

  useEffect(() => {
    setSelectedWeightGrams(selected.weightGrams || 50);
  }, [selected.size, selected.weightGrams]);

  const computedSalePrice = useMemo(() => {
    const baseWeight = selected.weightGrams || 1;
    const pricePerGram = selected.salePrice / baseWeight;
    return Number.parseFloat((pricePerGram * selectedWeightGrams).toFixed(2));
  }, [selected.salePrice, selected.weightGrams, selectedWeightGrams]);

  const computedRegularPrice = useMemo(() => {
    const baseWeight = selected.weightGrams || 1;
    const pricePerGram = selected.regularPrice / baseWeight;
    return Number.parseFloat((pricePerGram * selectedWeightGrams).toFixed(2));
  }, [selected.regularPrice, selected.weightGrams, selectedWeightGrams]);

  const totalPayable = computedSalePrice;

  // Create a gallery. If backend only sends one image, we use that.
  // Duplicating it just to keep the carousel UI functional if it expects >1.
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/placeholder.svg"];

  const handleAddToCart = (shouldOpenCart = false) => {
    // Basic validation to ensure options are selected
    if (!selectedCutting || !selectedPieceSize) return;
 
    const customizedProduct = {
      ...product,
      price: computedSalePrice,
      originalPrice:
        computedRegularPrice > computedSalePrice
          ? computedRegularPrice
          : undefined,
      weight: `${selectedWeightGrams} gm`,
    };
 
    addToCart(
      customizedProduct,
      1,
      selectedCutting,
      selectedPieceSize,
      `${selected.size} | ${selectedWeightGrams} gm`,
    );
    if (shouldOpenCart) {
      modals.openCart();
    } else {
      toast.success(`${product.name} added to cart`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${encodeURIComponent(
                product.category.toLowerCase().replace(/[\s&]+/g, "-"),
              )}`}
              className="transition-colors hover:text-foreground"
            >
              {product.category}
            </Link>
            <span>/</span>
            <Link
              href={`/category/${encodeURIComponent(
                product.category.toLowerCase().replace(/[\s&]+/g, "-"),
              )}?sub=${encodeURIComponent(product.subCategory)}`}
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
                    src={productImages[currentImageIndex]}
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
                        src={img}
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

                  {/* Image Navigation Buttons */}
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
                <div
                  className="mt-2 text-base text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  {/* Displaying shortened ID */}
                  <span>
                    Product Code: {product.id.slice(-6).toUpperCase()}
                  </span>
                  {product.processingWeightLoss && (
                    <span>Weight Loss: {product.processingWeightLoss}</span>
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
                    ({product.rating} rating)
                  </span>
                </div>

                <p className="mt-4 text-xl font-bold text-primary">
                  Price: Rs. {computedSalePrice.toFixed(2)}
                  {computedRegularPrice > computedSalePrice ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                      Rs. {computedRegularPrice.toFixed(2)}
                    </span>
                  ) : null}
                  {selectedWeightGrams ? (
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {selectedWeightGrams} gm
                    </span>
                  ) : (
                    ""
                  )}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Cutting Type Dropdown */}
                  {product.cuttingTypes && product.cuttingTypes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Cutting Type
                      </label>
                      <Select
                        value={selectedCutting}
                        onValueChange={setSelectedCutting}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select cutting type" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.cuttingTypes.map((ct) => (
                            <SelectItem key={ct} value={ct}>
                              {ct}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Piece Size Dropdown */}
                  {product.pieceSizes && product.pieceSizes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Piece Size
                      </label>
                      <Select
                        value={selectedPieceSize}
                        onValueChange={setSelectedPieceSize}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select piece size" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.pieceSizes.map((ps) => (
                            <SelectItem key={ps} value={ps}>
                              {ps}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Fish Size Dropdown */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-foreground">
                      Fish / Pack Size
                    </label>
                    <Select
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {normalizedPricing.map((sizePricing) => (
                          <SelectItem key={sizePricing.size} value={sizePricing.size}>
                            {sizePricing.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Weight Loss Info Banner */}
                {product.processingWeightLoss && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Processing weight loss:{" "}
                      <span className="font-medium">
                        {product.processingWeightLoss}
                      </span>
                      . Varies based on cutting type selected.
                    </p>
                  </div>
                )}

                {/* Weight & Cart Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-transparent"
                      onClick={() =>
                        setSelectedWeightGrams(
                          Math.max(50, selectedWeightGrams - 50),
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Decrease weight</span>
                    </Button>
                    <span className="min-w-[3rem] text-center text-lg font-bold text-foreground">
                      {selectedWeightGrams}g
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-transparent"
                      onClick={() => setSelectedWeightGrams(selectedWeightGrams + 50)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase weight</span>
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Payable</p>
                    <p className="text-2xl font-bold text-foreground">
                      Rs. {totalPayable.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleAddToCart(false)}
                  >
                    Add to cart
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleAddToCart(true)}
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
              <ProductCarousel products={relatedProducts} variant="compact" />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
