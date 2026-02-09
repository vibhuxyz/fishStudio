export interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  sale_price: number;
  regular_price: number;
  ratings: number;
  sizes: string[];
  stock: number;
  image?: string;
  weight?: string;
  rating?: number;
  // Add starting_date for auction products (optional field)
  starting_date?: string;
  // Additional fields from your backend
  detailed_description?: string;
  tags?: string[];
  cuttingTypes?: string[];
  pieceSizes?: string[];
  processingWeightLoss?: string;
  isDeleted?: boolean;
  cashOnDelivery?: string;
  discount_codes?: string[];
  status?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  storeId?: string;
  images?: Array<{ url: string; alt?: string }>;
}
