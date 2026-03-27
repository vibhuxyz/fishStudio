import { MeiliSearch } from "meilisearch";
import { ENV } from "@repo/env-config";
import { prismaMongo as prisma } from "@repo/db-mongo";

export const meiliClient = new MeiliSearch({
  host: ENV.MEILISEARCH_HOST,
  apiKey: ENV.MEILISEARCH_API_KEY || undefined,
});

export const PRODUCTS_INDEX = "products";

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
  catalogProduct?: {
    id: string;
    slug?: string | null;
    images?: Array<{ url?: string | null }>;
  } | null;
  storeId?: string | null;
  catalogProductId?: string | null;
  stock?: number | null;
  updatedAt?: Date | string | null;
}) {
  // Strict Image Fallback: Prefer variant image, then catalog image, then absolute placeholder
  const primaryImage =
    product.images?.[0]?.url ||
    product.catalogProduct?.images?.[0]?.url ||
    "https://res.cloudinary.com/dndqbtajj/image/upload/v1774574932/fishStudio-app/placeholders/product-placeholder.png";

  // Canonical slug: ALWAYS favor catalog product slug for clean, consistent redirects
  const canonicalSlug = product.catalogProduct?.slug || product.slug;
  const catalogId =
    product.catalogProductId || (product.storeId ? null : product.id);

  // Canonical ID: Prefix to avoid document collisions across catalog/variants
  const documentId = product.storeId
    ? `variant_${product.id}`
    : `catalog_${product.id}`;

  return {
    id: documentId,
    title: product.title,
    slug: canonicalSlug, // Force canonical slug for clean redirects
    category: product.category,
    subCategory: product.subCategory ?? "",
    tags: Array.isArray(product.tags) ? product.tags : [],
    short_description: product.short_description ?? "",
    sale_price: Number(product.sale_price ?? 0),
    regular_price: Number(product.regular_price ?? 0),
    imageUrl: primaryImage,
    isDeleted: product.isDeleted ?? false,
    status: product.status ?? "active",
    ratings: Number(product.ratings ?? 0),
    storeId: product.storeId ?? null,
    catalogId: catalogId ?? null,
    isCatalog: !product.storeId,
    // Catalog template gets priority 1, variants get priority 2
    priority: !product.storeId ? 1 : 2,
    // Future-ready boost: catalogs get higher base boost
    searchBoost: !product.storeId ? 10 : 5,
    // Stock availability flag
    available: Number(product.stock ?? 0) > 0,
    // Cache busting timestamp
    updatedAt: product.updatedAt
      ? new Date(product.updatedAt).toISOString()
      : new Date().toISOString(),
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
        "storeId",
        "catalogId",
        "isCatalog",
        "priority",
        "available",
      ],
      sortableAttributes: [
        "sale_price",
        "ratings",
        "priority",
        "updatedAt",
        "searchBoost",
      ],
      rankingRules: [
        "priority:asc",
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
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      },
    });
    console.log("✅ Meilisearch index configured");
  } catch (err) {
    console.error("❌ Meilisearch init failed:", (err as Error).message);
  }
}

/** Fire-and-forget helpers (non-blocking) */
export async function indexProduct(product: Parameters<typeof toMeiliDoc>[0]) {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    const doc = toMeiliDoc(product);
    // Atomic update: delete then add to prevent duplicates/stale state
    await index.deleteDocument(doc.id).catch(() => {});
    await index.addDocuments([doc]);
  } catch (e) {
    console.error("[Meili] index error:", (e as Error).message);
  }
}

export async function updateIndexedProduct(
  product: Parameters<typeof toMeiliDoc>[0],
) {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    const doc = toMeiliDoc(product);
    // Atomic update: delete then add to prevent duplicates/stale state
    await index.deleteDocument(doc.id).catch(() => {});
    await index.addDocuments([doc]);
  } catch (e) {
    console.error("[Meili] update error:", (e as Error).message);
  }
}

export function removeIndexedProduct(id: string) {
  const index = meiliClient.index(PRODUCTS_INDEX);
  // Attempt to delete both possible prefixed IDs to ensure no stale data remains
  index.deleteDocument(`catalog_${id}`).catch(() => {});
  index.deleteDocument(`variant_${id}`).catch(() => {});
}

/** Reindex all store variants tied to a specific catalog ID */
export async function reindexCatalogVariants(catalogProductId: string) {
  try {
    const variants = await prisma.products.findMany({
      where: {
        catalogProductId,
        isDeleted: false,
        storeId: { not: null },
      },
      include: {
        images: { take: 1 },
        catalogProduct: { include: { images: { take: 1 } } },
      },
    });

    if (variants.length === 0) {
      // Even if no variants, we must re-index the catalog product itself
      const catalogProd = await prisma.products.findUnique({
        where: { id: catalogProductId },
        include: { images: { take: 1 } },
      });
      if (catalogProd) await updateIndexedProduct(catalogProd as any);
      return;
    }

    // Index variants
    const docs = variants.map(toMeiliDoc);
    const index = meiliClient.index(PRODUCTS_INDEX);

    // Batch atomic delete/add
    await Promise.all(
      docs.map((d) => index.deleteDocument(d.id).catch(() => {})),
    );
    await index.addDocuments(docs);

    // Also update the catalog product itself
    const catalogProd = await prisma.products.findUnique({
      where: { id: catalogProductId },
      include: { images: { take: 1 } },
    });
    if (catalogProd) await updateIndexedProduct(catalogProd as any);

    console.log(
      `[Meili] Reindexed catalog template and ${variants.length} variants for catalog ${catalogProductId}`,
    );
  } catch (err) {
    console.error(
      "[Meili] reindexCatalogVariants error:",
      (err as Error).message,
    );
  }
}

/** Full reindex — indexes BOTH catalog templates and store variants with the NEW logic */
export async function clearAndReindexAll() {
  const index = meiliClient.index(PRODUCTS_INDEX);

  // 1. Wipe everything to remove old-style un-prefixed IDs and stale data
  await index.deleteAllDocuments();
  console.log("[Meili] Index cleared.");

  // 2. Fetch all active products (catalogs and variants)
  const products = await prisma.products.findMany({
    where: { isDeleted: false },
    include: {
      images: { take: 1 },
      catalogProduct: { include: { images: { take: 1 } } },
    },
  });

  const docs = products.map(toMeiliDoc);
  const BATCH = 500;
  for (let i = 0; i < docs.length; i += BATCH) {
    await index.addDocuments(docs.slice(i, i + BATCH));
  }

  console.log(`[Meili] Successfully re-indexed ${products.length} documents.`);
  return products.length;
}

/** Full reindex — only indexes store variants (products that have a product detail page) */
export async function reindexAllProducts() {
  const products = await prisma.products.findMany({
    where: {
      isDeleted: false,
      storeId: { not: null },
      catalogProductId: { not: null },
    },
    include: {
      images: { take: 1 },
      catalogProduct: { include: { images: { take: 1 } } },
    },
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
