"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { frontendEnv } from "@/lib/env";
import { loadGoogleMapsScript } from "@/lib/google-maps-loader";
import type { MapViewProps } from "./location-picker-map-view.types";

export default function GoogleMapView({ initialCenter, zoom, flyTarget, onDragEnd }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  // The dragend listener is attached once (map creation), but onDragEnd is a
  // fresh closure every render (it wraps reverseGeocode's component state) —
  // a ref lets the listener always call the latest one without having to
  // tear down and recreate the map to rebind it.
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMapsScript(frontendEnv.googleMapsApiKey).then((ok) => {
      if (cancelled) return;
      if (ok) setReady(true);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const map = new google.maps.Map(containerRef.current, {
      center: { lat: initialCenter[0], lng: initialCenter[1] },
      zoom,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
    });
    map.addListener("dragend", () => {
      const center = map.getCenter();
      if (center) onDragEndRef.current(center.lat(), center.lng());
    });
    mapRef.current = map;
    // initialCenter/zoom are only the *starting* view — later moves go
    // through flyTarget below, so this effect intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!mapRef.current || !flyTarget) return;
    mapRef.current.panTo({ lat: flyTarget[0], lng: flyTarget[1] });
    mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 12, 16));
  }, [flyTarget]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted px-4 text-center text-xs text-muted-foreground">
        Couldn&apos;t load Google Maps. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
