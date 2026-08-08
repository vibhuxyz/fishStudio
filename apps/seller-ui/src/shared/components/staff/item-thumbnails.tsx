"use client";
import Image from "next/image";
import { Package } from "lucide-react";

/** Small overlapping stack of product thumbnails for an order-item list. */
export function ItemThumbnails({ items = [] }: { items?: any[] }) {
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  if (shown.length === 0) return null;
  return (
    <div className="flex items-center -space-x-2 shrink-0">
      {shown.map((item, idx) => {
        const url = item.product?.images?.[0]?.url;
        return (
          <div
            key={idx}
            className="relative w-9 h-9 rounded-lg border-2 border-[#0f1117] bg-gray-800 overflow-hidden"
          >
            {url ? (
              <Image src={url} alt={item.product?.title || "Product"} fill className="object-cover" sizes="36px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={14} className="text-gray-600" />
              </div>
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div className="relative w-9 h-9 rounded-lg border-2 border-[#0f1117] bg-gray-800 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-gray-400">+{extra}</span>
        </div>
      )}
    </div>
  );
}

export function itemsSummary(items: any[] = []) {
  const names = items.map((i) => i.product?.title || "Product");
  if (names.length === 0) return "No items";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}
