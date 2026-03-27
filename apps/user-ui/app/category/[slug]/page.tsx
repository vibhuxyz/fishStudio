import type { Metadata } from "next";
import { CategoryClient } from "./category-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const title = `${categoryName} | Fresh Selection | Fish Studio`;
  const description = `Shop the freshest ${categoryName.toLowerCase()} products at Fish Studio. Premium quality, same-day delivery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/category/${slug}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sub } = await searchParams;

  return <CategoryClient slug={slug} initialSub={sub} />;
}
