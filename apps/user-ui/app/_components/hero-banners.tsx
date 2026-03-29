import { fetchStorefrontBanners } from "@/lib/storefront";
import { OfferCarousel } from "@/components/sections/offer-carousel";

export async function HeroBanners() {
  const banners = await fetchStorefrontBanners();
  
  if (!banners || banners.length === 0) return null;

  return <OfferCarousel initialBanners={banners} />;
}
