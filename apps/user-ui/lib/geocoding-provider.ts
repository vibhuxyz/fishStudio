/**
 * All map search/geocoding goes through this interface — the address modal
 * and the map component only ever call `geocodingProvider.*`, never
 * `fetch("https://nominatim...")` directly. Which implementation this
 * resolves to is controlled by NEXT_PUBLIC_MAP_PROVIDER (see lib/env.ts) —
 * nothing in address-modal.tsx or location-picker-map.tsx needs to change
 * to switch providers.
 */

import { frontendEnv } from "./env";
import { loadGoogleMapsScript } from "./google-maps-loader";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

export interface PlaceResult {
  id: string | number;
  label: string;
  lat: number;
  lng: number;
}

export interface GeocodingProvider {
  /** Free-text search, ranked toward `bounds` when given. [] if nothing matches. */
  search(query: string, bounds?: GeoBounds): Promise<PlaceResult[]>;
  /** Human-readable label for a coordinate — a convenience display string only. */
  reverseGeocode(point: GeoPoint): Promise<string | null>;
  /** Resolve a coarse query (e.g. "Sector 45, Gurgaon, 122003") to a point. */
  geocode(query: string): Promise<GeoPoint | null>;
  /** A handful of well-known nearby places, for when `search` finds nothing. */
  nearbyLandmarks(center: GeoPoint, bounds: GeoBounds): Promise<PlaceResult[]>;
}

// ─── Nominatim / OpenStreetMap implementation ───────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function toPlaceResult(r: NominatimResult): PlaceResult {
  return { id: r.place_id, label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
}

function viewboxParam(bounds?: GeoBounds): string {
  if (!bounds) return "";
  return `&viewbox=${bounds.west},${bounds.north},${bounds.east},${bounds.south}`;
}

async function nominatimSearch(query: string, extraParams = ""): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=in&q=${encodeURIComponent(query)}${extraParams}`,
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// A handful of well-known category terms, hard-bounded to the area — used
// only when a real search comes up completely empty.
const NEARBY_LANDMARK_TERMS = ["bus stand", "railway station", "market", "mall", "hospital", "chowk"];

const nominatimProvider: GeocodingProvider = {
  async search(query, bounds) {
    // Nominatim's `q=` matches free text as one address-shaped query — a
    // phrase like "vk pg pari chowk" (a business name Nominatim doesn't
    // index, glued to a real landmark) fails to match anything at all, even
    // though "pari chowk" alone would. Progressively dropping leading words
    // gives the recognizable landmark a chance to surface instead of just
    // coming back empty.
    const words = query.trim().split(/\s+/);
    const boundsParam = viewboxParam(bounds);
    for (let start = 0; start < Math.min(words.length, 4); start++) {
      const attempt = words.slice(start).join(" ");
      if (attempt.length < 3) break;
      const results = await nominatimSearch(attempt, boundsParam);
      if (results.length > 0) return results.map(toPlaceResult);
    }
    return [];
  },

  async reverseGeocode(point) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}`,
      );
      const data = await res.json();
      return data?.display_name ?? null;
    } catch {
      return null;
    }
  },

  async geocode(query) {
    try {
      const results = await nominatimSearch(query);
      return results.length > 0 ? { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) } : null;
    } catch {
      return null;
    }
  },

  async nearbyLandmarks(_center, bounds) {
    const boundsParam = `${viewboxParam(bounds)}&bounded=1`;
    const found: PlaceResult[] = [];
    for (const term of NEARBY_LANDMARK_TERMS) {
      if (found.length >= 4) break;
      try {
        const results = await nominatimSearch(term, boundsParam);
        if (results.length > 0) found.push(toPlaceResult(results[0]));
      } catch {
        // Skip this term, try the next.
      }
    }
    return found;
  },
};

// ─── Google Maps implementation ─────────────────────────────────────────────
// Goes through the JS SDK (google.maps.Geocoder / places.*), not the raw
// REST endpoints — Google's Geocoding/Places web service doesn't send CORS
// headers for browser fetch, it's meant to be called server-side. The SDK's
// own transport is what Google supports calling from a browser.

let placesServiceDiv: HTMLDivElement | null = null;

// PlacesService's constructor requires a Map or a plain DOM node — it never
// actually renders into it for getDetails()/nearbySearch(), so a detached
// div (created once, never appended to the page) is the standard way to use
// it outside of an actual visible map.
function getPlacesService(): google.maps.places.PlacesService {
  if (!placesServiceDiv) placesServiceDiv = document.createElement("div");
  return new google.maps.places.PlacesService(placesServiceDiv);
}

async function ensureGoogleMaps(): Promise<boolean> {
  return loadGoogleMapsScript(frontendEnv.googleMapsApiKey);
}

function toLatLngBounds(bounds?: GeoBounds): google.maps.LatLngBounds | undefined {
  if (!bounds) return undefined;
  return new google.maps.LatLngBounds(
    { lat: bounds.south, lng: bounds.west },
    { lat: bounds.north, lng: bounds.east },
  );
}

const googleMapsProvider: GeocodingProvider = {
  async search(query, bounds) {
    if (!(await ensureGoogleMaps())) return [];

    const autocomplete = new google.maps.places.AutocompleteService();
    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
      autocomplete.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "in" },
          locationBias: toLatLngBounds(bounds),
        },
        (results, status) => {
          resolve(status === google.maps.places.PlacesServiceStatus.OK && results ? results : []);
        },
      );
    });

    // Predictions only carry a place_id, not coordinates — resolve each to a
    // point via getDetails. Capped at 5 (matching Nominatim's own limit)
    // rather than firing a details lookup per keystroke for every prediction.
    const service = getPlacesService();
    const resolved = await Promise.all(
      predictions.slice(0, 5).map(
        (prediction) =>
          new Promise<PlaceResult | null>((resolve) => {
            service.getDetails(
              { placeId: prediction.place_id, fields: ["geometry", "formatted_address", "name"] },
              (place, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
                  resolve(null);
                  return;
                }
                resolve({
                  id: prediction.place_id,
                  label: place.formatted_address || place.name || prediction.description,
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                });
              },
            );
          }),
      ),
    );
    return resolved.filter((r): r is PlaceResult => r !== null);
  },

  async reverseGeocode(point) {
    if (!(await ensureGoogleMaps())) return null;
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ location: point }, (results, status) => {
        resolve(status === google.maps.GeocoderStatus.OK && results?.[0] ? results[0].formatted_address : null);
      });
    });
  },

  async geocode(query) {
    if (!(await ensureGoogleMaps())) return null;
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ address: query, region: "in" }, (results, status) => {
        const location = status === google.maps.GeocoderStatus.OK ? results?.[0]?.geometry?.location : null;
        resolve(location ? { lat: location.lat(), lng: location.lng() } : null);
      });
    });
  },

  async nearbyLandmarks(center, _bounds) {
    if (!(await ensureGoogleMaps())) return [];
    const service = getPlacesService();
    return new Promise((resolve) => {
      service.nearbySearch({ location: center, radius: 3000, keyword: "landmark" }, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          resolve([]);
          return;
        }
        resolve(
          results.slice(0, 4).map((r, i) => ({
            id: r.place_id ?? `${r.name ?? "landmark"}-${i}`,
            label: r.name ?? r.vicinity ?? "",
            lat: r.geometry?.location?.lat() ?? center.lat,
            lng: r.geometry?.location?.lng() ?? center.lng,
          })),
        );
      });
    });
  },
};

export const geocodingProvider: GeocodingProvider =
  frontendEnv.mapProvider === "google" && frontendEnv.googleMapsApiKey
    ? googleMapsProvider
    : nominatimProvider;
