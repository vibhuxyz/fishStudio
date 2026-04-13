/**
 * Weight-Based Pricing Utilities
 * 
 * This module provides functions to:
 * - Parse weight strings (e.g., "1-2 kg", "500g", "6-10 PCS/KG")
 * - Auto-calculate prices based on weight, cut type, and piece size
 * - Generate size pricing arrays from weight ranges
 */

/**
 * Parses weight string to min/max/avg grams
 * 
 * Examples:
 * - "1-2 kg" → { min: 1000, max: 2000, avg: 1500 }
 * - "500g" → { min: 500, max: 500, avg: 500 }
 * - "6-10 PCS/KG" → { min: 100, max: 166, avg: 133 } (1000/10 to 1000/6)
 */
export const parseWeightRange = (
  weightStr: string
): {
  min: number;
  max: number;
  avg: number;
  unit: 'grams' | 'pieces_per_kg';
  label: string;
} => {
  const normalized = weightStr.toLowerCase().trim();

  // Piece-based: "6-10 PCS/KG" or "30-50 Count/KG"
  const pieceMatch = normalized.match(
    /(\d+)\s*[-–]\s*(\d+)\s*(pcs|count)/
  );
  if (pieceMatch) {
    const minCount = Number(pieceMatch[1]);
    const maxCount = Number(pieceMatch[2]);
    const minGrams = Math.round(1000 / maxCount);
    const maxGrams = Math.round(1000 / minCount);
    const avgGrams = Math.round((minGrams + maxGrams) / 2);
    return {
      min: minGrams,
      max: maxGrams,
      avg: avgGrams,
      unit: 'pieces_per_kg',
      label: `${minCount}-${maxCount} pcs/kg`
    };
  }

  // Range with unit: "1-2 kg" or "500-700 gm"
  const rangeMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)?/
  );
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    const unit = rangeMatch[3] || 'g';
    const multiplier = unit === 'kg' ? 1000 : 1;
    const minGrams = Math.round(min * multiplier);
    const maxGrams = Math.round(max * multiplier);
    const avgGrams = Math.round((minGrams + maxGrams) / 2);
    return {
      min: minGrams,
      max: maxGrams,
      avg: avgGrams,
      unit: 'grams',
      label: weightStr
    };
  }

  // Single value: "1 Kg" or "500g"
  const singleMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    const unit = singleMatch[2] || 'g';
    const multiplier = unit === 'kg' ? 1000 : 1;
    const grams = Math.round(value * multiplier);
    return {
      min: grams,
      max: grams,
      avg: grams,
      unit: 'grams',
      label: weightStr
    };
  }

  // Fallback
  return {
    min: 0,
    max: 0,
    avg: 0,
    unit: 'grams',
    label: weightStr
  };
};

/**
 * Configuration for auto-price calculation
 */
export interface AutoPriceConfig {
  basePricePerKg: number;
  weightRange: { min: number; max: number; avg: number };
  cutType?: string;
  cutPremiums?: Array<{ cuttingType: string; salePrice: number; regularPrice: number }>;
  pieceSize?: string;
  sizePremiums?: Array<{ pieceSize: string; salePrice: number; regularPrice: number }>;
  margin?: number; // Profit margin percentage
}

/**
 * Auto-calculate price based on weight, cut type, and piece size
 * 
 * Formula:
 * Price = (Base Price per kg × Weight in kg) + Cutting Premium + Piece Size Premium
 */
export const calculateAutoPrice = (
  config: AutoPriceConfig
): {
  salePrice: number;
  regularPrice: number;
  pricePerKg: number;
  breakdown: string;
} => {
  const {
    basePricePerKg,
    weightRange,
    cutType,
    cutPremiums = [],
    pieceSize,
    sizePremiums = [],
    margin = 0
  } = config;

  // Base price for this weight
  const weightInKg = weightRange.avg / 1000;
  let basePrice = basePricePerKg * weightInKg;

  // Add cut type premium
  let cutPremium = 0;
  if (cutType) {
    const cutEntry = cutPremiums.find(
      c => c.cuttingType.toLowerCase() === cutType.toLowerCase()
    );
    cutPremium = cutEntry?.salePrice || 0;
  }

  // Add piece size premium
  let sizePremium = 0;
  if (pieceSize) {
    const sizeEntry = sizePremiums.find(
      s => s.pieceSize.toLowerCase() === pieceSize.toLowerCase()
    );
    sizePremium = sizeEntry?.salePrice || 0;
  }

  // Calculate final price
  let salePrice = basePrice + cutPremium + sizePremium;

  // Apply margin if specified
  if (margin > 0) {
    salePrice = salePrice * (1 + margin / 100);
  }

  // Regular price (MSRP) - typically 10-20% higher
  const regularPrice = Math.round(salePrice * 1.15);
  salePrice = Math.round(salePrice);

  const pricePerKg = Math.round(salePrice / weightInKg);

  return {
    salePrice,
    regularPrice,
    pricePerKg,
    breakdown: `Base: ₹${basePrice.toFixed(0)} + Cut: ₹${cutPremium} + Size: ₹${sizePremium}`
  };
};

/**
 * Auto-generate sizePricing array from weight ranges
 * 
 * This function takes a list of weight strings and generates
 * the complete sizePricing array for the product.
 */
export const generateSizePricingFromWeights = (
  weights: string[],
  basePricePerKg: number,
  cutPremiums: Array<{ cuttingType: string; salePrice: number; regularPrice: number }>,
  sizePremiums: Array<{ pieceSize: string; salePrice: number; regularPrice: number }>
): Array<{
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
}> => {
  return weights.map(weight => {
    const weightRange = parseWeightRange(weight);
    const pricing = calculateAutoPrice({
      basePricePerKg,
      weightRange,
      cutPremiums,
      sizePremiums
    });

    return {
      size: weight,
      weightGrams: weightRange.avg,
      salePrice: pricing.salePrice,
      regularPrice: pricing.regularPrice
    };
  });
};

/**
 * Generate cutting type pricing with auto-calculation
 * 
 * Returns an array of cutting type prices based on base price
 */
export const generateCuttingTypePricing = (
  cuttingTypes: string[],
  basePremiums: Array<{ type: string; premium: number }> = []
): Array<{
  cuttingType: string;
  salePrice: number;
  regularPrice: number;
}> => {
  return cuttingTypes.map(cutType => {
    const premiumEntry = basePremiums.find(
      p => p.type.toLowerCase() === cutType.toLowerCase()
    );
    const premium = premiumEntry?.premium || 0;

    return {
      cuttingType: cutType,
      salePrice: Math.round(premium),
      regularPrice: Math.round(premium * 1.15)
    };
  });
};

/**
 * Generate piece size pricing with auto-calculation
 */
export const generatePieceSizePricing = (
  pieceSizes: string[],
  basePremiums: Array<{ size: string; premium: number }> = []
): Array<{
  pieceSize: string;
  salePrice: number;
  regularPrice: number;
}> => {
  return pieceSizes.map(pieceSize => {
    const premiumEntry = basePremiums.find(
      p => p.size.toLowerCase() === pieceSize.toLowerCase()
    );
    const premium = premiumEntry?.premium || 0;

    return {
      pieceSize: pieceSize,
      salePrice: Math.round(premium),
      regularPrice: Math.round(premium * 1.15)
    };
  });
};

/**
 * Validate that a product has proper pricing configuration
 */
export const validateProductPricing = (product: {
  basePricePerKg?: number | null;
  sizePricing?: any;
  sizes?: string[];
}): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!product.basePricePerKg || product.basePricePerKg <= 0) {
    errors.push('Base price per kg must be greater than 0');
  }

  if (!product.sizes || product.sizes.length === 0) {
    errors.push('At least one size/weight must be specified');
  }

  if (!product.sizePricing || product.sizePricing.length === 0) {
    errors.push('Size pricing must be configured');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
