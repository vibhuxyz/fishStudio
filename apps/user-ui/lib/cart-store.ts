import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@repo/zod-schema";
import axiosInstance from "@/utils/axiosInstance";
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
      // Persist the FULL cart line (options, size, price breakdown, product)
      // so it can be restored exactly on another device / after re-login —
      // not just a lite snapshot. The abandoned-cart reminder only reads
      // items.length, so the richer shape is safe.
      await axiosInstance.post("/auth/api/save-cart", {
        items,
        storeId,
        storeName,
        totalAmount,
      });
    } catch {
      // Silently ignore — this is background persistence only
    }
  }, 5_000); // 5-second debounce
}

/** Stable signature for a cart line so the same product+options dedupes.
 *  Combo-linked lines never dedupe with a standalone purchase of the same
 *  product+options — they're priced (and must checkout) as part of the
 *  bundle, not merged into an unrelated line. */
function cartItemSignature(i: CartItem): string {
  return [i.product?.id, i.cuttingType?.id, i.pieceSize?.id, i.size, i.comboId ?? ""].join("|");
}

/** Merge server-restored items into local items, deduping by signature. */
function mergeCartItems(local: CartItem[], incoming: CartItem[]): CartItem[] {
  const bySig = new Map<string, CartItem>();
  for (const item of local) bySig.set(cartItemSignature(item), item);
  for (const item of incoming) {
    const sig = cartItemSignature(item);
    // Local edits win for a line that exists on both devices.
    if (!bySig.has(sig)) bySig.set(sig, item);
  }
  return [...bySig.values()];
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

export type CartItem = {
  product: Product;
  quantity: number;
  cuttingType: CuttingType;
  pieceSize: PieceSize;
  size: string;
  totalPayable: number;
  priceBreakdown?: PriceBreakdown;
  // Set when this line came from a combo bundle — checkout tags the order
  // item with it so order-service reprices the whole group to the bundle
  // price instead of charging this line's own catalog price.
  comboId?: string;
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
  /** Adds a combo bundle member at its bundle-prorated unit price rather
   *  than the product's own catalog price. */
  addComboItem: (
    comboId: string,
    product: Product,
    quantity: number,
    cuttingType: CuttingType | string,
    pieceSize: PieceSize | string,
    unitPrice: number,
  ) => void;
  removeItem: (index: number) => void;
  /** Removes every line belonging to a combo bundle in one shot — combo
   *  members can't be removed individually, only as a whole group. */
  removeComboGroup: (comboId: string) => void;
  updateQuantity: (index: number, quantity: number) => void;
  /** Async + click: fetches live stock, updates the item's stock, then increments if still available. */
  checkAndIncrement: (index: number, step?: number) => Promise<{ ok: boolean; message?: string }>;
  quickAdd: (product: Product) => void;
  quickRemove: (productId: string) => void;
  getProductQty: (productId: string) => number;
  totalItems: () => number;
  totalPrice: () => number;
  clearCart: () => void;
  /** Restore the user's server-saved cart (cross-device) and merge with local. */
  loadServerCart: () => Promise<void>;
  syncItems: () => Promise<any>;
  deliveryMetadata: {
    cartDeliveryTime: number | null;
    isStoreOpen: boolean;
    isInstantAvailable: boolean;
    storeName: string | null;
    isServiceable: boolean;
    nearbyHint: string | null;
    openingHours: string | null;
    closingHours: string | null;
    // Seller-set bill config (Store settings in seller-ui) — defaults here
    // match order-service's DEFAULT_CART_PRICING fallback, used only until
    // the first validate-cart response for the resolved store lands.
    gstRate: number;
    packagingCharge: number;
    baseDeliveryCharge: number;
    freeDeliveryThreshold: number;
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
        isInstantAvailable: true,
        storeName: null,
        isServiceable: true,
        nearbyHint: null,
        openingHours: null,
        closingHours: null,
        gstRate: 0,
        packagingCharge: 0,
        baseDeliveryCharge: 49,
        freeDeliveryThreshold: 500,
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

  addComboItem: (comboId, product, quantity, cuttingType, pieceSize, unitPrice) => {
    const normalizedCuttingType = normalizeOption(cuttingType, "cutting-type");
    const normalizedPieceSize = normalizeOption(pieceSize, "piece-size");
    set((state) => {
      const size = DEFAULT_SIZE;
      const existingIndex = state.items.findIndex(
        (item) =>
          item.comboId === comboId &&
          item.product.id === product.id &&
          item.cuttingType.id === normalizedCuttingType.id &&
          item.pieceSize.id === normalizedPieceSize.id,
      );

      let nextItems: CartItem[];
      if (existingIndex >= 0) {
        nextItems = [...state.items];
        const existing = nextItems[existingIndex]!;
        const newQty = existing.quantity + quantity;
        nextItems[existingIndex] = { ...existing, quantity: newQty, totalPayable: newQty * unitPrice };
      } else {
        nextItems = [
          ...state.items,
          {
            product,
            quantity,
            cuttingType: normalizedCuttingType,
            pieceSize: normalizedPieceSize,
            size,
            totalPayable: quantity * unitPrice,
            comboId,
          },
        ];
      }
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

  removeComboGroup: (comboId) => {
    set((state) => {
      const nextItems = state.items.filter((it) => it.comboId !== comboId);
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
        isInstantAvailable: true,
        storeName: null,
        isServiceable: true,
        nearbyHint: null,
        openingHours: null,
        closingHours: null,
        gstRate: 0,
        packagingCharge: 0,
        baseDeliveryCharge: 49,
        freeDeliveryThreshold: 500,
      },
    });
  },

  loadServerCart: async () => {
    try {
      const { data } = await axiosInstance.get("/auth/api/get-cart");
      if (!data?.success || !Array.isArray(data.items) || data.items.length === 0) {
        return;
      }
      // Only accept the rich cart shape — legacy lite snapshots (productId only,
      // no full product/options) can't rebuild a valid line, so ignore them.
      const restorable: CartItem[] = data.items.filter(
        (i: any) => i?.product?.id && i?.cuttingType && i?.pieceSize,
      );
      if (restorable.length === 0) return;

      set((state) => {
        const merged = mergeCartItems(state.items, restorable);
        const total = merged.reduce((sum, i) => sum + (i.totalPayable ?? 0), 0);
        // Keep the server copy in sync with the merged result.
        scheduleSaveCart(merged, data.storeId ?? state.cartStoreId, state.deliveryMetadata.storeName, total);
        return {
          items: merged,
          cartStoreId: data.storeId ?? state.cartStoreId,
        };
      });
    } catch {
      // Non-critical — fall back to whatever is in local storage.
    }
  },

  syncItems: async () => {
    const { items } = get();
    if (items.length === 0) return;

    // Get pincode from address store
    const { selectedLocation, getSelectedAddress } = (await import("./address-store")).useAddressStore.getState();
    const selectedAddress = getSelectedAddress();
    const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
    const city = selectedLocation?.city || selectedAddress?.city;
    const area = selectedLocation?.area || selectedAddress?.area;

    if (!pincode) return;

    try {
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        // Lets the backend identify combo bundle members and reprice the
        // whole group to the bundle price instead of catalog price.
        ...(item.comboId ? { comboId: item.comboId, cuttingType: item.cuttingType?.name, pieceSize: item.pieceSize?.name } : {}),
      }));

      const { data } = await axiosInstance.post("/product/api/validate-cart", {
        cartItems,
        pincode,
        city,
        area,
        storeId: selectedLocation?.storeId || undefined,
      });

      if (data.success && data.items) {
        const validatedItems = data.items;
        
        set((state) => ({
          cartStoreId: data.storeId || state.cartStoreId,
          deliveryMetadata: {
            cartDeliveryTime: data.cartDeliveryTime || null,
            isStoreOpen: data.isStoreOpen !== false,
            isInstantAvailable: data.isInstantAvailable === true,
            storeName: data.storeName || data.store?.name || null,
            isServiceable: data.isServiceable !== false,
            nearbyHint: data.nearbyHint || null,
            openingHours: data.openingHours || data.store?.opening_hours || null,
            closingHours: data.closingHours || data.store?.closing_hours || null,
            gstRate: data.gstRate ?? 0,
            packagingCharge: data.packagingCharge ?? 0,
            baseDeliveryCharge: data.baseDeliveryCharge ?? 49,
            freeDeliveryThreshold: data.freeDeliveryThreshold ?? 500,
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

export function addComboItemToCart(
  comboId: string,
  product: Product,
  quantity: number,
  cuttingType: CuttingType | string,
  pieceSize: PieceSize | string,
  unitPrice: number,
) {
  useCartStore.getState().addComboItem(comboId, product, quantity, cuttingType, pieceSize, unitPrice);
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
