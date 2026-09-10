export interface ProductSizePricing {
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
}

/**
 * Whether one size can actually be bought right now.
 *
 * Built by the storefront API from the seller variant's per-size stock, or
 * from its single stock pool when the seller hasn't opted into per-size
 * tracking. `qty` is the remaining unit count for that size.
 */
export interface ProductSizeAvailability {
  size: string;
  qty: number;
  inStock: boolean;
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

// 1. The shape of the raw JSON directly from your API
export interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  images: { url: string; file_id: string }[];
  sale_price: number;
  regular_price: number;
  stock: number;
  storeId?: string;
  totalSold: number;
  ratings: number;

  // Arrays for dropdown options
  sizes: string[];
  sizePricing?: ProductSizePricing[] | null;
  /** Per-size stock, computed by the storefront API. One entry per size the
   *  store actually sells, so a picker can disable a sold-out weight instead
   *  of offering it and failing at checkout. Absent on an older cached
   *  payload, which callers must read as "unknown", never as "sold out". */
  sizeAvailability?: ProductSizeAvailability[] | null;
  cuttingTypePricing?: ProductCuttingTypePricing[] | null;
  pieceSizePricing?: ProductPieceSizePricing[] | null;
  cuttingTypes: string[];
  pieceSizes: string[];
  tags: string[];

  processingWeightLoss: string | null;
  favorites: any[];
  status: "Active" | "NonActive";
  basePricePerKg?: number | null;
  // Premium badges computed by the storefront API (e.g. "Best Seller").
  badges?: string[];

  // Product detail page content
  origin?: string | null;
  source?: string | null;
  shelfLife?: string | null;
  storageInstructions?: string | null;
  cookingTips?: string[];
  highlightDescription?: string | null;
  nutritionProtein?: string | null;
  nutritionOmega3?: string | null;
  nutritionCalories?: string | null;
}

// 2. The transformed shape your Frontend Components use
export interface Product {
  id: string;
  name: string; // Mapped from title
  slug: string;
  description: string; // Mapped from short_description
  image: string; // Mapped from images[0].url
  images: string[];
  price: number; // Mapped from sale_price
  originalPrice?: number; // Mapped from regular_price

  weight: string; // Mapped from sizes[0] (Primary display weight)
  sizes: string[]; // Full list of available sizes/packs
  sizePricing: ProductSizePricing[];
  /** Carried straight through from the API — see ProductSizeAvailability. */
  sizeAvailability?: ProductSizeAvailability[] | null;
  cuttingTypePricing: ProductCuttingTypePricing[];
  pieceSizePricing: ProductPieceSizePricing[];

  rating: number; // Mapped from ratings
  totalSold: number;
  stock: number;

  subCategory: string;
  category: string;
  storeId?: string;

  // Arrays for Modal Dropdowns
  cuttingTypes: string[];
  pieceSizes: string[];
  processingWeightLoss: string | null;

  status: "Active" | "NonActive";
  basePricePerKg?: number | null;

  // Derived logic
  isBestseller: boolean;
  isFavorite: boolean;

  // Premium badges computed by the storefront API (e.g. "Best Seller").
  badges?: string[];

  // Detail page content — authored on the catalog root, inherited by variants.
  origin?: string | null;
  source?: string | null;
  shelfLife?: string | null;
  storageInstructions?: string | null;
  cookingTips?: string[];
  highlightDescription?: string | null;
  nutritionProtein?: string | null;
  nutritionOmega3?: string | null;
  nutritionCalories?: string | null;
}
