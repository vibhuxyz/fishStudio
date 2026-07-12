import axiosInstance from "@/utils/axiosInstance";
import { getDeviceId } from "@/lib/device";

// Records a product view. Fire-and-forget — never blocks navigation and never
// surfaces errors to the UI. Works for both logged-in users (Bearer token) and
// guests (x-device-id header).
export async function trackProductView(productId: string) {
  if (!productId) return;
  try {
    const deviceId = await getDeviceId();
    await axiosInstance.post(
      "/product/api/track-view",
      { productId, source: "mobile" },
      { headers: { "x-device-id": deviceId } },
    );
  } catch {
    // Analytics is best-effort.
  }
}

// Shared location params builder so activity calls return store-aware pricing.
export type ActivityParams = Record<string, string | undefined>;

export async function fetchRecentlyViewed(params: ActivityParams = {}) {
  const deviceId = await getDeviceId();
  const res = await axiosInstance.get("/product/api/recently-viewed", {
    params,
    headers: { "x-device-id": deviceId },
  });
  return (res.data?.products ?? []) as any[];
}

export async function fetchForYou(params: ActivityParams = {}) {
  const deviceId = await getDeviceId();
  const res = await axiosInstance.get("/product/api/for-you", {
    params,
    headers: { "x-device-id": deviceId },
  });
  return (res.data?.products ?? []) as any[];
}

// Folds guest (deviceId) history into the logged-in account. Call right after
// a successful login.
export async function mergeActivity() {
  try {
    const deviceId = await getDeviceId();
    await axiosInstance.post(
      "/product/api/merge-activity",
      { deviceId },
      { headers: { "x-device-id": deviceId } },
    );
  } catch {
    // Best-effort.
  }
}
