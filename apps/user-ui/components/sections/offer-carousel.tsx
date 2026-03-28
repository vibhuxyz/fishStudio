"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

export function OfferCarousel() {
  const { banners, isLoading: isApiLoading, isError } = useBanners();
  const [current, setCurrent] = useState(0);
  // Track loading state for each image file
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>(
    {},
  );

  const total = banners.length;

  const next = useCallback(() => {
    if (total === 0) return;
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, total]);

  // Handle image load completion
  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  // 1. API Loading Skeleton
  if (isApiLoading) {
    return (
      <section className="w-full px-4 py-4 md:px-6">
        <div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-muted animate-pulse"
          style={{ paddingBottom: "40.33%" }}
        />
      </section>
    );
  }

  if (isError || banners.length === 0) {
    return (
      <section className="w-full px-4 py-4 md:px-6">
        <div
          className="relative mx-auto flex max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 to-accent/20"
          style={{ paddingBottom: "33.33%" }}
        >
          <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold tracking-widest text-muted-foreground/60 uppercase">
            Banner
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 py-4 md:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-muted">
        <div className="relative w-full" style={{ paddingBottom: "33.33%" }}>
          {banners.map((banner, i) => {
            const isImageLoaded = loadedImages[banner.id];
            const isVisible = i === current;

            return (
              <div
                key={banner.id}
                className="absolute inset-0 transition-opacity duration-500 ease-in-out"
                style={{
                  opacity: isVisible ? 1 : 0,
                  zIndex: isVisible ? 1 : 0,
                }}
              >
                {/* 2. Image Skeleton (visible only for the current slide if not loaded) */}
                {!isImageLoaded && isVisible && (
                  <div className="absolute inset-0 z-20 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
                )}

                <Image
                  src={banner.imageUrl}
                  alt={`Offer Banner ${i + 1}`}
                  fill
                  className={`object-cover transition-transform duration-700 ${
                    isImageLoaded ? "scale-100" : "scale-105"
                  }`}
                  priority={i === 0}
                  onLoad={() => handleImageLoad(banner.id)}
                  sizes="(max-width: 768px) 100vw, 1280px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA}
                />
              </div>
            );
          })}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-background" : "w-2 bg-background/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
