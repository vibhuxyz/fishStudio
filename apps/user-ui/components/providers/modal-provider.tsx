"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { AddToCartModal } from "@/components/shared/add-to-cart-modal";
import { LoginModal } from "@/components/shared/login-modal";
import { CartSidebar } from "@/components/shared/cart-sidebar";
import { Product } from "@repo/types";

interface ModalContextType {
  openLogin: () => void;
  openCart: () => void;
  openAddToCart: (product: Product) => void;
}

// Default no-op context so useModals never crashes even outside the provider
const defaultCtx: ModalContextType = {
  openLogin: () => {},
  openCart: () => {},
  openAddToCart: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultCtx);

export function useModals(): ModalContextType {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openLogin = useCallback(() => setShowLogin(true), []);
  const openCart = useCallback(() => setShowCart(true), []);
  const openAddToCart = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowAddToCart(true);
  }, []);

  return (
    <ModalContext value={{ openLogin, openCart, openAddToCart }}>
      {children}

      <AddToCartModal
        product={selectedProduct}
        open={showAddToCart}
        onOpenChange={setShowAddToCart}
      />
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <CartSidebar
        open={showCart}
        onOpenChange={setShowCart}
        onLoginClick={openLogin}
      />
    </ModalContext>
  );
}
