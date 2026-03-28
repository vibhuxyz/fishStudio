import {
  fetchStorefrontBanners,
  fetchStorefrontProductListing,
} from "@/lib/storefront";
import { HomePageClient } from "./home-page-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialBanners: Awaited<ReturnType<typeof fetchStorefrontBanners>> = [];
  let initialProductListing:
    | Awaited<ReturnType<typeof fetchStorefrontProductListing>>
    | undefined;

  try {
    [initialBanners, initialProductListing] = await Promise.all([
      fetchStorefrontBanners(),
      fetchStorefrontProductListing({
        scope: "homepage",
        limit: 32,
      }),
    ]);
  } catch {
    // API unavailable (e.g. build time) — client will hydrate and fetch
  }

  return (
    <HomePageClient
      initialBanners={initialBanners}
      initialProductListing={initialProductListing}
    />
  );
}
