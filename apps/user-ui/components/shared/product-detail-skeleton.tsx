import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-24" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* LEFT: Image Gallery Skeleton */}
          <div className="flex-shrink-0">
            {/* Main Image */}
            <Skeleton className="h-72 w-full rounded-xl md:h-80 md:w-96" />

            {/* Thumbnails */}
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <Skeleton className="h-16 w-16 rounded-lg" />
              {/* Navigation Buttons */}
              <div className="ml-2 flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>

          {/* RIGHT: Details Skeleton */}
          <div className="flex-1 space-y-6">
            <div>
              <Skeleton className="h-3 w-20 mb-2" /> {/* Subcategory */}
              <Skeleton className="h-8 w-3/4" /> {/* Title */}
            </div>

            {/* Description Lines */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Code & Weight Loss */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Ratings */}
            <Skeleton className="h-4 w-32" />

            {/* Price */}
            <Skeleton className="h-8 w-40" />

            {/* Dropdowns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />{" "}
                {/* Select Input */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* Third Dropdown */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Quantity Row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32 rounded-full" /> {/* Counter */}
              <div className="text-right space-y-1">
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Skeleton className="h-11 flex-1 rounded-md" />
              <Skeleton className="h-11 flex-1 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
