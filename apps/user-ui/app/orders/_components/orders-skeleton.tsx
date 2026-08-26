import { Skeleton } from "@/components/ui/skeleton";
import { OrdersHeader } from "./orders-header";

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-4 flex-shrink-0 rounded" />
        </div>
      ))}
    </div>
  );
}

// The whole route in its loading state — used by loading.tsx while the page
// chunk streams, and by the page itself while the session is still resolving.
export function OrdersPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <OrdersHeader />
      <OrdersSkeleton />
    </div>
  );
}
