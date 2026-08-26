"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapViewProps } from "./location-picker-map-view.types";

function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16));
  }, [lat, lng, map]);
  return null;
}

// The pin stays fixed at the screen's center (rendered by the parent as a
// plain overlay, not a Leaflet marker) — dragging the map in any direction,
// not the pin itself, is what selects a location. `dragend` (not `moveend`)
// is deliberate: `moveend` also fires after a programmatic `flyTo` (e.g. the
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

export default function LeafletMapView({ initialCenter, zoom, flyTarget, onDragEnd }: MapViewProps) {
  return (
    <MapContainer
      center={initialCenter}
      zoom={zoom}
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
      <CenterPinTracker onSettled={onDragEnd} />
    </MapContainer>
  );
}
