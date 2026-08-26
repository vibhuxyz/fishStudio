export const frontendEnv = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URI ||
    "http://localhost:8080",
  corsUrl:
    process.env.NEXT_PUBLIC_CORS_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  servicePort: process.env.NEXT_PUBLIC_SERVICE_PORT || "3000",
  // "google" switches both the visual map and place search/geocoding to
  // Google Maps. Anything else (including unset) keeps the current
  // Leaflet + OpenStreetMap/Nominatim setup, which needs no API key — that's
  // the safe default until a Google Maps key is actually provisioned.
  mapProvider: (process.env.NEXT_PUBLIC_MAP_PROVIDER === "google" ? "google" : "osm") as "osm" | "google",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
};
