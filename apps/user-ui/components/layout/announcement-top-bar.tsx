"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useAddressStore } from "@/lib/address-store";
import { useAnnouncement } from "@/components/providers/announcement-provider";
import type { AnnouncementBanner } from "@/lib/storefront";
import { frontendEnv } from "@/lib/env";
import { BAR_HEIGHT } from "@/utils/constants";

/** Fetches announcement banners from the API, filtered by city if known */
async function loadAnnouncementBanners(city?: string, storeId?: string): Promise<AnnouncementBanner[]> {
  const query = new URLSearchParams();
  if (city) query.set("city", city);
  if (storeId) query.set("storeId", storeId);
  const qs = query.toString();
  const res = await fetch(
    `${frontendEnv.apiUrl}/product/api/get-announcement-banners${qs ? `?${qs}` : ""}`,
    { next: { revalidate: 120 } } as RequestInit,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.banners) ? data.banners.filter((b: AnnouncementBanner) => b.isActive) : [];
}

export function AnnouncementTopBar() {
  const { visible, dismiss, setHasContent } = useAnnouncement();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddressId = useAddressStore((s) => s.selectedAddressId);
  const addresses = useAddressStore((s) => s.addresses);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const city = selectedLocation?.city || selectedAddress?.city;
  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;

  // No location at all → no banners (they are seller-specific)
  const hasLocation = !!(city || storeId || pincode);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const { data: banners = [] } = useQuery<AnnouncementBanner[]>({
    queryKey: ["announcement-banners", city, storeId, pincode],
    queryFn: () => loadAnnouncementBanners(city, storeId),
    staleTime: 2 * 60 * 1000,
    enabled: hydrated && hasLocation,
  });

  // Signal to provider whether we have content
  useEffect(() => {
    if (hydrated) {
      setHasContent(banners.length > 0);
    }
  }, [banners.length, hydrated, setHasContent]);

  // Cycle through banners every 5 seconds when there are multiple
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(
      () => setCurrentIndex((i) => (i + 1) % banners.length),
      5000,
    );
    return () => clearInterval(id);
  }, [banners.length]);

  if (!visible || !hydrated || banners.length === 0 || !isHomePage) return null;

  const banner = banners[currentIndex];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] flex items-center bg-black text-white"
      style={{ height: BAR_HEIGHT }}
    >
      <div className="flex flex-1 items-center justify-center gap-2 px-10 overflow-hidden">
        {banner.imageUrl && (
          <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded">
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-baseline gap-1.5 overflow-hidden">
          <span className="font-extrabold text-yellow-400 text-xs sm:text-sm uppercase tracking-wide whitespace-nowrap">
            {banner.title}
          </span>
          {banner.subtitle && (
            <span className="text-gray-300 text-[10px] sm:text-xs whitespace-nowrap">
              {banner.subtitle}
            </span>
          )}
          {banner.price && (
            <>
              <span className="text-white font-extrabold text-xs sm:text-sm whitespace-nowrap">
                ₹{banner.price}
              </span>
            </>
          )}
        </div>

        <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
      </div>

      {/* Dot indicators (when multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex gap-1">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-0.5 rounded-full transition-all ${
                i === currentIndex ? "w-4 bg-yellow-400" : "w-1.5 bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}

    </div>
  );
}


