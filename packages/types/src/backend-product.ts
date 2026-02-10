// 1. The shape of the raw JSON directly from your API
export interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  images: { url: string; file_id: string }[];
  sale_price: number;
  regular_price: number;
  stock: number;
  totalSold: number;
  ratings: number;

  // Arrays for dropdown options
  sizes: string[];
  cuttingTypes: string[];
  pieceSizes: string[];
  tags: string[];

  processingWeightLoss: string | null;
  favorites: any[];
  status: string;
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

  rating: number; // Mapped from ratings
  totalSold: number;
  stock: number;

  subCategory: string;
  category: string;

  // Arrays for Modal Dropdowns
  cuttingTypes: string[];
  pieceSizes: string[];
  processingWeightLoss: string | null;

  // Derived logic
  isBestseller: boolean;
  isFavorite: boolean;
}
