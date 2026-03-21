import type { BackendProduct } from "@repo/types";
import { transformProduct } from "@/lib/storefront";

export const backendProductToProduct = transformProduct;

export function backendProductsToProducts(backendProducts: BackendProduct[]) {
  return backendProducts.map(transformProduct);
}
