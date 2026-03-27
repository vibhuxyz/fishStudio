import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "./product-detail-client";
import { ProductViewSkeleton } from "@/components/shared/product-view-skeleton";
import {
  fetchStorefrontProductBySlug,
  fetchStorefrontProducts,
} from "@/lib/storefront";

// 1. Metadata Generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchStorefrontProductBySlug(decodeURIComponent(slug));
  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | Fish Studio`;
  const description = product.description.slice(0, 160); // Clean SEO description
  const imageUrl = product.images?.[0] || product.image || "/og-image.png";

  return {
    title,
    description,
    keywords: [product.category, product.subCategory, product.name, "online store"],
    openGraph: {
      title,
      description,
      type: "article",
      url: `/product/${product.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// 2. Inner Component (Fetches Data)
async function ProductContent({ slug }: { slug: string }) {
  const decodedSlug = decodeURIComponent(slug);
  const [product, products] = await Promise.all([
    fetchStorefrontProductBySlug(decodedSlug),
    fetchStorefrontProducts(),
  ]);

  if (!product) notFound();

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
