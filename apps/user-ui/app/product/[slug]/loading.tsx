import { ProductViewSkeleton } from "@/components/shared/product-view-skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">
        <ProductViewSkeleton />
      </main>
    </div>
  );
}
