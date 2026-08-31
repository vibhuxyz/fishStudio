import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@repo/zod-schema";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

/* ── Server-side cart persistence ─────────────────────────────────────────
   There is exactly one server write path for the cart: validate-cart, which
   syncItems() calls. It already receives every line and persists it against
   the authenticated user, so persisting here means debouncing a syncItems()
   rather than POSTing a second, competing copy of the cart.

   site-header re-syncs every 60s anyway; this just makes a change show up on
   the user's other device in seconds instead of up to a minute.
─────────────────────────────────────────────────────────────────────────── */
let _saveCartTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersistCart(syncItems: () => Promise<unknown>) {
  if (_saveCartTimer) clearTimeout(_saveCartTimer);
  _saveCartTimer = setTimeout(() => {
    // Errors are swallowed inside syncItems, which already treats a failed
    // sync as non-fatal; the 60s interval retries it regardless.
    void syncItems();
  }, 2_000);
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
    // validate-cart cannot express an empty cart (it requires >= 1 item), so
    // clearing needs its own endpoint or the server would keep the last
    // non-empty snapshot forever.
    await axiosInstance.post("/product/api/cart/clear", {});
  } catch {
    // Non-critical — an order-placed clear is also handled server-side by
    // createOrder, and the reminder job skips empty carts.
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

/** One line of the server-side cart, as stored by validate-cart. Identities
 *  and options only — never a product snapshot. */
type ServerCartLine = {
  productId: string;
  quantity?: number;
  cuttingType?: string;
  pieceSize?: string;
  size?: string;
  comboId?: string;
};

/** A stand-in product for a line restored from the server, before
 *  validate-cart has resolved what it actually is. Every descriptive field is
 *  empty on purpose: syncItems overwrites them a moment later, and an empty
 *  title is a visible "still loading" rather than a plausible wrong one. */
const placeholderProduct = (id: string, storeId: string | null): Product => ({
  id,
  name: "",
  slug: "",
  description: "",
  image: "",
  images: [],
  price: 0,
  weight: "",
  sizes: [],
  sizePricing: [],
  cuttingTypePricing: [],
  pieceSizePricing: [],
  rating: 0,
  totalSold: 0,
  stock: 0,
  subCategory: "",
  category: "",
  ...(storeId ? { storeId } : {}),
  cuttingTypes: [],
  pieceSizes: [],
  processingWeightLoss: null,
  status: "Active",
  isBestseller: false,
  isFavorite: false,
});

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
        schedulePersistCart(get().syncItems);
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
      schedulePersistCart(get().syncItems);
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
      schedulePersistCart(get().syncItems);
      return { items: nextItems };
    });
  },

  removeItem: (index) => {
    set((state) => {
      const nextItems = state.items.filter((_, i) => i !== index);
      schedulePersistCart(get().syncItems);
      return { items: nextItems };
    });
  },

  removeComboGroup: (comboId) => {
    set((state) => {
      const nextItems = state.items.filter((it) => it.comboId !== comboId);
      schedulePersistCart(get().syncItems);
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
      schedulePersistCart(get().syncItems);
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
      const { data } = await axiosInstance.get("/product/api/cart");
      const lines: ServerCartLine[] = Array.isArray(data?.items) ? data.items : [];
      if (!data?.success || lines.length === 0) return;

      // Lines are stored as identities only — no price, title or image. Build
      // placeholder products here and let syncItems() below fill them in from
      // validate-cart, which is the single source of pricing. A restored cart
      // therefore never shows a price the checkout wouldn't honour.
      const restored: CartItem[] = lines
        .filter((line) => typeof line?.productId === "string" && line.productId)
        .map((line) => ({
          product: placeholderProduct(line.productId, data.storeId ?? null),
          quantity: typeof line.quantity === "number" && line.quantity > 0 ? line.quantity : 1,
          cuttingType: normalizeOption(line.cuttingType ?? DEFAULT_CUTTING, "cutting-type"),
          pieceSize: normalizeOption(line.pieceSize ?? DEFAULT_PIECE_SIZE, "piece-size"),
          size: line.size ?? DEFAULT_SIZE,
          totalPayable: 0,
          ...(line.comboId ? { comboId: line.comboId } : {}),
        }));
      if (restored.length === 0) return;

      set((state) => ({
        // Local lines win on a signature clash: whatever the customer just
        // did on this device is more current than the stored copy.
        items: mergeCartItems(state.items, restored),
        cartStoreId: data.storeId ?? state.cartStoreId,
      }));

      // Prices, titles, images and stock all arrive here. Without it the
      // restored lines would render as blank ₹0 rows.
      await get().syncItems();
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
      // Every field here is also what gets persisted as the server-side cart
      // (validateCart writes exactly this array), so the options must be sent
      // on every line, not just combo members — a line restored on another
      // device without its cutting type and size is not the same line.
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        cuttingType: item.cuttingType?.name,
        pieceSize: item.pieceSize?.name,
        size: item.size,
        // Lets the backend identify combo bundle members and reprice the
        // whole group to the bundle price instead of catalog price.
        ...(item.comboId ? { comboId: item.comboId } : {}),
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
                  // Also the hydration path for a cart restored from another
                  // device, whose lines start as empty placeholders.
                  name: fresh.title || item.product.name,
                  slug: fresh.slug || item.product.slug,
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
