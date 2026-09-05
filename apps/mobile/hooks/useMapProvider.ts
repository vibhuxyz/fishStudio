import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { setMapProvider, activeMapProvider } from "@/lib/geocoding-provider";

/**
 * Applies the admin's map-backend choice to this session.
 *
 * The setting rides the categories payload, which several screens already
 * fetch — sharing the query key means this costs nothing beyond the effect.
 *
 * Returns the backend actually in force, which is not always what the admin
 * picked: Google is only honoured when a key is present in this build.
 */
export function useMapProvider(): "osm" | "google" {
  const { data } = useQuery({
    queryKey: ["site-config", "map-provider"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories?activeOnly=true");
      return (res.data?.mapProvider ?? null) as string | null;
    },
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    setMapProvider(data);
  }, [data]);

  return activeMapProvider();
}
