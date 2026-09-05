import axiosInstance from "@/utils/axiosInstance";

/**
 * All map search/geocoding goes through this interface — the address picker
 * screen and the map component only ever call `geocodingProvider.*`, never
 * `fetch("https://nominatim...")` directly. To switch providers later (e.g.
 * to Google Places, for better small-business coverage than OpenStreetMap
 * has), implement `GeocodingProvider` against the new API and change the
 * `geocodingProvider` export at the bottom of this file — nothing in
 * add-address/index.tsx or location-picker-map.tsx needs to change.
 */

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
  /** What the results list shows — the place's own name when it has one. */
  label: string;
  /**
   * Postal address, for prefilling an address form. Equal to `label` on
   * providers that only ever return one string for a place.
   */
  address: string;
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

// Nominatim's usage policy asks for an identifying User-Agent — unlike a
// browser's fetch (which silently ignores an app-set User-Agent header),
// React Native's fetch actually sends it, and requests without one are more
// likely to be throttled or dropped by the public instance.
const NOMINATIM_HEADERS = { "User-Agent": "FishStudioApp/1.0 (delivery-address-picker)" };

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function toPlaceResult(r: NominatimResult): PlaceResult {
  // Nominatim has a single display string per place, so the list label and the
  // form prefill are necessarily the same value here.
  return {
    id: r.place_id,
    label: r.display_name,
    address: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  };
}

function viewboxParam(bounds?: GeoBounds): string {
  if (!bounds) return "";
  return `&viewbox=${bounds.west},${bounds.north},${bounds.east},${bounds.south}`;
}

async function nominatimSearch(query: string, extraParams = ""): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=in&q=${encodeURIComponent(query)}${extraParams}`,
    { headers: NOMINATIM_HEADERS },
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
        { headers: NOMINATIM_HEADERS },
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
// Goes through our own backend, not maps.googleapis.com directly.
//
// Google's Geocoding and Places *web service* endpoints can only be restricted
// by IP address — the "Android apps" restriction applies to the native SDKs,
// not to these — so a key bundled into the APK to call them would have to be
// left unrestricted, and it is trivially extractable from the binary. The proxy
// keeps the key on a known server IP; see the auth-service geocoding
// controller. The response shapes below are already this interface's shapes,
// so nothing here has to know what Google's own JSON looks like.

const googleMapsProvider: GeocodingProvider = {
  async search(query, bounds) {
    try {
      const { data } = await axiosInstance.get("/auth/api/geocode/search", {
        params: {
          query,
          ...(bounds
            ? { bounds: `${bounds.south},${bounds.west},${bounds.north},${bounds.east}` }
            : {}),
        },
      });
      return Array.isArray(data?.results) ? data.results : [];
    } catch {
      return [];
    }
  },

  async reverseGeocode(point) {
    try {
      const { data } = await axiosInstance.get("/auth/api/geocode/reverse", {
        params: { lat: point.lat, lng: point.lng },
      });
      return data?.address ?? null;
    } catch {
      return null;
    }
  },

  async geocode(query) {
    try {
      const { data } = await axiosInstance.get("/auth/api/geocode/forward", {
        params: { query },
      });
      return data?.point ?? null;
    } catch {
      return null;
    }
  },

  async nearbyLandmarks(center) {
    try {
      const { data } = await axiosInstance.get("/auth/api/geocode/nearby", {
        params: { lat: center.lat, lng: center.lng },
      });
      return Array.isArray(data?.results) ? data.results : [];
    } catch {
      return [];
    }
  },
};

/* ── Runtime provider selection ───────────────────────────────────────────
   Which backend is live is an admin setting (site_config.mapProvider), not a
   build-time constant — and on a shipped app a build-time constant would mean
   waiting for an app-store release to turn Google off. Google Maps bills per
   request and a key can be revoked, so the fallback has to be one toggle away.

   `geocodingProvider` stays a plain object so no call site changes: it just
   delegates each call to whichever provider is active at the time.
─────────────────────────────────────────────────────────────────────────── */
let runtimeProvider: "osm" | "google" | null = null;

/** Called once the site config lands. Null restores the build's own default. */
export function setMapProvider(provider: string | null | undefined) {
  runtimeProvider = provider === "google" || provider === "osm" ? provider : null;
}

/**
 * The backend in force right now.
 *
 * Google is only honoured when a key is actually present in this build — an
 * admin switching to Google on a build without one would otherwise get a
 * picker that silently returns nothing, which is worse than staying on OSM.
 */
export function activeMapProvider(): "osm" | "google" {
  const choice = runtimeProvider ?? process.env.EXPO_PUBLIC_MAP_PROVIDER;
  return choice === "google" && process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    ? "google"
    : "osm";
}

const active = (): GeocodingProvider =>
  activeMapProvider() === "google" ? googleMapsProvider : nominatimProvider;

export const geocodingProvider: GeocodingProvider = {
  search: (query, bounds) => active().search(query, bounds),
  reverseGeocode: (point) => active().reverseGeocode(point),
  geocode: (query) => active().geocode(query),
  nearbyLandmarks: (center, bounds) => active().nearbyLandmarks(center, bounds),
};
