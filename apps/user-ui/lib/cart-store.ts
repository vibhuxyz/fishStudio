import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@repo/types";

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

type CartItem = {
  product: Product;
  quantity: number;
  cuttingType: CuttingType;
  pieceSize: PieceSize;
  size: string;
  totalPayable: number;
};

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    cuttingType: CuttingType,
    pieceSize: PieceSize,
    size: string
  ) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  quickAdd: (product: Product) => void;
  quickRemove: (productId: string) => void;
  getProductQty: (productId: string) => number;
  totalItems: () => number;
  totalPrice: () => number;
  clearCart: () => void;
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

  return {
    id: option.id || fallbackId,
    name: option.name || fallbackId,
    ...option,
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity, cuttingType, pieceSize, size) => {
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
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPayable: newQty * product.price,
        };
        return { items: updated };
      }

      return {
        items: [
          ...state.items,
          {
            product,
            quantity,
            cuttingType: normalizedCuttingType,
            pieceSize: normalizedPieceSize,
            size,
            totalPayable: quantity * product.price,
          },
        ],
      };
    });
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index
          ? { ...item, quantity, totalPayable: quantity * item.product.price }
          : item
      ),
    }));
  },

  quickAdd: (product) => {
    const state = get();
    const existingIndex = state.items.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingIndex >= 0) {
      state.updateQuantity(existingIndex, state.items[existingIndex].quantity + 0.5);
    } else {
      state.addItem(product, 0.5, DEFAULT_CUTTING, DEFAULT_PIECE_SIZE, DEFAULT_SIZE);
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

  clearCart: () => set({ items: [] }),
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
  size: string
) {
  useCartStore.getState().addItem(product, quantity, cuttingType, pieceSize, size);
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
