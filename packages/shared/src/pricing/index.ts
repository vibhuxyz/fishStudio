// Weight/size pricing shared by mobile and user-ui — both apps sell the same
// products through the same backend, so the pricing math has to be identical.
// Field-name shapes differ per app (mobile keeps the raw snake_case backend
// shape; user-ui transforms to camelCase), so these take plain primitives
// rather than a "product" object — each app adapts its own shape at the call
// site instead of this package guessing at either one.

export interface ProductSizePricing {
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
}

export interface ProductCuttingTypePricing {
  cuttingType: string;
  salePrice: number;
  regularPrice: number;
}

export interface ProductPieceSizePricing {
  pieceSize: string;
  salePrice: number;
  regularPrice: number;
}

export interface PerKgPricing {
  cuttingCharge: number;
  sizeMultiplier: number;
  ratePerKg: number;
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
 */
export const resolveSizePricing = (
  sizePricing: ProductSizePricing[] | null | undefined,
  sizes: string[],
  fallbackSalePrice: number,
  fallbackRegularPrice: number,
  selectedSize?: string,
): { normalizedPricing: ProductSizePricing[]; selected: ProductSizePricing } => {
  const normalizedPricing = normalizeSizePricing(
    sizePricing,
    sizes,
    fallbackSalePrice,
    fallbackRegularPrice,
  );
  const targetSize = selectedSize || normalizedPricing[0]?.size || sizes[0] || "";
  const selected =
    normalizedPricing.find((entry) => entry.size === targetSize) ||
    normalizedPricing[0] || {
      size: targetSize,
      weightGrams: parseWeightToGrams(targetSize),
      salePrice: fallbackSalePrice,
      regularPrice: fallbackRegularPrice,
    };

  return { normalizedPricing, selected };
};

/**
 * Resolve the displayed price for a selected size, with sensible fallbacks.
 */
export const resolvePriceFromSizePricing = (
  sizePricing: ProductSizePricing[] | null | undefined,
  fallbackSalePrice: number,
  fallbackRegularPrice: number,
  selectedSize?: string,
): { salePrice: number; regularPrice: number; unit: string } => {
  const fallback = {
    salePrice: fallbackSalePrice,
    regularPrice: fallbackRegularPrice,
    unit: selectedSize || "unit",
  };

  if (selectedSize && Array.isArray(sizePricing) && sizePricing.length > 0) {
    const entry = sizePricing.find((e) => e.size === selectedSize);
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
 * Per-kg rate derivation for products sold by weight with cutting-type and
 * piece-size add-ons: cuttingCharge shifts the per-kg rate, sizeMultiplier
 * scales the final weighed price. Multiplier is clamped to 0.5–3.0 — treat
 * anything outside that range as stale/bad pricing data.
 */
export const resolvePerKgPricing = (
  basePricePerKg: number,
  cuttingTypePricing: Array<{ cuttingType: string; salePrice: number }> | null | undefined,
  pieceSizePricing: Array<{ pieceSize: string; salePrice: number }> | null | undefined,
  selectedCutting?: string,
  selectedPieceSize?: string,
): PerKgPricing => {
  const cuttingCharge =
    cuttingTypePricing?.find((c) => c.cuttingType === selectedCutting)?.salePrice ?? 0;
  const rawMultiplier =
    pieceSizePricing?.find((p) => p.pieceSize === selectedPieceSize)?.salePrice ?? 1.0;
  const sizeMultiplier = rawMultiplier > 0 && rawMultiplier <= 3 ? rawMultiplier : 1.0;
  const ratePerKg = basePricePerKg + cuttingCharge;
  return { cuttingCharge, sizeMultiplier, ratePerKg };
};

/** Weighed sale price for a given per-kg pricing + selected weight in grams. */
export const computePerKgSalePrice = (pricing: PerKgPricing, weightGrams: number): number =>
  parseFloat(((pricing.ratePerKg / 1000) * weightGrams * pricing.sizeMultiplier).toFixed(2));

export * from "./cart-summary.js";
export * from "./coupons.js";
export * from "./combo-pricing.js";
