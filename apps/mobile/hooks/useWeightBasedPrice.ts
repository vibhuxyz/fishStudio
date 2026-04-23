/**
 * useWeightBasedPrice — mirror of apps/user-ui/hooks/useWeightBasedPrice.ts
 *
 * Dynamic price calculation based on selected weight, cutting type, and piece size.
 * Adapted for mobile's raw backend product shape (snake_case: sale_price / regular_price).
 */

import { useCallback, useMemo, useState } from "react";
import {
  calculatePrice,
  parseWeightRange,
  type CalculatedPrice,
  type CuttingTypePricing,
  type PieceSizePricing,
  type WeightOption,
} from "@/utils/pricing";

interface MobileProduct {
  sizes?: string[];
  weight?: string;
  cuttingTypes?: string[];
  pieceSizes?: string[];
  basePricePerKg?: number;
  sale_price?: number | null;
  regular_price?: number | null;
  cuttingTypePricing?: CuttingTypePricing[] | null;
  pieceSizePricing?: PieceSizePricing[] | null;
}

interface UseWeightBasedPriceReturn {
  selectedWeight: string;
  selectedCuttingType: string;
  selectedPieceSize: string;

  setSelectedWeight: (weight: string) => void;
  setSelectedCuttingType: (cuttingType: string) => void;
  setSelectedPieceSize: (pieceSize: string) => void;

  price: CalculatedPrice;

  weightOptions: WeightOption[];
  cuttingTypeOptions: string[];
  pieceSizeOptions: string[];

  calculatePrice: (weight: string, cuttingType?: string, pieceSize?: string) => CalculatedPrice;
  parseWeightRange: (weightStr: string) => WeightOption;

  hasWeightPricing: boolean;
  basePricePerKg: number;
}

export const useWeightBasedPrice = (
  product: MobileProduct | null | undefined,
): UseWeightBasedPriceReturn => {
  const [selectedWeight, setSelectedWeight] = useState<string>(
    product?.sizes?.[0] || product?.weight || "",
  );
  const [selectedCuttingType, setSelectedCuttingType] = useState<string>(
    product?.cuttingTypes?.[0] || "",
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>(
    product?.pieceSizes?.[0] || "",
  );

  const weightOptions = useMemo(
    () => (product?.sizes || []).map((size) => parseWeightRange(size)),
    [product?.sizes],
  );

  const hasWeightPricing = !!(product?.basePricePerKg && product?.sizes?.length);
  const basePricePerKg = product?.basePricePerKg || 0;

  const price = useMemo<CalculatedPrice>(() => {
    const salePrice = product?.sale_price ?? 0;
    const regularPrice = product?.regular_price ?? salePrice;

    if (!hasWeightPricing || !selectedWeight) {
      const savings = regularPrice - salePrice;
      return {
        salePrice,
        regularPrice,
        pricePerKg: 0,
        savings: savings > 0 ? savings : 0,
        discountPercent:
          regularPrice > 0 && savings > 0
            ? Math.round((savings / regularPrice) * 100)
            : 0,
        breakdown: "Static pricing",
      };
    }

    return calculatePrice(
      basePricePerKg,
      selectedWeight,
      selectedCuttingType,
      selectedPieceSize,
      product?.cuttingTypePricing || [],
      product?.pieceSizePricing || [],
    );
  }, [
    hasWeightPricing,
    basePricePerKg,
    selectedWeight,
    selectedCuttingType,
    selectedPieceSize,
    product,
  ]);

  const calculatePriceFn = useCallback(
    (weight: string, cuttingType?: string, pieceSize?: string): CalculatedPrice =>
      calculatePrice(
        basePricePerKg,
        weight,
        cuttingType ?? selectedCuttingType,
        pieceSize ?? selectedPieceSize,
        product?.cuttingTypePricing || [],
        product?.pieceSizePricing || [],
      ),
    [basePricePerKg, selectedCuttingType, selectedPieceSize, product],
  );

  return {
    selectedWeight,
    selectedCuttingType,
    selectedPieceSize,
    setSelectedWeight,
    setSelectedCuttingType,
    setSelectedPieceSize,
    price,
    weightOptions,
    cuttingTypeOptions: product?.cuttingTypes || [],
    pieceSizeOptions: product?.pieceSizes || [],
    calculatePrice: calculatePriceFn,
    parseWeightRange,
    hasWeightPricing,
    basePricePerKg,
  };
};
