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

type Store = {
  cart: CartItem[];
  wishlist: CartItem[];

  addToCart: (product: CartItem, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  removeFromCart: (id: string, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  /** Removes every line belonging to a combo bundle in one shot — combo
   *  members can't be removed individually, only as a whole group. */
  removeComboGroup: (comboId: string, user: User | null | undefined, location: Address | null, deviceInfo: string) => void;
  /** Update quantity for a cart item by id. Removes the item if qty <= 0. */
  updateQuantity: (id: string, quantity: number) => void;
  /**
   * Async + tap: fetches live stock from the backend before incrementing.
   * Returns { ok: boolean; message?: string } so the UI can show feedback.
   */
  checkAndIncrement: (id: string, step?: number) => Promise<{ ok: boolean; message?: string }>;
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
          // Combo-linked lines never merge with a standalone purchase of the
          // same product+cuttingType — they're priced (and must checkout) as
          // part of the bundle, not merged into an unrelated line.
          const existing = state.cart.find(
            (item) =>
              item.id === product.id &&
              item.cuttingType === product.cuttingType &&
              item.comboId === product.comboId
          );
          if (existing) {
            // Check local stock before incrementing
            const newQty = (existing.quantity ?? 1) + (product.quantity ?? 1);
            if (existing.stock !== undefined && newQty > existing.stock) {
              return state; // silently cap — caller should use checkAndIncrement
            }
            return {
              cart: state.cart.map((item) =>
                item.id === product.id && item.cuttingType === product.cuttingType && item.comboId === product.comboId
                  ? { ...item, quantity: newQty }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: product.quantity ?? 1 }],
          };
        });

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
      removeFromCart: (id, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => item.id === id);
        // Remove only the first matching entry (by id)
        let removed = false;
        set((state) => ({ cart: state.cart.filter((item) => {
          if (!removed && item.id === id) { removed = true; return false; }
          return true;
        }) }));

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
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      // ── checkAndIncrement: live stock check before + tap ─────────────────
      checkAndIncrement: async (id, step = 1) => {
        const item = get().cart.find((i) => i.id === id);
        if (!item) return { ok: false, message: "Item not found" };

        try {
          const { data } = await axiosInstance.get(`/product/api/stock/${id}`);
          const freshStock: number = data.stock ?? 0;
          const freshStatus: string = data.status ?? "Active";

          // Refresh the stock value in cart so the UI stays accurate
          set((state) => ({
            cart: state.cart.map((i) =>
              i.id === id ? { ...i, stock: freshStock, status: freshStatus } : i
            ),
          }));

          if (freshStatus !== "Active" || freshStock === 0) {
            const msg = freshStock === 0
              ? "This product is out of stock"
              : "This product is no longer available";
            return { ok: false, message: msg };
          }

          const currentQty = get().cart.find((i) => i.id === id)?.quantity ?? 0;
          if (currentQty + step > freshStock) {
            return {
              ok: false,
              message: freshStock === currentQty
                ? "No more stock available"
                : `Only ${freshStock} units available`,
            };
          }

          get().updateQuantity(id, currentQty + step);
          return { ok: true };
        } catch {
          // Network error — fall back to local check
          const currentItem = get().cart.find((i) => i.id === id);
          if (!currentItem) return { ok: false, message: "Item not found" };
          const currentQty = currentItem.quantity ?? 0;
          if (currentItem.stock !== undefined && currentQty + step > currentItem.stock) {
            return { ok: false, message: `Only ${currentItem.stock} units available` };
          }
          get().updateQuantity(id, currentQty + step);
          return { ok: true };
        }
      },

      // ── Clear cart ────────────────────────────────────────────────────────
      clearCart: () => set({ cart: [] }),

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
