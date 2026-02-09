import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import type { BackendProduct } from "@repo/types";

interface ProductsResponse {
  success: boolean;
  products: BackendProduct[];
}

const fetchProducts = async (): Promise<BackendProduct[]> => {
  const res = await axiosInstance.get<ProductsResponse>(
    "/product/api/get-all-products",
  );

  // Type-safe filter: only filter if starting_date exists
  const products = res.data.products?.filter((product) => {
    // Check if product has starting_date property and filter it out
    return !("starting_date" in product && product.starting_date);
  });

  return products || [];
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
