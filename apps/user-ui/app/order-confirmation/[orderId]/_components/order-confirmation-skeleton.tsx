import { Skeleton } from "@/components/ui/skeleton";

export function OrderConfirmationSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-14 space-y-6">
      {/* Success header skeleton */}
      <div className="flex flex-col items-center space-y-3 mb-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <Skeleton className="mb-4 h-3 w-24" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
