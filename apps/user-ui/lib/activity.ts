import axiosInstance from "@/utils/axiosInstance";
import { transformProduct } from "@/lib/storefront";
import type { Product } from "@repo/zod-schema";

const DEVICE_ID_KEY = "fs_device_id";

// Stable anonymous device id (localStorage) used to attribute activity for
// logged-out users. SSR-safe: returns "" on the server.
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      const rand = () => Math.random().toString(36).slice(2, 10);
      id = `dev_${Date.now().toString(36)}_${rand()}${rand()}`;
      window.localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

type LocationParams = {
  storeId?: string;
  pincode?: string;
  city?: string;
};

// Records a product view. Fire-and-forget — never throws.
export async function trackProductView(productId: string) {
  if (!productId) return;
  try {
    await axiosInstance.post(
      "/product/api/track-view",
      { productId, source: "web" },
      { headers: { "x-device-id": getDeviceId() } },
    );
  } catch {
    // best-effort
  }
}

async function fetchActivityProducts(
  path: string,
  params: LocationParams,
): Promise<Product[]> {
  const res = await axiosInstance.get(path, {
    params,
    headers: { "x-device-id": getDeviceId() },
  });
  const products = res.data?.products ?? [];
  return Array.isArray(products) ? products.map(transformProduct) : [];
}

export function fetchRecentlyViewed(params: LocationParams = {}) {
  return fetchActivityProducts("/product/api/recently-viewed", params);
}

export function fetchForYou(params: LocationParams = {}) {
  return fetchActivityProducts("/product/api/for-you", params);
}

export type HomeSection = { key: string; title: string; products: Product[] };

export async function fetchHomepageSections(
  params: LocationParams = {},
): Promise<HomeSection[]> {
  const res = await axiosInstance.get("/product/api/get-homepage-sections", {
    params,
  });
  const sections = res.data?.sections ?? [];
  return Array.isArray(sections)
    ? sections.map((s: any) => ({
        key: s.key,
        title: s.title,
        products: Array.isArray(s.products)
          ? s.products.map(transformProduct)
          : [],
      }))
    : [];
}

// Folds guest history into the account after login. Best-effort.
export async function mergeActivity() {
  try {
    await axiosInstance.post(
      "/product/api/merge-activity",
      { deviceId: getDeviceId() },
      { headers: { "x-device-id": getDeviceId() } },
    );
  } catch {
    // best-effort
  }
}
