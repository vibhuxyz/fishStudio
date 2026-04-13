/**
 * useWeightBasedPrice Hook
 * 
 * This hook provides dynamic price calculation based on selected weight,
 * cutting type, and piece size for products with weight-based pricing.
 * 
 * Usage:
 *   const { price, selectedWeight, setSelectedWeight, calculatePrice } = useWeightBasedPrice(product);
 */

import { useState, useMemo, useCallback } from 'react';
import type { Product } from '@repo/zod-schema';

interface WeightOption {
  label: string;
  min: number;
  max: number;
  avg: number;
  unit: 'grams' | 'pieces_per_kg';
}

interface CalculatedPrice {
  salePrice: number;
  regularPrice: number;
  pricePerKg: number;
  savings: number;
  discountPercent: number;
  breakdown: string;
}

interface UseWeightBasedPriceReturn {
  // Selected options
  selectedWeight: string;
  selectedCuttingType: string;
  selectedPieceSize: string;
  
  // Setters
  setSelectedWeight: (weight: string) => void;
  setSelectedCuttingType: (cuttingType: string) => void;
  setSelectedPieceSize: (pieceSize: string) => void;
  
  // Calculated price
  price: CalculatedPrice;
  
  // Available options
  weightOptions: WeightOption[];
  cuttingTypeOptions: string[];
  pieceSizeOptions: string[];
  
  // Utility functions
  calculatePrice: (weight: string, cuttingType?: string, pieceSize?: string) => CalculatedPrice;
  parseWeightRange: (weightStr: string) => WeightOption;
  
  // State
  hasWeightPricing: boolean;
  basePricePerKg: number;
}

/**
 * Parse weight string to structured data
 */
const parseWeightRange = (weightStr: string): WeightOption => {
  const normalized = weightStr.toLowerCase().trim();

  // Piece-based: "6-10 PCS/KG" or "30-50 Count/KG"
  const pieceMatch = normalized.match(/(\d+)\s*[-–]\s*(\d+)\s*(pcs|count)/);
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
      label: weightStr
    };
  }

  // Range with unit: "1-2 kg" or "500-700 gm"
  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
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
 * Calculate price based on weight, cutting type, and piece size
 */
const calculatePrice = (
  basePricePerKg: number,
  weight: string,
  cuttingType: string,
  pieceSize: string,
  cuttingTypePricing: Array<{ cuttingType: string; salePrice: number; regularPrice: number }>,
  pieceSizePricing: Array<{ pieceSize: string; salePrice: number; regularPrice: number }>
): CalculatedPrice => {
  const weightRange = parseWeightRange(weight);
  
  // Base price for this weight
  const weightInKg = weightRange.avg / 1000;
  let basePrice = basePricePerKg * weightInKg;
  
  // Add cut type premium
  let cutPremium = 0;
  if (cuttingType) {
    const cutEntry = cuttingTypePricing?.find(
      c => c.cuttingType.toLowerCase() === cuttingType.toLowerCase()
    );
    cutPremium = cutEntry?.salePrice || 0;
  }
  
  // Add piece size premium
  let sizePremium = 0;
  if (pieceSize) {
    const sizeEntry = pieceSizePricing?.find(
      s => s.pieceSize.toLowerCase() === pieceSize.toLowerCase()
    );
    sizePremium = sizeEntry?.salePrice || 0;
  }
  
  // Calculate final price
  let salePrice = basePrice + cutPremium + sizePremium;
  
  // Regular price (MSRP) - typically 10-20% higher
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
    breakdown: `Base: ₹${basePrice.toFixed(0)} + Cut: ₹${cutPremium} + Size: ₹${sizePremium}`
  };
};

/**
 * Main hook for weight-based pricing
 */
export const useWeightBasedPrice = (product: Product): UseWeightBasedPriceReturn => {
  // Initialize with first available options
  const [selectedWeight, setSelectedWeight] = useState<string>(
    product.sizes?.[0] || product.weight || ''
  );
  const [selectedCuttingType, setSelectedCuttingType] = useState<string>(
    product.cuttingTypes?.[0] || ''
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>(
    product.pieceSizes?.[0] || ''
  );
  
  // Parse weight options
  const weightOptions = useMemo(() => {
    return (product.sizes || []).map(size => parseWeightRange(size));
  }, [product.sizes]);
  
  // Check if product has weight-based pricing
  const hasWeightPricing = !!(product.basePricePerKg && product.sizes?.length);
  const basePricePerKg = product.basePricePerKg || 0;
  
  // Calculate price
  const price = useMemo<CalculatedPrice>(() => {
    if (!hasWeightPricing || !selectedWeight) {
      // Fallback to static pricing
      return {
        salePrice: product.price,
        regularPrice: product.originalPrice || product.price,
        pricePerKg: 0,
        savings: (product.originalPrice || product.price) - product.price,
        discountPercent: product.originalPrice 
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0,
        breakdown: 'Static pricing'
      };
    }
    
    return calculatePrice(
      basePricePerKg,
      selectedWeight,
      selectedCuttingType,
      selectedPieceSize,
      product.cuttingTypePricing || [],
      product.pieceSizePricing || []
    );
  }, [
    hasWeightPricing,
    basePricePerKg,
    selectedWeight,
    selectedCuttingType,
    selectedPieceSize,
    product
  ]);
  
  // Manual calculate function for ad-hoc calculations
  const calculatePriceFn = useCallback((
    weight: string,
    cuttingType?: string,
    pieceSize?: string
  ): CalculatedPrice => {
    return calculatePrice(
      basePricePerKg,
      weight,
      cuttingType || selectedCuttingType,
      pieceSize || selectedPieceSize,
      product.cuttingTypePricing || [],
      product.pieceSizePricing || []
    );
  }, [basePricePerKg, selectedCuttingType, selectedPieceSize, product]);
  
  return {
    selectedWeight,
    selectedCuttingType,
    selectedPieceSize,
    setSelectedWeight,
    setSelectedCuttingType,
    setSelectedPieceSize,
    price,
    weightOptions,
    cuttingTypeOptions: product.cuttingTypes || [],
    pieceSizeOptions: product.pieceSizes || [],
    calculatePrice: calculatePriceFn,
    parseWeightRange,
    hasWeightPricing,
    basePricePerKg
  };
};

/**
 * Format weight for display
 */
export const formatWeight = (weightStr: string): string => {
  const parsed = parseWeightRange(weightStr);
  
  if (parsed.unit === 'pieces_per_kg') {
    return `${parsed.label} (${parsed.avg}g per piece)`;
  }
  
  if (parsed.min === parsed.max) {
    return parsed.avg >= 1000 
      ? `${(parsed.avg / 1000).toFixed(1)} kg`
      : `${parsed.avg}g`;
  }
  
  return parsed.label;
};

/**
 * Get weight label with price
 */
export const formatWeightWithPrice = (
  weightStr: string,
  basePricePerKg: number
): string => {
  const parsed = parseWeightRange(weightStr);
  const weightInKg = parsed.avg / 1000;
  const price = Math.round(basePricePerKg * weightInKg);
  
  return `${weightStr} - ₹${price}`;
};
