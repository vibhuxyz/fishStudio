export interface Product {
  id: string;
  name: string;
  /** The specific variant name e.g. "Rock Lobster" */
  variantName: string;
  description: string;
  price: number;
  originalPrice?: number;
  weight: string;
  /** Top-level category name e.g. "Premium Sea Food" */
  category: string;
  /** Sub-category name e.g. "Lobster" */
  subCategory: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  discount?: number;
  deliveryTime: string;
  isBestseller?: boolean;
  isFavorite?: boolean;
}

export interface CuttingType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PieceSize {
  id: string;
  name: string;
  range: string;
  description: string;
  useCase: string;
}

export interface ProcessingWeightLoss {
  min: number;
  max: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  cuttingType: CuttingType;
  pieceSize: PieceSize;
  size: string;
  totalPayable: number;
}

/**
 * SubCategory definition: a named subcategory with product variants.
 * E.g. { name: "Lobster", products: ["Rock Lobster", "Tiger Lobster", "Spiny Lobster"] }
 */
export interface SubCategoryDef {
  name: string;
  products: string[];
}

export interface SiteConfig {
  categories: string[];
  /** Maps a categoryKey -> array of SubCategoryDef */
  subCategories: Record<string, SubCategoryDef[]>;
  sizes: Record<string, string[]>;
  cuttingTypes: CuttingType[];
  pieceSizes: PieceSize[];
  processingWeightLoss: Record<string, number | ProcessingWeightLoss>;
}

export type CategoryKey =
  | "freshWater"
  | "seaFish"
  | "premiumSeaFood"
  | "meatPoultry"
  | "fryReady"
  | "momsMagic"
  | "riceSpice"
  | "petServe";
