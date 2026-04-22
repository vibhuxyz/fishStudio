import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@repo/zod-schema";
import { axiosInstance } from "./utils";
import { toast } from "sonner";

/* ── Server-side cart persistence (abandoned cart detection) ──────────────
   Debounced: fires 5 seconds after the last cart mutation.
   Only runs when a user is logged in (the endpoint requires auth).
   Silently ignores errors — this is non-critical.
─────────────────────────────────────────────────────────────────────────── */
let _saveCartTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSaveCart(
  items: CartItem[],
  storeId?: string | null,
  storeName?: string | null,
  totalAmount?: number,
) {
  if (_saveCartTimer) clearTimeout(_saveCartTimer);
  _saveCartTimer = setTimeout(async () => {
    try {
      await axiosInstance.post("/auth/api/save-cart", {
        items: items.map((i) => ({
          productId: i.product.id,
          title:     i.product.name ?? (i.product as any).title,
          image:     i.product.image ?? (i.product.images as any)?.[0]?.url,
          quantity:  i.quantity,
          price:     i.product.price ?? (i.product as any).sale_price,
        })),
        storeId,
        storeName,
        totalAmount,
      });
    } catch {
      // Silently ignore — this is background persistence only
    }
  }, 5_000); // 5-second debounce
}

async function clearServerCart() {
  try {
    await axiosInstance.post("/auth/api/clear-cart", {});
  } catch {
    // Non-critical
  }
}

type CuttingType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type PieceSize = {
  id: string;
  name: string;
  range?: string;
  description?: string;
  useCase?: string;
};

export type PriceBreakdown = {
  baseRatePerKg?: number;
  cuttingCharge?: number;
  sizeMultiplier?: number;
  weightGrams?: number;
  effectiveRatePerKg?: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  cuttingType: CuttingType;
  pieceSize: PieceSize;
  size: string;
  totalPayable: number;
  priceBreakdown?: PriceBreakdown;
};

interface CartState {
  items: CartItem[];
  cartStoreId: string | null;
  addItem: (
    product: Product,
    quantity: number,
    cuttingType: CuttingType | string,
    pieceSize: PieceSize | string,
    size: string,
    priceBreakdown?: PriceBreakdown,
  ) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  /** Async + click: fetches live stock, updates the item's stock, then increments if still available. */
  checkAndIncrement: (index: number, step?: number) => Promise<{ ok: boolean; message?: string }>;
  quickAdd: (product: Product) => void;
  quickRemove: (productId: string) => void;
  getProductQty: (productId: string) => number;
  totalItems: () => number;
  totalPrice: () => number;
  clearCart: () => void;
  syncItems: () => Promise<any>;
  deliveryMetadata: {
    cartDeliveryTime: number | null;
    isStoreOpen: boolean;
    storeName: string | null;
    isServiceable: boolean;
    nearbyHint: string | null;
    openingHours: string | null;
  };
}

const DEFAULT_CUTTING: CuttingType = {
  id: "whole",
  name: "Whole Fish",
  description: "Complete fish, cleaned and ready to cook",
  icon: "fish",
};

const DEFAULT_PIECE_SIZE: PieceSize = {
  id: "medium",
  name: "Medium",
  range: "60-80 gm",
  description: "Medium-sized pieces, versatile for most dishes",
  useCase: "Curry, Tandoori, Grill, Fry",
};

const DEFAULT_SIZE = "500 gm - 1 Kg";

const normalizeOption = (
  option: CuttingType | PieceSize | string,
  fallbackId: string,
) => {
  if (typeof option === "string") {
    return {
      id: option.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: option,
    };
  }

  const normalized = { ...option } as any;
  if (!normalized.id) normalized.id = fallbackId;
  if (!normalized.name) normalized.name = fallbackId;
  return normalized;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartStoreId: null,
      deliveryMetadata: {
        cartDeliveryTime: null,
        isStoreOpen: true,
        storeName: null,
        isServiceable: true,
        nearbyHint: null,
        openingHours: null,
      },

      addItem: (product, quantity, cuttingType, pieceSize, size, priceBreakdown) => {
    const normalizedCuttingType = normalizeOption(cuttingType, "cutting-type");
    const normalizedPieceSize = normalizeOption(pieceSize, "piece-size");
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.cuttingType.id === normalizedCuttingType.id &&
          item.pieceSize.id === normalizedPieceSize.id &&
          item.size === size
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        const existing = updated[existingIndex];

        const currentTotalQty = get().getProductQty(product.id);
        if (product.stock !== undefined && currentTotalQty + quantity > product.stock) {
          toast.error(`Cannot add more than ${product.stock} available units`);
          return {};
        }

        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPayable: newQty * product.price,
        };
        const nextItems = updated;
        const total = nextItems.reduce((s, i) => s + i.totalPayable, 0);
        scheduleSaveCart(nextItems, state.cartStoreId, state.deliveryMetadata.storeName, total);
        return { items: updated };
      }

      if (product.stock !== undefined && quantity > product.stock) {
        toast.error(`Only ${product.stock} units available in stock`);
        return {};
      }

      const nextItems = [
        ...state.items,
        {
          product,
          quantity,
          cuttingType: normalizedCuttingType,
          pieceSize: normalizedPieceSize,
          size,
          totalPayable: quantity * product.price,
          priceBreakdown,
        },
      ];
      const total = nextItems.reduce((s, i) => s + i.totalPayable, 0);
      scheduleSaveCart(nextItems, state.cartStoreId, state.deliveryMetadata.storeName, total);
      return { items: nextItems };
    });
  },

  removeItem: (index) => {
    set((state) => {
      const nextItems = state.items.filter((_, i) => i !== index);
      const total = nextItems.reduce((s, i) => s + i.totalPayable, 0);
      scheduleSaveCart(nextItems, state.cartStoreId, state.deliveryMetadata.storeName, total);
      return { items: nextItems };
    });
  },

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }

    const item = get().items[index];
    if (!item) return;

    const otherItemsQty = get().items
      .filter((it, i) => it.product.id === item.product.id && i !== index)
      .reduce((sum, it) => sum + it.quantity, 0);

    if (item.product.stock !== undefined && otherItemsQty + quantity > item.product.stock) {
      toast.error(`Limit reached: Only ${item.product.stock} units available`);
      return;
    }

    set((state) => {
      const nextItems = state.items.map((it, i) =>
        i === index
          ? { ...it, quantity, totalPayable: quantity * it.product.price }
          : it
      );
      const total = nextItems.reduce((s, i) => s + i.totalPayable, 0);
      scheduleSaveCart(nextItems, state.cartStoreId, state.deliveryMetadata.storeName, total);
      return { items: nextItems };
    });
  },

  checkAndIncrement: async (index, step = 0.5) => {
    const item = get().items[index];
    if (!item) return { ok: false, message: "Item not found" };

    try {
      const { data } = await axiosInstance.get(
        `/product/api/stock/${item.product.id}`,
      );

      const freshStock: number = data.stock ?? 0;
      const freshStatus: string = data.status ?? "Active";

      // Update the stock value stored in the cart item so the UI reflects it
      set((state) => ({
        items: state.items.map((it, i) =>
          i === index
            ? { ...it, product: { ...it.product, stock: freshStock, status: freshStatus as "Active" | "NonActive" } }
            : it,
        ),
      }));

      if (freshStatus !== "Active" || freshStock === 0) {
        const msg = freshStock === 0 ? "This product is out of stock" : "This product is no longer available";
        toast.error(msg);
        return { ok: false, message: msg };
      }

      // Total qty across all cart lines for this product after the increment
      const otherQty = get().items
        .filter((it, i) => it.product.id === item.product.id && i !== index)
        .reduce((s, it) => s + it.quantity, 0);
      const newQty = item.quantity + step;

      if (otherQty + newQty > freshStock) {
        const available = Math.max(0, freshStock - otherQty);
        const msg = available <= 0
          ? "No more stock available"
          : `Only ${available} kg available`;
        toast.error(msg);
        return { ok: false, message: msg };
      }

      get().updateQuantity(index, newQty);
      return { ok: true };
    } catch {
      // Network error — fall back to local check so UX doesn't break
      const item = get().items[index];
      if (!item) return { ok: false, message: "Item not found" };
      const otherQty = get().items
        .filter((it, i) => it.product.id === item.product.id && i !== index)
        .reduce((s, it) => s + it.quantity, 0);
      const newQty = item.quantity + step;
      if (item.product.stock !== undefined && otherQty + newQty > item.product.stock) {
        toast.error(`Only ${item.product.stock} units available`);
        return { ok: false, message: "Stock limit reached" };
      }
      get().updateQuantity(index, newQty);
      return { ok: true };
    }
  },

  quickAdd: (product) => {
    const state = get();
    const currentQty = state.getProductQty(product.id);

    if (product.stock !== undefined && currentQty + 0.5 > product.stock) {
      toast.error(`Limit reached: ${product.stock} units available`);
      return;
    }

    const existingIndex = state.items.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingIndex >= 0) {
      // Use live stock check for existing items
      state.checkAndIncrement(existingIndex, 0.5);
    } else {
      const firstSize = product.sizes?.[0] || product.weight || "unit";
      const firstCutting = product.cuttingTypes?.[0] || "default";
      const firstPieceSize = product.pieceSizes?.[0] || "default";
      state.addItem(product, 0.5, firstCutting, firstPieceSize, firstSize);
    }
  },

  quickRemove: (productId) => {
    const state = get();
    const existingIndex = state.items.findIndex(
      (item) => item.product.id === productId
    );
    if (existingIndex >= 0) {
      const current = state.items[existingIndex].quantity;
      if (current <= 0.5) {
        state.removeItem(existingIndex);
      } else {
        state.updateQuantity(existingIndex, current - 0.5);
      }
    }
  },

  getProductQty: (productId) => {
    return get().items
      .filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  },

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.totalPayable, 0);
  },

  clearCart: () => {
    // Cancel any pending save-cart debounce
    if (_saveCartTimer) { clearTimeout(_saveCartTimer); _saveCartTimer = null; }
    // Mark the server-side cart as converted (order placed)
    clearServerCart();
    set({
      items: [],
      cartStoreId: null,
      deliveryMetadata: {
        cartDeliveryTime: null,
        isStoreOpen: true,
        storeName: null,
        isServiceable: true,
        nearbyHint: null,
        openingHours: null,
      },
    });
  },

  syncItems: async () => {
    const { items } = get();
    if (items.length === 0) return;

    // Get pincode from address store
    const { selectedLocation, getSelectedAddress } = (await import("./address-store")).useAddressStore.getState();
    const pincode = selectedLocation?.pincode || getSelectedAddress()?.pincode;
    const city = selectedLocation?.city || getSelectedAddress()?.city;

    if (!pincode) return;

    try {
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const { data } = await axiosInstance.post("/product/api/validate-cart", {
        cartItems,
        pincode,
        city,
        storeId: selectedLocation?.storeId || undefined,
      });

      if (data.success && data.items) {
        const validatedItems = data.items;
        
        set((state) => ({
          cartStoreId: data.storeId || state.cartStoreId,
          deliveryMetadata: {
            cartDeliveryTime: data.cartDeliveryTime || null,
            isStoreOpen: data.isStoreOpen !== false,
            storeName: data.storeName || data.store?.name || null,
            isServiceable: data.isServiceable !== false,
            nearbyHint: data.nearbyHint || null,
            openingHours: data.openingHours || data.store?.opening_hours || null,
          },
          items: state.items.map((item) => {
            const fresh = validatedItems.find((p: any) => p.productId === item.product.id);
            if (fresh) {
              return {
                ...item,
                product: {
                  ...item.product,
                  id: fresh.resolvedProductId || item.product.id,
                  storeId: data.storeId || item.product.storeId,
                  stock: fresh.availableQty,
                  price: fresh.price,
                  // Mark as inactive if not in stock or not enough qty
                  status: fresh.inStock ? "Active" : "NonActive",
                  image: fresh.image || item.product.image,
                },
                totalPayable: item.quantity * fresh.price,
              };
            }
            return {
              ...item,
              product: {
                ...item.product,
                status: "NonActive",
                stock: 0,
              },
            };
          }),
        }));

        // Also update coupons/events in coupon-store if data is returned
        if (data.coupons || data.events) {
          const { setAvailableCoupons, setAvailableEvents } = (await import("./coupon-store")).useCouponStore.getState() as any;
          if (data.coupons && setAvailableCoupons) setAvailableCoupons(data.coupons);
          if (data.events && setAvailableEvents) setAvailableEvents(data.events);
        }

        return data;
      }
      return null;
    } catch (error) {
      console.error("Cart sync failed:", error);
      return null;
    }
  },
    }),
    {
      name: "fish-studio-cart",
    }
  )
);

// Legacy compatibility aliases used by some components
export function addToCart(
  product: Product,
  quantity: number,
  cuttingType: CuttingType | string,
  pieceSize: PieceSize | string,
  size: string,
  priceBreakdown?: PriceBreakdown,
) {
  useCartStore.getState().addItem(product, quantity, cuttingType, pieceSize, size, priceBreakdown);
}

export function removeFromCart(index: number) {
  useCartStore.getState().removeItem(index);
}

export function updateCartQuantity(index: number, quantity: number) {
  useCartStore.getState().updateQuantity(index, quantity);
}

/** Hook for components that just need total items + total price */
export function useCart() {
  const items = useCartStore((s) => s.items);
  // Show number of distinct line items in badge (not fractional qty sum)
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.totalPayable, 0);
  return { items, totalItems, totalPrice };
}
