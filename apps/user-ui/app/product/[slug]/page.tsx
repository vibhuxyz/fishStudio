import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import { transformProduct } from "@/utils/product-utils";
import type { BackendProduct, Product } from "@repo/types";

// 1. Cached Data Fetching Function
// This ensures we don't hit the API twice (once for metadata, once for the page)
const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/get-all-products`,
      {
        // Revalidate data every 5 minutes (adjust as needed)
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const data: { success: boolean; products: BackendProduct[] } =
      await res.json();
    return (data.products || []).map(transformProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
});

// 2. Helper to find specific product
async function findProduct(slug: string) {
  const products = await getProducts();
  // Decode the slug to handle URL encoding
  const decodedSlug = decodeURIComponent(slug);
  return products.find((p) => p.slug === decodedSlug);
}

// 3. Helper to calculate related products
async function getRelatedProducts(product: Product) {
  const allProducts = await getProducts();

  const sameSubCat = allProducts.filter(
    (p) => p.subCategory === product.subCategory && p.id !== product.id,
  );

  const sameCat = allProducts.filter(
    (p) =>
      p.category === product.category &&
      p.subCategory !== product.subCategory &&
      p.id !== product.id,
  );

  return [...sameSubCat, ...sameCat].slice(0, 8);
}

// 4. Generate Metadata (SEO)
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
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

// 5. Main Page Component
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);

  return (
    <>
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />

      {/* SEO: JSON-LD structured data rendered on server */}
      <script
        type="application/ld+json"
        // biome-ignore lint: needed for JSON-LD
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.image,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "INR",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: 20, // Backend doesn't have review count yet, defaulted to 20 or add to type
            },
          }),
        }}
      />
    </>
  );
}
