"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useAddressStore } from "@/lib/address-store";
import { ProductBadges } from "@/components/shared/product-badge";
import { ComboAddToCartModal } from "@/components/shared/combo-add-to-cart-modal";

interface ComboSummary {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  regularTotal: number;
  comboPrice: number;
  items: {
    quantity: number;
    product: { images?: { url: string }[]; title: string } | null;
  }[];
}

async function fetchHomeCombos(params: { storeId?: string; pincode?: string; city?: string }): Promise<ComboSummary[]> {
  const query = new URLSearchParams();
  if (params.storeId) query.set("storeId", params.storeId);
  if (params.pincode) query.set("pincode", params.pincode);
  if (params.city) query.set("city", params.city);
  const { data } = await axiosInstance.get(`/product/api/get-combos?${query.toString()}`);
  return data.success ? data.combos : [];
}

// The real, purchasable "Combos" section — a fixed bundle of products at
// one bundle price. Renders in place of the old tag-based "Combos" rail
// (home-activity-sections.tsx), which had no actual bundle/discount concept.
export function RealCombosSection({ fallback }: { fallback?: ReactNode }) {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );
  const [openComboId, setOpenComboId] = useState<string | null>(null);

  // Same fallback every other homepage section uses — a customer may not
  // have explicitly picked a store yet this session, only a pincode/city.
  const params = {
    storeId: selectedLocation?.storeId,
    pincode: selectedLocation?.pincode || selectedAddress?.pincode,
    city: selectedLocation?.city || selectedAddress?.city,
  };
  const locationKey = `${params.storeId ?? ""}|${params.pincode ?? ""}|${params.city ?? ""}`;

  const { data: combos = [], isLoading } = useQuery({
    queryKey: ["home-combos", locationKey],
    queryFn: () => fetchHomeCombos(params),
    enabled: !!(params.storeId || params.pincode || params.city),
    staleTime: 1000 * 60 * 5,
  });

  if (combos.length === 0) {
    return isLoading ? null : <>{fallback}</>;
  }

  return (
    <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-xs">
            Bundled & better value
          </p>
          <h2 className="mt-1 font-serif text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            Combos
          </h2>
        </div>

        <div className="hide-scrollbar flex gap-4 overflow-x-auto px-1 pb-2">
          {combos.map((combo) => (
            <div key={combo.id} className="w-[240px] flex-shrink-0">
              <ComboCard combo={combo} onOpen={() => setOpenComboId(combo.id)} />
            </div>
          ))}
        </div>
      </div>

      <ComboAddToCartModal
        comboId={openComboId}
        open={!!openComboId}
        onOpenChange={(open) => !open && setOpenComboId(null)}
      />
    </section>
  );
}

function ComboCard({ combo, onOpen }: { combo: ComboSummary; onOpen: () => void }) {
  const discountPct =
    combo.regularTotal > 0
      ? Math.round(((combo.regularTotal - combo.comboPrice) / combo.regularTotal) * 100)
      : 0;
  // One grid cell per bundled product — 2 items = 2-way split, 3 = 3-way,
  // 4 = 4-way — each showing that product's own first image (or its own
  // placeholder icon if it has none), not a single icon for the whole card.
  const gridItems = combo.items.slice(0, 4).map((i) => ({
    url: i.product?.images?.[0]?.url,
    title: i.product?.title,
  }));
  const itemNames = combo.items
    .map((i) => i.product?.title)
    .filter((t): t is string => Boolean(t));

  return (
    <div className="group flex h-[380px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-[200px] w-full bg-muted text-left"
      >
        <ProductBadges badges={["Combo"]} max={2} />
        {combo.images[0] ? (
          // Seller-uploaded combo photo takes priority over the per-product grid.
          <Image src={combo.images[0]} alt={combo.title} fill sizes="240px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : gridItems.length > 0 ? (
          <div
            className="grid h-full w-full gap-0.5"
            style={{
              gridTemplateColumns: gridItems.length === 1 ? "1fr" : "1fr 1fr",
              gridTemplateRows: gridItems.length <= 2 ? "1fr" : "1fr 1fr",
            }}
          >
            {gridItems.map((item, i) => (
              <div key={i} className="relative flex items-center justify-center overflow-hidden bg-muted">
                {item.url ? (
                  <Image src={item.url} alt={item.title || ""} fill sizes="120px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute right-2 top-2 z-10">
          <div className="w-0 h-0 border-t-[14px] border-t-red-500 border-l-[14px] border-l-transparent drop-shadow-sm rotate-45" />
        </div>
      </button>

      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2.5">
        <div className="space-y-1">
          <h3 className="truncate text-sm font-bold text-card-foreground">
            <button type="button" onClick={onOpen} className="hover:text-primary">
              {combo.title}
            </button>
          </h3>
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {combo.description || itemNames.join(" + ")}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground pt-1">
            {combo.items.length} products bundled
          </p>
        </div>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-card-foreground">₹{combo.comboPrice.toFixed(0)}</span>
            <span className="text-[11px] text-muted-foreground line-through">₹{combo.regularTotal.toFixed(0)}</span>
            {discountPct > 0 && (
              <span className="text-[11px] font-bold text-green-500">{discountPct}% off</span>
            )}
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={onOpen}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
            >
              Add <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
