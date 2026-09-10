import * as Location from "expo-location";
import { geocodingProvider } from "@/lib/geocoding-provider";

export interface DetectedPlace {
  pincode: string;
  city: string;
  state: string;
  area: string;
  formattedAddress: string;
}

export type DetectPlaceResult =
  | { ok: true; place: DetectedPlace }
  | { ok: false; reason: "permission-denied" | "not-found" | "failed" };

/**
 * Reverse-geocodes the device's current position into address fields.
 *
 * The failure reason comes back to the caller rather than a toast: the address
 * form can fall back to manual entry, while the cart's address sheet needs to
 * keep the pincode box in play.
 */
export async function detectCurrentPlace(): Promise<DetectPlaceResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return { ok: false, reason: "permission-denied" };

    const position = await Location.getCurrentPositionAsync({});
    const point = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    // Prefer the configured provider (Google via the proxy, else Nominatim) —
    // its address_components split city and state reliably. The OS geocoder
    // often returns city === null and a `subregion` equal to the state, which
    // is exactly how City and State ended up identical on the form.
    const detailed = await geocodingProvider.reverseGeocodeDetailed(point);
    if (detailed && (detailed.city || detailed.state || detailed.postalCode)) {
      return {
        ok: true,
        place: {
          pincode: detailed.postalCode || "",
          city: detailed.city || "",
          state: detailed.state || "",
          area: detailed.formattedAddress.split(",").slice(0, 2).join(",").trim(),
          formattedAddress: detailed.formattedAddress,
        },
      };
    }

    const [place] = await Location.reverseGeocodeAsync({
      latitude: point.lat,
      longitude: point.lng,
    });
    if (!place) return { ok: false, reason: "not-found" };

    // `subregion` is a district/county — only usable as the city when it isn't
    // just echoing the state back.
    const fallbackCity =
      place.city ||
      (place.subregion && place.subregion !== place.region ? place.subregion : "") ||
      "";

    return {
      ok: true,
      place: {
        pincode: place.postalCode || "",
        city: fallbackCity,
        state: place.region || "",
        area: [place.district, place.street].filter(Boolean).join(", "),
        formattedAddress: "",
      },
    };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
