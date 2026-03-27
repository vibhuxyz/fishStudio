"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchStorefrontCategoryBanners } from "@/lib/storefront";
import { useAddressStore } from "@/lib/address-store";

export function CategoryBanner({ category }: { category: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );
  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["category-banners", category, storeId, pincode],
    queryFn: () => fetchStorefrontCategoryBanners(category, { storeId, pincode }),
    staleTime: 1000 * 60 * 5,
    enabled: !!category,
  });

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative mb-8 w-full overflow-hidden rounded-2xl border border-border aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/5] bg-secondary/20 shadow-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[currentIndex]?.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full w-full"
        >
          <img
            src={banners[currentIndex]?.imageUrl}
            alt={`${category} Banner`}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {banners.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center px-4">
            <button
              onClick={handlePrev}
              className="rounded-full bg-background/30 p-2.5 text-white backdrop-blur-md transition-all hover:bg-background/60 hover:scale-110 active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-4">
            <button
              onClick={handleNext}
              className="rounded-full bg-background/30 p-2.5 text-white backdrop-blur-md transition-all hover:bg-background/60 hover:scale-110 active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
