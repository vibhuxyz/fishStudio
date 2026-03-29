import { Suspense, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailClient } from "./product-detail-client";
import { RelatedProducts, RelatedProductsSkeleton } from "./_components/related-products";
import { ProductViewSkeleton } from "@/components/shared/product-view-skeleton";
import {
  fetchStorefrontProductBySlug,
} from "@/lib/storefront";

// Deduplicate: generateMetadata + ProductContent share one fetch per request
const getProductBySlug = cache((slug: string) =>
  fetchStorefrontProductBySlug(slug),
);

// 1. Metadata Generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(decodeURIComponent(slug));
  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | Fish Studio`;
  const description = product.description.slice(0, 160);
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
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// 2. Main Product Section (Stream Wave 1)
async function MainProduct({ slug }: { slug: string }) {
  const decodedSlug = decodeURIComponent(slug);
  const { product, coupon } = await getProductBySlug(decodedSlug);

  if (!product) notFound();

  return (
    <ProductDetailClient 
      product={product} 
      coupon={coupon}
    />
  );
}

// 3. Related Products Section (Stream Wave 2)
async function RelatedProductsSection({ slug }: { slug: string }) {
  const decodedSlug = decodeURIComponent(slug);
  const { product } = await getProductBySlug(decodedSlug);
  
  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4">
      <RelatedProducts 
        category={product.category} 
        currentProductId={product.id} 
      />
    </div>
  );
}

// 4. Main Page (Renders Instantly)
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">
        {/* Wave 1: Main Product Details */}
        <Suspense fallback={<ProductViewSkeleton />}>
          <MainProduct slug={slug} />
        </Suspense>

        {/* Wave 2: Related Products */}
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsSection slug={slug} />
        </Suspense>
      </main>
    </div>
  );
}
