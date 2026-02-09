import type { BackendProduct } from "@repo/types";
import type { Product } from "@/lib/types"; // or wherever Product type is defined

/**
 * Converts BackendProduct from API to Product format expected by cart/modals
 */
export function backendProductToProduct(
  backendProduct: BackendProduct,
): Product {
  return {
    id: backendProduct.id,
    name: backendProduct.title,
    slug: backendProduct.slug,
    variantName: backendProduct.subCategory || "",
    description:
      backendProduct.short_description ||
      backendProduct.detailed_description ||
      "",
    price: backendProduct.sale_price,
    originalPrice: backendProduct.regular_price,
    image:
      backendProduct.images?.[0]?.url ||
      backendProduct.image ||
      "/placeholder.svg",
    category: backendProduct.category,
    rating: backendProduct.ratings || backendProduct.rating || 5,
    stock: backendProduct.stock,
    // Add any other fields that Product type requires
    sizes: backendProduct.sizes || [],
    // If Product has additional required fields, map them here
  };
}

/**
 * Converts array of BackendProducts to Products
 */
export function backendProductsToProducts(
  backendProducts: BackendProduct[],
): Product[] {
  return backendProducts.map(backendProductToProduct);
}
