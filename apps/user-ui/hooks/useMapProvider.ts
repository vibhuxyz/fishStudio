"use client";

import { useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { setMapProvider, activeMapProvider } from "@/lib/geocoding-provider";

/**
 * Applies the admin's map-backend choice to this session.
 *
 * The setting rides the categories payload, which is already fetched on nearly
 * every page and shares one TanStack cache entry — so calling this from a map
 * component costs nothing beyond the effect itself.
 *
 * Returns the backend actually in force, which is not always what the admin
 * picked: Google is only honoured when a key is configured in this build.
 */
export function useMapProvider(): "osm" | "google" {
  const { data } = useCategories();

  useEffect(() => {
    setMapProvider(data?.mapProvider);
  }, [data?.mapProvider]);

  return activeMapProvider();
}
