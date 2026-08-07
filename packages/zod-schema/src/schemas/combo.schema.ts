import { z } from "zod";

// cuttingType/pieceSize left undefined means that component's variant is
// picked by the shopper at add-to-cart time, not fixed by the seller.
export const comboItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().positive().default(1),
  cuttingType: z.string().optional(),
  pieceSize: z.string().optional(),
});

export const createComboSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  items: z.array(comboItemSchema).min(2, "A combo needs at least 2 products"),
  comboPrice: z.number().positive("Combo price must be greater than 0"),
});

export const updateComboSchema = createComboSchema.partial();

// What the shopper submits when adding a combo to the cart — one variant
// choice per item that was left open by the seller.
export const addComboToCartSchema = z.object({
  comboId: z.string().min(1),
  selections: z.array(
    z.object({
      productId: z.string().min(1),
      cuttingType: z.string().optional(),
      pieceSize: z.string().optional(),
    })
  ),
});
