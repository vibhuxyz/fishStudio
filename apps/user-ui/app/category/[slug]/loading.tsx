import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
            <Skeleton className="mb-4 h-4 w-24" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="w-full flex-shrink-0 lg:w-60">
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
              <Skeleton className="mb-4 h-4 w-32" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
