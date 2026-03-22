"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Truck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

export function CartSidebar({ open, onOpenChange, onLoginClick }: CartSidebarProps) {
  const { isLoggedIn } = useAuth();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const totalPrice = items.reduce((sum, item) => sum + item.totalPayable, 0);
  const deliveryCharge = totalPrice > 500 ? 0 : 40;
  const grandTotal = totalPrice + deliveryCharge;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/40"
            onClick={() => onOpenChange(false)}
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Order Summary
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close cart</span>
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-serif text-lg font-semibold text-foreground">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add items to get started
                  </p>
                  <Button
                    className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onOpenChange(false)}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.product.id}-${item.cuttingType.id}-${item.pieceSize.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {item.product.subCategory}
                              </p>
                              <p className="text-sm font-semibold leading-tight text-card-foreground">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.cuttingType.name} | {item.pieceSize.name}
                                {item.size ? ` | ${item.size}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span className="sr-only">Remove item</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-primary">
                              {"Rs. "}
                              {item.totalPayable.toFixed(0)}
                            </span>

                            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(index, item.quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded text-destructive transition-colors hover:bg-destructive/10"
                              >
                                <Minus className="h-3.5 w-3.5" />
                                <span className="sr-only">Decrease</span>
                              </button>
                              <span className="min-w-[24px] text-center text-sm font-semibold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(index, item.quantity + 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded text-offer-green transition-colors hover:bg-offer-green/10"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="sr-only">Increase</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Bill Details */}
            {items.length > 0 && (
              <div className="border-t border-border bg-card">
                <div className="px-5 py-4">
                  <h3 className="mb-3 text-sm font-bold text-card-foreground">
                    Bill Details
                  </h3>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-card-foreground">
                        {"Rs. "}
                        {totalPrice.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Delivery Charge
                      </span>
                      <span
                        className={
                          deliveryCharge === 0
                            ? "font-medium text-offer-green"
                            : "text-card-foreground"
                        }
                      >
                        {deliveryCharge === 0
                          ? "Free"
                          : `Rs. ${deliveryCharge}`}
                      </span>
                    </div>
                    {deliveryCharge > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Free delivery on orders above Rs. 500
                      </p>
                    )}
                    <div className="mt-1 flex justify-between border-t border-border pt-2">
                      <span className="font-bold text-card-foreground">
                        Total
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {"Rs. "}
                        {grandTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-background px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-offer-green" />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {"Rs. "}
                        {grandTotal.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        incl. taxes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/cart"
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      View cart
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Button
                      className="rounded-lg bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        if (!isLoggedIn) {
                          onOpenChange(false);
                          onLoginClick?.();
                        } else {
                          // TODO: navigate to checkout page
                        }
                      }}
                    >
                      {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
