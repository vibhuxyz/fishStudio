import { Request, Response, NextFunction } from "express";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";
import { validate, z } from "@repo/zod-schema";

/**
 * Google Maps geocoding, proxied.
 *
 * The clients never hold the key. Google's Geocoding and Places *web service*
 * endpoints can only be restricted by IP — the "Android apps" and "HTTP
 * referrer" restrictions cover the native SDKs and the browser JS SDK, not
 * these — so a key shipped in the Android bundle to call them would have to be
 * unrestricted, and an unrestricted Maps key is a well-known way to inherit
 * somebody else's bill. Proxying keeps the key on a known IP.
 *
 * The web app still talks to Google directly through the JS SDK, which is a
 * different key with a referrer restriction; see apps/user-ui/lib/env.ts. These
 * endpoints exist for mobile, and are shaped to match the GeocodingProvider
 * interface both clients already implement rather than mirroring Google's own
 * response shape.
 */

const GOOGLE_PLACES_BASE = "https://maps.googleapis.com/maps/api";
// India-only, matching the storefront's serviceable area. Also narrows the
// result set enough that autocomplete stays useful without a session token.
const REGION = "in";
// Cheap insurance against a client hammering the endpoint on every keystroke:
// the same query from any user resolves to the same place for a good while.
const CACHE_TTL_SECONDS = 60 * 60 * 24;

const searchSchema = z.object({
  query: z.string().trim().min(2, "Search needs at least two characters").max(200),
  // Optional viewport to bias results toward, as "south,west,north,east".
  bounds: z
    .string()
    .regex(/^-?\d+(\.\d+)?(,-?\d+(\.\d+)?){3}$/, "Invalid bounds")
    .optional(),
});

const reverseSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

const geocodeSchema = z.object({
  query: z.string().trim().min(2).max(300),
});

const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

interface PlaceResult {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/**
 * Google returns HTTP 200 with a `status` field for business-level failures, so
 * `res.ok` alone says nothing. ZERO_RESULTS is a legitimate empty answer;
 * anything else is worth logging, because REQUEST_DENIED and
 * OVER_QUERY_LIMIT are configuration and billing problems that would otherwise
 * surface to customers as a silently broken address picker.
 */
async function callGoogle<T extends { status: string; error_message?: string }>(
  path: string,
  params: Record<string, string>,
  operation: string,
): Promise<T | null> {
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    logger.error("[geocoding] GOOGLE_MAPS_API_KEY is not configured");
    return null;
  }

  const url = new URL(`${GOOGLE_PLACES_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("key", ENV.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) {
    logger.error("[geocoding] upstream returned a non-200", { operation, status: response.status });
    return null;
  }

  const data = (await response.json()) as T;
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    logger.error("[geocoding] upstream rejected the request", {
      operation,
      status: data.status,
      // Google puts the actionable part here — "API key not valid", "billing
      // not enabled", "referer restrictions".
      error: data.error_message,
    });
    return null;
  }
  return data;
}

/** Redis is a nice-to-have here; a cache miss or an outage just costs a call. */
async function cached<T>(key: string, produce: () => Promise<T>): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    // Fall through to the upstream call.
  }

  const value = await produce();

  try {
    await redis.set(key, JSON.stringify(value), "EX", CACHE_TTL_SECONDS);
  } catch {
    // Not worth failing the request over.
  }
  return value;
}

export const searchPlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, bounds } = validate(searchSchema, req.query);

    const results = await cached(`geo:search:${bounds ?? "-"}:${query.toLowerCase()}`, async () => {
      const params: Record<string, string> = {
        input: query,
        components: `country:${REGION}`,
      };
      if (bounds) {
        // Google wants a centre + radius rather than a viewport; the centre of
        // the box with a radius to its corner is close enough for biasing, and
        // biasing is all this is — results outside it are still returned.
        const [south, west, north, east] = bounds.split(",").map(Number) as [number, number, number, number];
        params.location = `${(south + north) / 2},${(west + east) / 2}`;
        params.radius = String(Math.max(1000, Math.round(((north - south) * 111_000) / 2)));
      }

      const data = await callGoogle<{
        status: string;
        error_message?: string;
        predictions?: Array<{ place_id: string; description: string }>;
      }>("/place/autocomplete/json", params, "search");

      const predictions = data?.predictions ?? [];
      // Autocomplete returns place ids without coordinates, so each has to be
      // resolved. Capped at five to bound the fan-out — this endpoint is hit
      // per keystroke on the client's debounce.
      const detailed = await Promise.all(
        predictions.slice(0, 5).map(async (prediction): Promise<PlaceResult | null> => {
          const details = await callGoogle<{
            status: string;
            error_message?: string;
            result?: {
              formatted_address?: string;
              name?: string;
              geometry?: { location?: { lat: number; lng: number } };
            };
          }>(
            "/place/details/json",
            { place_id: prediction.place_id, fields: "geometry,formatted_address,name" },
            "search:details",
          );

          const location = details?.result?.geometry?.location;
          if (!location) return null;
          return {
            id: prediction.place_id,
            label: details?.result?.formatted_address || details?.result?.name || prediction.description,
            lat: location.lat,
            lng: location.lng,
          };
        }),
      );

      return detailed.filter((r): r is PlaceResult => r !== null);
    });

    res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = validate(reverseSchema, req.query);

    // Six decimal places is roughly 0.1m — far finer than a dropped pin needs,
    // and rounding here is what makes the cache key hit at all.
    const address = await cached(`geo:reverse:${lat.toFixed(5)},${lng.toFixed(5)}`, async () => {
      const data = await callGoogle<{
        status: string;
        error_message?: string;
        results?: Array<{ formatted_address?: string }>;
      }>("/geocode/json", { latlng: `${lat},${lng}`, region: REGION }, "reverse");

      return data?.results?.[0]?.formatted_address ?? null;
    });

    res.status(200).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

export const geocodeAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = validate(geocodeSchema, req.query);

    const point = await cached(`geo:forward:${query.toLowerCase()}`, async () => {
      const data = await callGoogle<{
        status: string;
        error_message?: string;
        results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
      }>("/geocode/json", { address: query, region: REGION }, "geocode");

      const location = data?.results?.[0]?.geometry?.location;
      return location ? { lat: location.lat, lng: location.lng } : null;
    });

    res.status(200).json({ success: true, point });
  } catch (error) {
    next(error);
  }
};

export const nearbyLandmarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = validate(nearbySchema, req.query);

    const results = await cached(`geo:nearby:${lat.toFixed(4)},${lng.toFixed(4)}`, async () => {
      const data = await callGoogle<{
        status: string;
        error_message?: string;
        results?: Array<{
          place_id?: string;
          name?: string;
          vicinity?: string;
          geometry?: { location?: { lat: number; lng: number } };
        }>;
      }>(
        "/place/nearbysearch/json",
        { location: `${lat},${lng}`, radius: "3000", keyword: "landmark" },
        "nearby",
      );

      return (data?.results ?? []).slice(0, 4).map((place, index) => ({
        id: place.place_id ?? `${place.name ?? "landmark"}-${index}`,
        label: place.name ?? place.vicinity ?? "",
        lat: place.geometry?.location?.lat ?? lat,
        lng: place.geometry?.location?.lng ?? lng,
      }));
    });

    res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};
