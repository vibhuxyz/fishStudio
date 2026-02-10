export function ProductCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Image Placeholder */}
      <div className="relative aspect-square w-full bg-muted animate-pulse" />

      {/* Content Placeholder */}
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5">
        {/* Subcategory Label */}
        <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />

        {/* Title */}
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />

        {/* Price and Add Button Row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
