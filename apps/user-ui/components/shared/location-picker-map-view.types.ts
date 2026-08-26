// Common contract both map-library views implement — everything in
// location-picker-map.tsx (search, current-location, the fixed center pin)
// is provider-agnostic and talks only to this, never to Leaflet or Google
// APIs directly.
export interface MapViewProps {
  initialCenter: [number, number];
  zoom: number;
  // Set only to programmatically move the map (late-resolving area center,
  // search selection, "use my location") — never by the drag-to-select pan
  // itself, which would otherwise feed back into another recenter.
  flyTarget: [number, number] | null;
  onDragEnd: (lat: number, lng: number) => void;
}
