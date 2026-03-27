"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { AddToCartModal } from "@/components/shared/add-to-cart-modal";
import { LoginModal } from "@/components/shared/login-modal";
import { CartSidebar } from "@/components/shared/cart-sidebar";
import { Product } from "@repo/zod-schema";
import { setRedirectHandler } from "@/utils/redirect";
import { useUserSession } from "@/hooks/useUserSession";
import { useNotifications } from "@/hooks/useNotifications";

interface ModalContextType {
  openLogin: () => void;
  openCart: () => void;
  openAddToCart: (product: Product) => void;
  openAddress: () => void;
}

// Default no-op context so useModals never crashes even outside the provider
const defaultCtx: ModalContextType = {
  openLogin: () => {},
  openCart: () => {},
  openAddToCart: () => {},
  openAddress: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultCtx);

export function useModals(): ModalContextType {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const { user } = useUserSession();
  // Mount WebSocket for real-time stock updates (STOCK_UPDATE events)
  useNotifications(user?.id);

  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openLogin = useCallback(() => setShowLogin(true), []);
  const openCart = useCallback(() => setShowCart(true), []);
  const openAddToCart = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowAddToCart(true);
  }, []);
  const openAddress = useCallback(() => setShowAddress(true), []);

  useEffect(() => {
    setRedirectHandler(openLogin);
  }, [openLogin]);

  return (
    <ModalContext value={{ openLogin, openCart, openAddToCart, openAddress }}>
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
