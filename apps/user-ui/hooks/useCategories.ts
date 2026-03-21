"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontCategories,
  storefrontKeys,
} from "@/lib/storefront";

export const useCategories = () => {
  return useQuery({
    queryKey: storefrontKeys.categories,
    queryFn: fetchStorefrontCategories,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
