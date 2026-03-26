import { MeiliSearch } from "meilisearch";
import { ENV } from "@repo/env-config";
import { prismaMongo as prisma } from "@repo/db-mongo";

export const meiliClient = new MeiliSearch({
  host: ENV.MEILISEARCH_HOST,
  apiKey: ENV.MEILISEARCH_API_KEY || undefined,
});

export const PRODUCTS_INDEX = "products";

/** Build the flat document we index in Meilisearch */
export function toMeiliDoc(product: {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory?: string | null;
  tags?: string[];
  short_description?: string | null;
  sale_price?: number | null;
  regular_price?: number | null;
  isDeleted?: boolean | null;
  status?: string | null;
  ratings?: number | null;
  images?: Array<{ url?: string | null }>;
  storeId?: string | null;
  catalogProductId?: string | null;
}) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category,
    subCategory: product.subCategory ?? "",
    tags: Array.isArray(product.tags) ? product.tags : [],
    short_description: product.short_description ?? "",
    sale_price: Number(product.sale_price ?? 0),
    regular_price: Number(product.regular_price ?? 0),
    imageUrl: product.images?.[0]?.url ?? null,
    isDeleted: product.isDeleted ?? false,
    status: product.status ?? "active",
    ratings: Number(product.ratings ?? 0),
    // true only for store variants (have both storeId and catalogProductId)
    isStoreVariant: !!(product.storeId && product.catalogProductId),
  };
}

/** One-time index settings — call at app startup */
export async function initMeilisearchIndex() {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    await index.updateSettings({
      searchableAttributes: [
        "title",
        "tags",
        "short_description",
        "category",
        "subCategory",
      ],
      filterableAttributes: [
        "isDeleted",
        "status",
        "category",
        "subCategory",
        "isStoreVariant",
      ],
      sortableAttributes: ["sale_price", "ratings"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
        "ratings:desc",
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      },
    });
    console.log("✅ Meilisearch index configured");
  } catch (err) {
    console.error("❌ Meilisearch init failed:", (err as Error).message);
  }
}

/** Fire-and-forget helpers (non-blocking) */
export function indexProduct(product: Parameters<typeof toMeiliDoc>[0]) {
  // Only index store variants — catalog products have no product detail page
  if (!product.storeId || !product.catalogProductId) return;
  meiliClient
    .index(PRODUCTS_INDEX)
    .addDocuments([toMeiliDoc(product)])
    .catch((e) => console.error("[Meili] index error:", e.message));
}

export function updateIndexedProduct(
  product: Parameters<typeof toMeiliDoc>[0],
) {
  if (!product.storeId || !product.catalogProductId) return;
  meiliClient
    .index(PRODUCTS_INDEX)
    .updateDocuments([toMeiliDoc(product)])
    .catch((e) => console.error("[Meili] update error:", e.message));
}

export function removeIndexedProduct(id: string) {
  meiliClient
    .index(PRODUCTS_INDEX)
    .deleteDocument(id)
    .catch((e) => console.error("[Meili] delete error:", e.message));
}

/** Full reindex — only indexes store variants (products that have a product detail page) */
export async function reindexAllProducts() {
  const products = await prisma.products.findMany({
    where: {
      isDeleted: false,
      storeId: { not: null },
      catalogProductId: { not: null },
    },
    include: { images: { take: 1 } },
  });

  const docs = products.map(toMeiliDoc);
  const BATCH = 500;
  for (let i = 0; i < docs.length; i += BATCH) {
    await meiliClient
      .index(PRODUCTS_INDEX)
      .addDocuments(docs.slice(i, i + BATCH));
  }
  return products.length;
}
