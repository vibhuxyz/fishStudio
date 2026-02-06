import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allProducts } from "@/lib/data";
import { ProductDetailClient } from "./product-detail-client";

function findProduct(slug: string) {
  const decoded = decodeURIComponent(slug);
  return allProducts.find(
    (p) => p.name.toLowerCase().replace(/[\s/]+/g, "-") === decoded,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product);

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
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviews,
            },
          }),
        }}
      />
    </>
  );
}

function getRelatedProducts(product: (typeof allProducts)[number]) {
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
