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
  BadgePercent,
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
import type { Product } from "@repo/zod-schema";
import {
  fetchStorefrontProductBySlug,
  resolveProductSizePricing,
} from "@/lib/storefront";
import { useAddressStore } from "@/lib/address-store";
import { toast } from "sonner";

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

interface Props {
  product: Product;
  relatedProducts: Product[];
  coupon?: any;
}

export function ProductDetailClient({ product, relatedProducts, coupon }: Props) {
  const modals = useModals();
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const [resolvedProduct, setResolvedProduct] = useState(product);
  const [resolvedRelatedProducts, setResolvedRelatedProducts] = useState(relatedProducts);
  const [resolvedCoupon, setResolvedCoupon] = useState(coupon);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize state with the first available option from the backend data
  const [selectedCutting, setSelectedCutting] = useState(
    resolvedProduct.cuttingTypes?.[0] || "",
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState(
    resolvedProduct.pieceSizes?.[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState(
    resolvedProduct.weight || resolvedProduct.sizes?.[0] || "",
  );

  const { normalizedPricing, selected } = useMemo(
    () => resolveProductSizePricing(resolvedProduct, selectedSize),
    [resolvedProduct, selectedSize],
  );
  const [selectedWeightGrams, setSelectedWeightGrams] = useState(
    selected.weightGrams || 50,
  );

  // Create a gallery. If backend only sends one image, we use that.
  // Duplicating it just to keep the carousel UI functional if it expects >1.
  const productImages =
    resolvedProduct.images && resolvedProduct.images.length > 0
      ? resolvedProduct.images
      : [resolvedProduct.image || "/placeholder.svg"];

  useEffect(() => {
    setResolvedProduct(product);
    setResolvedRelatedProducts(relatedProducts);
    setResolvedCoupon(coupon);
  }, [product, relatedProducts, coupon]);

  useEffect(() => {
    if (!selectedLocation?.storeId && !selectedLocation?.pincode && !selectedLocation?.city) {
      return;
    }

    let cancelled = false;

    fetchStorefrontProductBySlug(product.slug, {
      storeId: selectedLocation?.storeId,
      pincode: selectedLocation?.pincode,
      city: selectedLocation?.city,
    })
      .then((data) => {
        if (cancelled || !data.product) return;
        setResolvedProduct(data.product);
        setResolvedRelatedProducts(data.relatedProducts);
        setResolvedCoupon(data.coupon || null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    product.slug,
    selectedLocation?.storeId,
    selectedLocation?.pincode,
    selectedLocation?.city,
  ]);

  // Auto-rotate product images
  useEffect(() => {
    if (productImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [productImages.length]);

  useEffect(() => {
    setSelectedWeightGrams(selected.weightGrams || 50);
  }, [selected.size, selected.weightGrams]);

  useEffect(() => {
    setSelectedCutting(resolvedProduct.cuttingTypes?.[0] || "");
    setSelectedPieceSize(resolvedProduct.pieceSizes?.[0] || "");
    setSelectedSize(resolvedProduct.weight || resolvedProduct.sizes?.[0] || "");
  }, [resolvedProduct]);

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


  const handleAddToCart = (shouldOpenCart = false) => {
    const customizedProduct = {
      ...product,
      ...resolvedProduct,
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
      selectedCutting || "default",
      selectedPieceSize || "default",
      `${selected.size} | ${selectedWeightGrams} gm`,
    );
    if (shouldOpenCart) {
      modals.openCart();
    } else {
      toast.success(`${resolvedProduct.name} added to cart`);
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
                resolvedProduct.category.toLowerCase().replace(/[\s&]+/g, "-"),
              )}`}
              className="transition-colors hover:text-foreground"
            >
              {resolvedProduct.category}
            </Link>
            <span>/</span>
            <Link
              href={`/category/${encodeURIComponent(
                resolvedProduct.category.toLowerCase().replace(/[\s&]+/g, "-"),
              )}?sub=${encodeURIComponent(resolvedProduct.subCategory)}`}
              className="transition-colors hover:text-foreground"
            >
              {resolvedProduct.subCategory}
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{resolvedProduct.name}</span>
          </nav>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
              {/* Left - Images */}
              <div className="flex-shrink-0">
                <div className="relative h-72 w-full overflow-hidden rounded-xl md:h-80 md:w-96">
                  <Image
                    src={productImages[currentImageIndex]}
                    alt={resolvedProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                        alt={`${resolvedProduct.name} thumbnail ${i + 1}`}
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
                  {resolvedProduct.subCategory}
                </p>
                <h1 className="mt-1 font-serif text-2xl font-bold text-primary md:text-3xl">
                  {resolvedProduct.name}
                </h1>
                <div className="mt-2 text-sm text-muted-foreground md:text-base">
                  <div
                    className={`relative ${!isExpanded ? "line-clamp-3" : ""}`}
                    dangerouslySetInnerHTML={{ __html: resolvedProduct.description }}
                  />
                  {resolvedProduct.description.length > 180 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  {/* Displaying shortened ID */}
                  <span>
                    Product Code: {resolvedProduct.id.slice(-6).toUpperCase()}
                  </span>
                  {resolvedProduct.processingWeightLoss && (
                    <span>Weight Loss: {resolvedProduct.processingWeightLoss}</span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(resolvedProduct.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    ({resolvedProduct.rating} rating)
                  </span>
                </div>

                {/* Coupon Banner */}
                {resolvedCoupon && (
                  <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-green-100 bg-[#E8F5E9] p-4 shadow-sm md:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <BadgePercent className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-green-950 md:text-lg">
                          {resolvedCoupon.public_name}
                        </p>
                        <p className="text-xs font-medium text-green-700/80">
                          {resolvedCoupon.isFirstOrder ? "*For First Order" : "*Limited Time Offer"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-[#1B5E20] px-4 py-2 text-sm font-bold text-white shadow-md md:px-6 md:py-2.5 md:text-base">
                      Code : {resolvedCoupon.discountCode}
                    </div>
                  </div>
                )}

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
                  {resolvedProduct.cuttingTypes && resolvedProduct.cuttingTypes.length > 0 && (
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
                          {resolvedProduct.cuttingTypes.map((ct) => (
                            <SelectItem key={ct} value={ct}>
                              {ct}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Piece Size Dropdown */}
                  {resolvedProduct.pieceSizes && resolvedProduct.pieceSizes.length > 0 && (
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
                          {resolvedProduct.pieceSizes.map((ps) => (
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
                {resolvedProduct.sizes && resolvedProduct.sizes.length > 0 && (
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
                {resolvedProduct.processingWeightLoss && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Processing weight loss:{" "}
                      <span className="font-medium">
                        {resolvedProduct.processingWeightLoss}
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
          {resolvedRelatedProducts.length > 0 && (
            <section className="mt-10 px-0 py-10">
              <div className="mb-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  More from {resolvedProduct.subCategory} & {resolvedProduct.category}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
                  You May Also Like
                </h2>
              </div>
              <ProductCarousel products={resolvedRelatedProducts} variant="compact" />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
