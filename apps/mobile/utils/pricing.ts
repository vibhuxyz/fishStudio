/**
 * Weight-based pricing utilities — mirror of apps/user-ui/lib/storefront.ts
 *
 * Works on the raw backend product shape (snake_case: sale_price/regular_price).
 */

export interface ProductSizePricing {
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
}

export interface CuttingTypePricing {
  cuttingType: string;
  salePrice: number;
  regularPrice: number;
}

export interface PieceSizePricing {
  pieceSize: string;
  salePrice: number;
  regularPrice: number;
}

export interface WeightOption {
  label: string;
  min: number;
  max: number;
  avg: number;
  unit: "grams" | "pieces_per_kg";
}

export interface CalculatedPrice {
  salePrice: number;
  regularPrice: number;
  pricePerKg: number;
  savings: number;
  discountPercent: number;
  breakdown: string;
}

/**
 * Average grams for a weight string ("1-2 kg", "500g", "6-10 PCS/KG").
 */
export const parseWeightToGrams = (value: string): number => {
  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();

  const sameUnitRange = normalized.match(
    /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)/,
  );
  if (sameUnitRange) {
    const min = Number(sameUnitRange[1]);
    const max = Number(sameUnitRange[2]);
    const unit = sameUnitRange[3];
    const avg = (min + max) / 2;
    return unit === "kg" ? Math.round(avg * 1000) : Math.round(avg);
  }

  const repeatedUnitRange = normalized.match(
    /(\d+(?:\.\d+)?)\s*(kg|g|gm)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)/,
  );
  if (repeatedUnitRange) {
    const min = Number(repeatedUnitRange[1]);
    const minUnit = repeatedUnitRange[2];
    const max = Number(repeatedUnitRange[3]);
    const maxUnit = repeatedUnitRange[4];
    if (minUnit === maxUnit) {
      const avg = (min + max) / 2;
      return minUnit === "kg" ? Math.round(avg * 1000) : Math.round(avg);
    }
  }

  const single = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!single) return 0;
  const amount = Number(single[1]);
  return single[2] === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

/**
 * Structured parse of a weight label — supports piece-based too.
 */
export const parseWeightRange = (weightStr: string): WeightOption => {
  const normalized = weightStr.toLowerCase().trim();

  const pieceMatch = normalized.match(/(\d+)\s*[-–]\s*(\d+)\s*(pcs|count)/);
  if (pieceMatch) {
    const minCount = Number(pieceMatch[1]);
    const maxCount = Number(pieceMatch[2]);
    const minGrams = Math.round(1000 / maxCount);
    const maxGrams = Math.round(1000 / minCount);
    const avgGrams = Math.round((minGrams + maxGrams) / 2);
    return { label: weightStr, min: minGrams, max: maxGrams, avg: avgGrams, unit: "pieces_per_kg" };
  }

  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    const unit = rangeMatch[3] || "g";
    const multiplier = unit === "kg" ? 1000 : 1;
    const minGrams = Math.round(min * multiplier);
    const maxGrams = Math.round(max * multiplier);
    return { label: weightStr, min: minGrams, max: maxGrams, avg: Math.round((minGrams + maxGrams) / 2), unit: "grams" };
  }

  const singleMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    const unit = singleMatch[2] || "g";
    const multiplier = unit === "kg" ? 1000 : 1;
    const grams = Math.round(value * multiplier);
    return { label: weightStr, min: grams, max: grams, avg: grams, unit: "grams" };
  }

  return { label: weightStr, min: 0, max: 0, avg: 0, unit: "grams" };
};

/**
 * Ensure sizePricing covers every size in `sizes`, falling back to the product's base prices.
 */
export const normalizeSizePricing = (
  sizePricing: ProductSizePricing[] | null | undefined,
  sizes: string[],
  salePrice: number,
  regularPrice: number,
): ProductSizePricing[] => {
  if (Array.isArray(sizePricing) && sizePricing.length > 0) {
    return sizes.map((size) => {
      const matched = sizePricing.find((entry) => entry.size === size);
      return (
        matched ?? {
          size,
          weightGrams: parseWeightToGrams(size),
          salePrice,
          regularPrice,
        }
      );
    });
  }

  return sizes.map((size) => ({
    size,
    weightGrams: parseWeightToGrams(size),
    salePrice,
    regularPrice,
  }));
};

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

  const normalizedPricing = normalizeSizePricing(
    product.sizePricing,
    sizes,
    fallbackSale,
    fallbackRegular,
  );
  const targetSize = size || normalizedPricing[0]?.size || sizes[0] || "";
  const selected =
    normalizedPricing.find((entry) => entry.size === targetSize) ||
    normalizedPricing[0] || {
      size: targetSize,
      weightGrams: parseWeightToGrams(targetSize),
      salePrice: fallbackSale,
      regularPrice: fallbackRegular,
    };

  return { normalizedPricing, selected };
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
  const fallback = {
    salePrice: fallbackSale,
    regularPrice: fallbackRegular,
    unit: selectedSize || "unit",
  };

  if (
    selectedSize &&
    Array.isArray(product.sizePricing) &&
    product.sizePricing.length > 0
  ) {
    const entry = product.sizePricing.find((e) => e.size === selectedSize);
    if (entry && entry.salePrice > 0) {
      return {
        salePrice: entry.salePrice,
        regularPrice: entry.regularPrice > 0 ? entry.regularPrice : entry.salePrice,
        unit: entry.size,
      };
    }
  }

  return fallback;
};

/**
 * Weight-based auto-calculation:
 *   price = (basePricePerKg × weightKg) + cuttingPremium + pieceSizePremium
 */
export const calculatePrice = (
  basePricePerKg: number,
  weight: string,
  cuttingType: string,
  pieceSize: string,
  cuttingTypePricing: CuttingTypePricing[],
  pieceSizePricing: PieceSizePricing[],
): CalculatedPrice => {
  const weightRange = parseWeightRange(weight);
  const weightInKg = weightRange.avg / 1000;
  const basePrice = basePricePerKg * weightInKg;

  let cutPremium = 0;
  if (cuttingType) {
    const cutEntry = cuttingTypePricing?.find(
      (c) => c.cuttingType.toLowerCase() === cuttingType.toLowerCase(),
    );
    cutPremium = cutEntry?.salePrice || 0;
  }

  let sizePremium = 0;
  if (pieceSize) {
    const sizeEntry = pieceSizePricing?.find(
      (s) => s.pieceSize.toLowerCase() === pieceSize.toLowerCase(),
    );
    sizePremium = sizeEntry?.salePrice || 0;
  }

  let salePrice = basePrice + cutPremium + sizePremium;
  const regularPrice = Math.round(salePrice * 1.15);
  salePrice = Math.round(salePrice);

  const pricePerKg = weightInKg > 0 ? Math.round(salePrice / weightInKg) : 0;
  const savings = regularPrice - salePrice;
  const discountPercent = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0;

  return {
    salePrice,
    regularPrice,
    pricePerKg,
    savings,
    discountPercent,
    breakdown: `Base: ₹${basePrice.toFixed(0)} + Cut: ₹${cutPremium} + Size: ₹${sizePremium}`,
  };
};

export const formatWeight = (weightStr: string): string => {
  const parsed = parseWeightRange(weightStr);
  if (parsed.unit === "pieces_per_kg") return `${parsed.label} (${parsed.avg}g per piece)`;
  if (parsed.min === parsed.max) {
    return parsed.avg >= 1000
      ? `${(parsed.avg / 1000).toFixed(1)} kg`
      : `${parsed.avg}g`;
  }
  return parsed.label;
};
