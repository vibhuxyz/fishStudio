import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex gap-6">
        <aside className="hidden flex-shrink-0 md:block md:w-52">
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="mb-3 h-4 w-32" />
            <div className="flex flex-col gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <Skeleton className="mb-4 h-4 w-48" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
