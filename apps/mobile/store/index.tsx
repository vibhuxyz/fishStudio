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
      updateQuantity: (line, quantity) => {
        if (quantity <= 0) {
          set((state) => ({ cart: state.cart.filter((item) => !matchesLine(item, line)) }));
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            matchesLine(item, line) ? { ...item, quantity } : item
          ),
        }));
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
