import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "./product-detail-client";
// Import created above
import { transformProduct } from "@/utils/product-utils"; // Use your shared utils
import type { BackendProduct, Product } from "@repo/types";
import { ProductViewSkeleton } from "@/components/shared/product-view-skeleton";

// Data fetching helper
async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return (data.products || []).map(transformProduct);
  } catch (error) {
    return [];
  }
}

async function findProduct(slug: string) {
  const products = await getProducts();
  const decodedSlug = decodeURIComponent(slug);
  return products.find((p) => p.slug === decodedSlug);
}

// 1. Metadata Generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} - Fish Studio`,
    description: product.description,
    openGraph: { images: product.images || [product.image] },
  };
}

// 2. Inner Component (Fetches Data)
async function ProductContent({ slug }: { slug: string }) {
  const product = await findProduct(slug);
  if (!product) notFound();

  // Get related products
  const products = await getProducts();
  const relatedProducts = [
    ...products.filter(
      (p) => p.subCategory === product.subCategory && p.id !== product.id,
    ),
    ...products.filter(
      (p) => p.category === product.category && p.id !== product.id,
    ),
  ].slice(0, 8);

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  );
}

// 3. Main Page (Renders Instantly)
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* The Suspense boundary catches the async fetch in ProductContent */}
        <Suspense fallback={<ProductViewSkeleton />}>
          <ProductContent slug={slug} />
        </Suspense>
      </main>
    </div>
  );
}
