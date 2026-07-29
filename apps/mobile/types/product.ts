import type { BackendProduct } from "@repo/zod-schema";

// Mobile renders the raw backend product shape directly (no camelCase
// transform like user-ui's Product type does). Extends the shared shape with
// the nested Shop relation the product-detail/listing endpoints include but
// the shared schema doesn't model, plus a few defensive fallback fields some
// screens read from (never actually populated by the current backend, but
// kept so existing `||` fallbacks stay valid without an `any` escape hatch).
export interface Product extends BackendProduct {
  Shop?: { id: string; name: string };
  shopId?: string;
  quantity?: number;
  cuttingType?: string;
  pieceSize?: string;
  outOfStock?: boolean;
  rating?: number;
  averageRating?: number;
  unit?: string;
  serves?: string;
  description?: string;
  weight?: string;
}
