import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";
import type { Address } from "../lib/address-store";
import type { User } from "../lib/user-store";
import axiosInstance from "../utils/axiosInstance";

export type PriceBreakdown = {
  baseRatePerKg?: number;
  cuttingCharge?: number;
  sizeMultiplier?: number;
  weightGrams?: number;
  effectiveRatePerKg?: number;
};

// Cart/wishlist line item — a converted subset of the raw product (see
// types/product.ts for the full backend shape), not the product itself.
export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  regularPrice?: number;
  badges?: string[];
  image: string;
  quantity?: number;
  shopId: string;
  stock?: number;   // live stock — updated by checkAndIncrement
  status?: string;  // "Active" | "NonActive"
  cuttingType?: string;
  pieceSize?: string;
  selectedSize?: string;
  priceBreakdown?: PriceBreakdown;
  // Set when this line came from a combo bundle — checkout tags the order
  // item with it so order-service reprices the whole group to the bundle
  // price instead of charging this line's own catalog price.
  comboId?: string;
};

// Identifies one cart line. Two lines can share a product `id` but differ by
// cuttingType/pieceSize/selectedSize/comboId (e.g. 1kg vs 2kg of the same
// fish) — every read/write against a specific line must match on all of
// these, not just `id`, or it silently hits the wrong (or every) variant.
export type CartLineKey = {
  id: string;
  cuttingType?: string;
  pieceSize?: string;
  selectedSize?: string;
  comboId?: string;
};

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

/* ── Server-side cart persistence ─────────────────────────────────────────
   validate-cart is the only server write path for the cart, so persisting
   means debouncing a call to it rather than POSTing a second, competing copy.
   The cart screen calls it too, for pricing — but only while that screen is
   mounted and only when the line count changes, so without this a cart built
   here never reaches the account and never shows up on the website.
─────────────────────────────────────────────────────────────────────────── */
let _saveCartTimer: ReturnType<typeof setTimeout> | null = null;
// True from the moment a line changes until that change reaches the server.
// syncCartOnForeground reads it to decide which copy is authoritative.
let _cartDirty = false;

async function persistCart(cart: CartItem[]) {
  // validate-cart requires at least one item, so emptying the cart by removing
  // its last line has to go to the clear endpoint instead — otherwise the
  // server keeps the last non-empty snapshot and pushes it back on next sync.
  if (cart.length === 0) {
    try {
      await axiosInstance.post("/product/api/cart/clear", {});
      _cartDirty = false;
    } catch {
      // Stays dirty; the next foreground retries.
    }
    return;
  }

  // Dynamic so the address store isn't pulled into this module's import graph
  // just for a pincode — the same shape user-ui's syncItems uses.
  const { useAddressStore } = await import("../lib/address-store");
  const { selectedLocation, getSelectedAddress } = useAddressStore.getState();
  const selectedAddress = getSelectedAddress();
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
  if (!pincode) return;

  try {
    await axiosInstance.post("/product/api/validate-cart", {
      cartItems: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
        size: item.selectedSize || undefined,
        cuttingType: item.cuttingType || undefined,
        pieceSize: item.pieceSize || undefined,
        ...(item.comboId ? { comboId: item.comboId } : {}),
      })),
      pincode,
      city: selectedLocation?.city || selectedAddress?.city,
      area: selectedLocation?.area || selectedAddress?.area,
      storeId: selectedLocation?.storeId || undefined,
    });
    _cartDirty = false;
  } catch {
    // Stays dirty on failure, so the next foreground pushes this copy up
    // instead of overwriting it with the server's older one.
  }
}

function schedulePersistCart(getCart: () => CartItem[]) {
  _cartDirty = true;
  if (_saveCartTimer) clearTimeout(_saveCartTimer);
  _saveCartTimer = setTimeout(() => {
    void persistCart(getCart());
  }, 2_000);
}

/** A stored cart line as this store represents it. Title/price/image are left
 *  blank deliberately — the cart screen's validate-cart pass fills them in,
 *  and a blank row reads as loading where a guessed one reads as wrong. */
function serverLineToCartItem(line: ServerCartLine, storeId: string): CartItem {
  return {
    id: line.productId,
    slug: "",
    title: "",
    price: 0,
    image: "",
    shopId: storeId,
    quantity: typeof line.quantity === "number" && line.quantity > 0 ? line.quantity : 1,
    cuttingType: line.cuttingType,
    pieceSize: line.pieceSize,
    selectedSize: line.size,
    ...(line.comboId ? { comboId: line.comboId } : {}),
  };
}

const matchesLine = (item: CartItem, key: CartLineKey) =>
  item.id === key.id &&
  item.cuttingType === key.cuttingType &&
  item.pieceSize === key.pieceSize &&
  item.selectedSize === key.selectedSize &&
  item.comboId === key.comboId;

type Store = {
  cart: CartItem[];
  wishlist: CartItem[];

  addToCart: (product: CartItem, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  removeFromCart: (line: CartLineKey, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  /** Removes every line belonging to a combo bundle in one shot — combo
   *  members can't be removed individually, only as a whole group. */
  removeComboGroup: (comboId: string, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  /** Update quantity for one specific cart line. Removes the line if qty <= 0. */
  updateQuantity: (line: CartLineKey, quantity: number) => void;
  /**
   * Pull the account's server-saved cart and merge it into the local one.
   * Called on sign-in so a cart built on the website follows the user here.
   * Restored lines carry identity and options only — title, price, image and
   * stock are filled in by the cart screen's normal validate-cart pass.
   */
  loadServerCart: () => Promise<void>;
  /**
   * Reconcile with the account's cart when the app comes back to the
   * foreground, so a change made on the website shows up without a re-login.
   * Unlike loadServerCart this can remove lines, which is why it only runs
   * when nothing local is pending — see the implementation.
   */
  syncCartOnForeground: () => Promise<void>;
  /**
   * Async + tap: fetches live stock from the backend before incrementing.
   * Returns { ok: boolean; message?: string } so the UI can show feedback.
   */
  checkAndIncrement: (line: CartLineKey, step?: number) => Promise<{ ok: boolean; message?: string }>;
  clearCart: () => void;

  addToWishlist: (product: CartItem, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  removeFromWishlist: (id: string, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      // ── Add to cart ──────────────────────────────────────────────────────
      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          // Two lines only merge if they're the exact same variant — a
          // different pieceSize or selectedSize (e.g. 1kg vs 2kg) is a
          // different purchase with its own price and must stay its own
          // line, not silently fold its quantity into another tier's price.
          const existing = state.cart.find((item) => matchesLine(item, product));
          if (existing) {
            // Check local stock before incrementing
            const newQty = (existing.quantity ?? 1) + (product.quantity ?? 1);
            if (existing.stock !== undefined && newQty > existing.stock) {
              return state; // silently cap — caller should use checkAndIncrement
            }
            return {
              cart: state.cart.map((item) =>
                matchesLine(item, product) ? { ...item, quantity: newQty } : item
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: product.quantity ?? 1 }],
          };
        });
        schedulePersistCart(() => get().cart);

        if (user?.id && location && deviceInfo) {
          sendKafkaEvent({
            userId: user.id,
            productId: product.id,
            shopId: product.shopId,
            action: "add_to_cart",
            country: location.country || "Unknown",
            city: location.city || "Unknown",
            device: deviceInfo || "Unknown Device",
          });
        }
      },

      // ── Remove from cart ─────────────────────────────────────────────────
      removeFromCart: (line, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => matchesLine(item, line));
        set((state) => ({ cart: state.cart.filter((item) => !matchesLine(item, line)) }));
        schedulePersistCart(() => get().cart);

        if (user?.id && location && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: user.id,
            productId: removeProduct.id,
            shopId: removeProduct.shopId,
            action: "remove_from_cart",
            country: location.country || "Unknown",
            city: location.city || "Unknown",
            device: deviceInfo || "Unknown Device",
          });
        }
      },

      // ── Remove a whole combo group ───────────────────────────────────────
      removeComboGroup: (comboId, user, location, deviceInfo) => {
        const removed = get().cart.filter((item) => item.comboId === comboId);
        set((state) => ({ cart: state.cart.filter((item) => item.comboId !== comboId) }));
        schedulePersistCart(() => get().cart);

        if (user?.id && location && deviceInfo) {
          removed.forEach((item) => {
            sendKafkaEvent({
              userId: user.id,
              productId: item.id,
              shopId: item.shopId,
              action: "remove_from_cart",
              country: location.country || "Unknown",
              city: location.city || "Unknown",
              device: deviceInfo || "Unknown Device",
            });
          });
        }
      },

      // ── Update quantity in-place ─────────────────────────────────────────
      updateQuantity: (line, quantity) => {
        if (quantity <= 0) {
          set((state) => ({ cart: state.cart.filter((item) => !matchesLine(item, line)) }));
        schedulePersistCart(() => get().cart);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            matchesLine(item, line) ? { ...item, quantity } : item
          ),
        }));
        schedulePersistCart(() => get().cart);
      },

      // ── checkAndIncrement: live stock check before + tap ─────────────────
      checkAndIncrement: async (line, step = 1) => {
        const item = get().cart.find((i) => matchesLine(i, line));
        if (!item) return { ok: false, message: "Item not found" };

        try {
          const { data } = await axiosInstance.get(`/product/api/stock/${line.id}`);
          const freshStock: number = data.stock ?? 0;
          const freshStatus: string = data.status ?? "Active";

          // Refresh the stock value in cart so the UI stays accurate
          set((state) => ({
            cart: state.cart.map((i) =>
              matchesLine(i, line) ? { ...i, stock: freshStock, status: freshStatus } : i
            ),
          }));

          if (freshStatus !== "Active" || freshStock === 0) {
            const msg = freshStock === 0
              ? "This product is out of stock"
              : "This product is no longer available";
            return { ok: false, message: msg };
          }

          const currentQty = get().cart.find((i) => matchesLine(i, line))?.quantity ?? 0;
          if (currentQty + step > freshStock) {
            return {
              ok: false,
              message: freshStock === currentQty
                ? "No more stock available"
                : `Only ${freshStock} units available`,
            };
          }

          get().updateQuantity(line, currentQty + step);
          return { ok: true };
        } catch {
          // Network error — fall back to local check
          const currentItem = get().cart.find((i) => matchesLine(i, line));
          if (!currentItem) return { ok: false, message: "Item not found" };
          const currentQty = currentItem.quantity ?? 0;
          if (currentItem.stock !== undefined && currentQty + step > currentItem.stock) {
            return { ok: false, message: `Only ${currentItem.stock} units available` };
          }
          get().updateQuantity(line, currentQty + step);
          return { ok: true };
        }
      },

      // ── Cross-device restore ──────────────────────────────────────────────
      loadServerCart: async () => {
        try {
          const { data } = await axiosInstance.get("/product/api/cart");
          const lines: ServerCartLine[] = Array.isArray(data?.items) ? data.items : [];
          if (!data?.success || lines.length === 0) return;

          set((state) => {
            const merged = [...state.cart];
            for (const line of lines) {
              if (!line?.productId) continue;
              const key: CartLineKey = {
                id: line.productId,
                cuttingType: line.cuttingType,
                pieceSize: line.pieceSize,
                selectedSize: line.size,
                comboId: line.comboId,
              };
              // A line the user already has on this device is more current
              // than the stored copy — leave it alone.
              if (merged.some((item) => matchesLine(item, key))) continue;
              merged.push(serverLineToCartItem(line, data.storeId ?? ""));
            }
            return { cart: merged };
          });
        } catch {
          // Non-critical — fall back to whatever AsyncStorage already holds.
        }
      },

      syncCartOnForeground: async () => {
        // A guest has no server cart, and getCart answers an empty list for
        // one — replacing on that would wipe a basket built before sign-in.
        const { useUserStore } = await import("../lib/user-store");
        if (!useUserStore.getState().user?.id) return;

        // Something changed here and hasn't landed yet, so this device holds
        // the newer copy. Push it up rather than pulling an older one down.
        if (_cartDirty) {
          if (_saveCartTimer) { clearTimeout(_saveCartTimer); _saveCartTimer = null; }
          await persistCart(get().cart);
          return;
        }

        try {
          const { data } = await axiosInstance.get("/product/api/cart");
          if (!data?.success) return;
          const lines: ServerCartLine[] = Array.isArray(data.items) ? data.items : [];

          // Replace rather than merge. Nothing is pending locally, so the
          // local cart is exactly what this device last uploaded — anything
          // that differs on the server was written by another device since,
          // and that includes lines removed there. Merging would resurrect
          // them; this is the one place a pull is allowed to delete.
          set({
            cart: lines
              .filter((line) => Boolean(line?.productId))
              .map((line) => serverLineToCartItem(line, data.storeId ?? "")),
          });
        } catch {
          // Offline or a transient failure — the local cart stands.
        }
      },

      // ── Clear cart ────────────────────────────────────────────────────────
      clearCart: () => {
        // A queued persist would re-upload the cart we're about to clear.
        if (_saveCartTimer) { clearTimeout(_saveCartTimer); _saveCartTimer = null; }
        set({ cart: [] });
        // validate-cart cannot express an empty cart (it requires >= 1 item),
        // so without this the server would keep the last non-empty snapshot
        // and push it back to the web on next sign-in.
        axiosInstance.post("/product/api/cart/clear", {}).catch(() => {});
      },

      // ── Wishlist ──────────────────────────────────────────────────────────
      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => {
          if (state.wishlist.find((item) => item.id === product.id)) return state;
          return { wishlist: [...state.wishlist, product] };
        });

        if (user?.id && location && deviceInfo) {
          sendKafkaEvent({
            userId: user.id,
            productId: product.id,
            shopId: product.shopId,
            action: "add_to_wishlist",
            country: location.country || "Unknown",
            city: location.city || "Unknown",
            device: deviceInfo || "Unknown Device",
          });
        }
      },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        const removeProduct = get().wishlist.find((item) => item.id === id);
        set((state) => ({ wishlist: state.wishlist.filter((item) => item.id !== id) }));

        if (user?.id && location && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: user.id,
            productId: removeProduct.id,
            shopId: removeProduct.shopId,
            action: "remove_from_wishlist",
            country: location.country || "Unknown",
            city: location.city || "Unknown",
            device: deviceInfo || "Unknown Device",
          });
        }
      },
    }),
    {
      name: "store-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
