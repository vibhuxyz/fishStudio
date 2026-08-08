/**
 * All map search/geocoding goes through this interface — the address modal
 * and the map component only ever call `geocodingProvider.*`, never
 * `fetch("https://nominatim...")` directly. To switch providers later (e.g.
 * to Google Places, for better small-business coverage than OpenStreetMap
 * has), implement `GeocodingProvider` against the new API and change the
 * `geocodingProvider` export at the bottom of this file — nothing in
 * address-modal.tsx or location-picker-map.tsx needs to change.
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

export const geocodingProvider: GeocodingProvider = nominatimProvider;
