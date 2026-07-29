import * as Location from "expo-location";

export interface DetectedPlace {
  pincode: string;
  city: string;
  state: string;
  area: string;
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
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    if (!place) return { ok: false, reason: "not-found" };

    return {
      ok: true,
      place: {
        pincode: place.postalCode || "",
        city: place.city || place.subregion || "",
        state: place.region || "",
        area: [place.district, place.street].filter(Boolean).join(", "),
      },
    };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
