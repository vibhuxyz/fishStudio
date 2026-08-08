import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export interface MapBounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

// Leaflet is a DOM library with no React Native equivalent — rendered inside
// a WebView instead. Reverse geocoding, search, and "use my location" are all
// handled natively in RN (expo-location, fetch) and pushed into the map via
// injectJavaScript; the WebView's only job is to show the interactive pin and
// report back where the user tapped/dragged it to.
function buildMapHtml(lat: number, lng: number, bounds?: MapBounds): string {
  const boundsOption = bounds
    ? `, maxBounds: [[${bounds.south}, ${bounds.west}], [${bounds.north}, ${bounds.east}]], maxBoundsViscosity: 1.0`
    : "";
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
      /* Hands touch gestures over to Leaflet's own panning entirely —
         without this, dragging the map can be interpreted as scrolling
         the RN ScrollView the WebView sits inside. */
      touch-action: none;
    }
    /* Fixed at the screen's center — dragging the map (not the pin) is how
       you select a spot, like Swiggy/Uber Eats. */
    #center-pin {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -100%);
      z-index: 1000;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="center-pin">
    <svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#5A2C96"/>
      <circle cx="18" cy="18" r="7" fill="white"/>
    </svg>
  </div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map("map", { zoomControl: true${boundsOption} }).setView([${lat}, ${lng}], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // "dragend" (not "moveend") is deliberate — moveend also fires after a
    // programmatic flyTo (e.g. window.setMarker below), which isn't a real
    // selection and shouldn't report a location the shopper never chose.
    map.on("dragend", () => {
      const c = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "LOCATION_SELECTED", lat: c.lat, lng: c.lng }));
    });

    // Called from React Native via injectJavaScript when the user picks a
    // search result or detects their current location.
    window.setMarker = function (lat, lng) {
      map.flyTo([lat, lng], 16);
    };

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: "READY" }));
  </script>
</body>
</html>`;
}

export interface LocationPickerMapHandle {
  setMarker: (lat: number, lng: number) => void;
}

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  // The already-chosen pincode/area's approximate bounding box — when set,
  // panning is clamped to it so the shopper can't wander into an unrelated
  // part of the city.
  bounds?: MapBounds;
  onLocationSelected: (lat: number, lng: number) => void;
}

const LocationPickerMap = forwardRef<LocationPickerMapHandle, LocationPickerMapProps>(
  ({ initialLat, initialLng, bounds, onLocationSelected }, ref) => {
    const webviewRef = useRef<WebView>(null);
    // The HTML embeds the starting position/bounds at load time only — later
    // pin moves go through setMarker via injectJavaScript, not a reload.
    const htmlRef = useRef(buildMapHtml(initialLat, initialLng, bounds));

    useImperativeHandle(ref, () => ({
      setMarker: (lat: number, lng: number) => {
        webviewRef.current?.injectJavaScript(`window.setMarker(${lat}, ${lng}); true;`);
      },
    }));

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "LOCATION_SELECTED") {
          onLocationSelected(data.lat, data.lng);
        }
      } catch {
        // Ignore malformed messages — the map still works, just no callback.
      }
    };

    return (
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: htmlRef.current }}
        onMessage={handleMessage}
        style={{ flex: 1 }}
        // The map page has no overflow of its own (Leaflet fills the exact
        // viewport) — disabling the WebView's own scroll semantics keeps the
        // outer ScrollView from ever contesting a drag-to-pan gesture here.
        scrollEnabled={false}
        overScrollMode="never"
        nestedScrollEnabled={false}
      />
    );
  },
);

LocationPickerMap.displayName = "LocationPickerMap";

export default LocationPickerMap;
