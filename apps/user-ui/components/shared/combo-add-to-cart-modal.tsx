"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { addComboItemToCart } from "@/lib/cart-store";
import { transformProduct } from "@/lib/storefront";
import { distributeComboPrice } from "@repo/shared/pricing";
import type { BackendProduct } from "@repo/zod-schema";
import { toast } from "sonner";

interface ComboAddToCartModalProps {
  comboId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ComboItemData {
  productId: string;
  quantity: number;
  cuttingType?: string;
  pieceSize?: string;
  product: BackendProduct | null;
}

interface ComboData {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  regularTotal: number;
  comboPrice: number;
  items: ComboItemData[];
}

export function ComboAddToCartModal({
  comboId,
  open,
  onOpenChange,
}: ComboAddToCartModalProps) {
  const [combo, setCombo] = useState<ComboData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState<Record<string, { cuttingType?: string; pieceSize?: string }>>({});
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!open || !comboId) {
      setCombo(null);
      setSelections({});
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/product/api/get-combo/${comboId}`)
      .then(({ data }) => {
        if (data.success) {
          setCombo(data.combo);
          // Default every open (customer-choice) item to its product's first option.
          const initial: Record<string, { cuttingType?: string; pieceSize?: string }> = {};
          data.combo.items.forEach((item: ComboItemData, idx: number) => {
            initial[idx] = {
              cuttingType: item.cuttingType ?? item.product?.cuttingTypes?.[0],
              pieceSize: item.pieceSize ?? item.product?.pieceSizes?.[0],
            };
          });
          setSelections(initial);
        } else {
          toast.error("This combo is no longer available");
          onOpenChange(false);
        }
      })
      .catch(() => {
        toast.error("Failed to load combo");
        onOpenChange(false);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, comboId]);

  const unitPrices = useMemo(() => {
    if (!combo) return [];
    return distributeComboPrice(
      combo.comboPrice,
      combo.items.map((item) => ({
        catalogUnitPrice: item.product?.regular_price || item.product?.sale_price || 0,
        quantity: item.quantity,
      })),
    );
  }, [combo]);

  const discountPct = combo && combo.regularTotal > 0
    ? Math.round(((combo.regularTotal - combo.comboPrice) / combo.regularTotal) * 100)
    : 0;

  const handleAdd = () => {
    if (!combo) return;
    for (const item of combo.items) {
      if (!item.product) {
        toast.error("One of the combo items is unavailable right now");
        return;
      }
    }

    setAdding(true);
    try {
      combo.items.forEach((item, idx) => {
        const product = transformProduct(item.product!);
        const selection = selections[idx] || {};
        const cuttingType = item.cuttingType || selection.cuttingType || "default";
        const pieceSize = item.pieceSize || selection.pieceSize || "default";
        addComboItemToCart(
          combo.id,
          product,
          item.quantity,
          cuttingType,
          pieceSize,
          unitPrices[idx]!,
        );
      });
      toast.success(`${combo.title} added to cart!`);
      onOpenChange(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{combo?.title || "Combo"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : combo ? (
          <div className="space-y-4">
            {combo.description && (
              <p className="text-sm text-muted-foreground">{combo.description}</p>
            )}

            <div className="space-y-3">
              {combo.items.map((item, idx) => {
                const product = item.product;
                const needsCutting = !item.cuttingType && (product?.cuttingTypes?.length ?? 0) > 0;
                const needsPieceSize = !item.pieceSize && (product?.pieceSizes?.length ?? 0) > 0;
                return (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-start gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {product?.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.title}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {product?.title || "Unavailable"}
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </p>

                      {item.cuttingType && (
                        <p className="text-xs text-muted-foreground">Cutting: {item.cuttingType}</p>
                      )}
                      {needsCutting && (
                        <Select
                          value={selections[idx]?.cuttingType || ""}
                          onValueChange={(val) =>
                            setSelections((prev) => ({ ...prev, [idx]: { ...prev[idx], cuttingType: val } }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose cutting type" />
                          </SelectTrigger>
                          <SelectContent>
                            {product?.cuttingTypes?.map((ct) => (
                              <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {item.pieceSize && (
                        <p className="text-xs text-muted-foreground">Size: {item.pieceSize}</p>
                      )}
                      {needsPieceSize && (
                        <Select
                          value={selections[idx]?.pieceSize || ""}
                          onValueChange={(val) =>
                            setSelections((prev) => ({ ...prev, [idx]: { ...prev[idx], pieceSize: val } }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Choose piece size" />
                          </SelectTrigger>
                          <SelectContent>
                            {product?.pieceSizes?.map((ps) => (
                              <SelectItem key={ps} value={ps}>{ps}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground line-through">₹{combo.regularTotal.toFixed(0)}</p>
                <p className="text-lg font-bold text-foreground">₹{combo.comboPrice.toFixed(0)}</p>
              </div>
              {discountPct > 0 && (
                <span className="rounded-full bg-offer-green/10 px-2.5 py-1 text-xs font-semibold text-offer-green">
                  {discountPct}% off
                </span>
              )}
            </div>

            <Button
              className="h-12 w-full bg-offer-green text-white hover:bg-offer-green/90"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? "Adding..." : `Add Combo to Cart · ₹${combo.comboPrice.toFixed(0)}`}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
