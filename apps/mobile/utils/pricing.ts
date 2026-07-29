/**
 * Weight-based pricing — thin adapter over @repo/pricing for mobile's raw
 * backend product shape (snake_case: sale_price/regular_price). The actual
 * math lives in @repo/pricing since user-ui needs the identical formula.
 */

import {
  computePerKgSalePrice,
  normalizeSizePricing,
  parseWeightToGrams,
  resolvePerKgPricing,
  resolvePriceFromSizePricing,
  resolveSizePricing,
  type ProductSizePricing,
} from "@repo/pricing";

export {
  computePerKgSalePrice,
  normalizeSizePricing,
  parseWeightToGrams,
  resolvePerKgPricing,
  type ProductSizePricing,
};
export type { PerKgPricing } from "@repo/pricing";

/**
 * Resolve the sizePricing entry for a selected size, with fallbacks.
 * Accepts mobile's raw product shape (snake_case sale_price / regular_price).
 */
export const resolveProductSizePricing = (
  product: {
    sizes?: string[];
    sizePricing?: ProductSizePricing[] | null;
    sale_price?: number | null;
    regular_price?: number | null;
  },
  size?: string,
) => {
  const sizes = product.sizes ?? [];
  const fallbackSale = product.sale_price ?? product.regular_price ?? 0;
  const fallbackRegular = product.regular_price ?? product.sale_price ?? 0;
  return resolveSizePricing(product.sizePricing, sizes, fallbackSale, fallbackRegular, size);
};

/**
 * Resolve the displayed price for a selected size, with sensible fallbacks.
 */
export const resolvePrice = (
  product: {
    sizes?: string[];
    sizePricing?: ProductSizePricing[] | null;
    sale_price?: number | null;
    regular_price?: number | null;
  },
  selectedSize?: string,
): { salePrice: number; regularPrice: number; unit: string } => {
  const fallbackSale = product.sale_price ?? product.regular_price ?? 0;
  const fallbackRegular = product.regular_price ?? product.sale_price ?? 0;
  return resolvePriceFromSizePricing(product.sizePricing, fallbackSale, fallbackRegular, selectedSize);
};
