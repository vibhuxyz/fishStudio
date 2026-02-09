"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-categories",
        isProtected,
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
