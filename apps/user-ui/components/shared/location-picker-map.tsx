"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Search, Loader2, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { geocodingProvider, type GeoBounds, type PlaceResult } from "@/lib/geocoding-provider";

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209]; // New Delhi fallback

// ~5.5km at the equator, tighter at higher latitudes — plenty for a single
// serviceable area/pincode without being so tight that a legitimate search
// result just outside it gets rejected.
const AREA_RADIUS_DEG = 0.05;

interface AreaCenter {
  lat: number;
  lng: number;
}

function areaBounds(center: AreaCenter): GeoBounds {
  return {
    west: center.lng - AREA_RADIUS_DEG,
    east: center.lng + AREA_RADIUS_DEG,
    north: center.lat + AREA_RADIUS_DEG,
    south: center.lat - AREA_RADIUS_DEG,
  };
}

// A full reverse-geocoded address is a long comma-separated string (street,
// area, city, state, pincode, country) — the pin label only needs the first
// couple of segments, the part that actually identifies "this place".
function shortLabel(label: string): string {
  return label.split(",").slice(0, 2).join(",").trim();
}

function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16));
  }, [lat, lng, map]);
  return null;
}

// The pin stays fixed at the screen's center (rendered as a plain overlay,
// not a Leaflet marker) — dragging the map in any direction, not the pin
// itself, is what selects a location. `dragend` (not `moveend`) is
// deliberate: `moveend` also fires after a programmatic `flyTo` (e.g. the
// area re-centering itself once resolved), which isn't a real selection and
// shouldn't silently report a location the shopper never actually chose.
function CenterPinTracker({ onSettled }: { onSettled: (lat: number, lng: number) => void }) {
  useMapEvents({
    dragend(e) {
      const c = e.target.getCenter();
      onSettled(c.lat, c.lng);
    },
  });
  return null;
}

export interface LocationPickerValue {
  lat: number;
  lng: number;
  label?: string;
}

interface LocationPickerMapProps {
  value: LocationPickerValue | null;
  onChange: (value: LocationPickerValue) => void;
  // The already-chosen pincode/area's approximate center — when set, the map
  // opens centered here (instead of a generic default) and search results
  // are ranked toward this area instead of matching anywhere in India.
  areaCenter?: AreaCenter | null;
}

export default function LocationPickerMap({ value, onChange, areaCenter }: LocationPickerMapProps) {
  // Read once — MapContainer only honors `center` at creation (that's why
  // `RecenterOnChange`/`flyTarget` exist for every later move).
  const [initialCenter] = useState<[number, number]>(
    value
      ? [value.lat, value.lng]
      : areaCenter
        ? [areaCenter.lat, areaCenter.lng]
        : DEFAULT_CENTER,
  );
  // Set only to programmatically move the map (late-resolving area center,
  // search selection, "use my location") — never by the drag-to-select
  // pan itself, which would otherwise feed back into another flyTo.
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [reverseLabel, setReverseLabel] = useState(value?.label ?? "");
  const [resolvingLabel, setResolvingLabel] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Set only once a search has genuinely come up empty (not "no results yet
  // because nothing was typed") — shows nearby landmarks as a fallback.
  const [noResultsFor, setNoResultsFor] = useState<string | null>(null);
  const [nearbyLandmarks, setNearbyLandmarks] = useState<PlaceResult[]>([]);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);

  // areaCenter is resolved async by the parent (a geocode call) and can
  // arrive after this map has already mounted with the generic fallback —
  // recenter once it does, but only if the shopper hasn't placed a pin yet.
  useEffect(() => {
    if (areaCenter && !value) {
      setFlyTarget([areaCenter.lat, areaCenter.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaCenter?.lat, areaCenter?.lng]);

  async function reverseGeocode(lat: number, lng: number) {
    setResolvingLabel(true);
    try {
      const label = await geocodingProvider.reverseGeocode({ lat, lng });
      setReverseLabel(label ?? "");
      onChange({ lat, lng, label: label ?? undefined });
    } finally {
      setResolvingLabel(false);
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location detection isn't supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        toast.error("Couldn't detect your location. Check your browser's location permission.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    clearTimeout(searchDebounce.current);
    setNoResultsFor(null);
    setNearbyLandmarks([]);
    if (val.trim().length < 3) {
      setResults([]);
      return;
    }
    // Debounced — Nominatim's public instance asks for at most ~1 request/sec.
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const bounds = areaCenter ? areaBounds(areaCenter) : undefined;
        const found = await geocodingProvider.search(val, bounds);
        setResults(found);

        if (found.length === 0) {
          setNoResultsFor(val);
          if (areaCenter) {
            setLoadingLandmarks(true);
            try {
              setNearbyLandmarks(await geocodingProvider.nearbyLandmarks(areaCenter, areaBounds(areaCenter)));
            } finally {
              setLoadingLandmarks(false);
            }
          }
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelectResult = (result: PlaceResult) => {
    setFlyTarget([result.lat, result.lng]);
    setReverseLabel(result.label);
    setQuery("");
    setResults([]);
    onChange({ lat: result.lat, lng: result.lng, label: result.label });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-offer-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-offer-green/90 disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Use my current location
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for a place or landmark..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none focus:border-primary/50"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!searching && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {results.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-muted line-clamp-1"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
        {noResultsFor === query && results.length === 0 && (
          <div className="absolute z-[1000] mt-1 w-full rounded-xl border border-border bg-background shadow-lg p-3">
            <p className="text-sm text-foreground">
              Couldn&apos;t find &quot;{noResultsFor}&quot;. Try a well-known place nearby instead.
            </p>
            {loadingLandmarks ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              nearbyLandmarks.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {nearbyLandmarks.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectResult(r)}
                      className="flex w-full items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-left text-xs hover:bg-muted"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-offer-green" />
                      <span className="line-clamp-1">{r.label}</span>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={initialCenter}
          zoom={value ? 16 : 12}
          scrollWheelZoom
          // touch-action: none hands touch gestures over to Leaflet's own
          // panning entirely — without it, dragging the map on a touchscreen
          // can be interpreted as scrolling the page the map sits inside.
          style={{ height: "100%", width: "100%", touchAction: "none" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {flyTarget && <RecenterOnChange lat={flyTarget[0]} lng={flyTarget[1]} />}
          <CenterPinTracker onSettled={reverseGeocode} />
        </MapContainer>

        {/* Fixed at the container's visual center — dragging the map (not
            the pin) is how you select a spot, like Swiggy/Uber Eats. The
            name label rides just above the pin, not just in the caption
            below, so it's obvious at a glance whether the pin landed
            somewhere real. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] flex -translate-x-1/2 -translate-y-full flex-col items-center">
          {(resolvingLabel || reverseLabel) && (
            <div className="mb-1 max-w-[220px] rounded-full border border-border bg-background px-3 py-1 shadow-md">
              <span className="block truncate text-xs font-medium text-foreground">
                {resolvingLabel ? "Locating..." : shortLabel(reverseLabel)}
              </span>
            </div>
          )}
          <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"
              fill="#16a34a"
            />
            <circle cx="18" cy="18" r="7" fill="white" />
          </svg>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {reverseLabel
          ? `Pinned: ${reverseLabel}`
          : "Drag the map in any direction, search, or use your current location — the pin marks the exact delivery spot."}
      </p>
    </div>
  );
}
