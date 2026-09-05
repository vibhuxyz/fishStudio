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
/**
 * The Google Maps build of the picker.
 *
 * Exists because Google Maps Platform terms do not allow showing Google
 * geocoding/Places results on a non-Google map — so when the admin switches the
 * backend to Google, the tiles have to move with it. Both variants speak the
 * same postMessage contract (READY / LOCATION_SELECTED / window.setMarker), so
 * the React Native side below is identical either way.
 *
 * The key is loaded into a WebView, which is a browser context: restrict it by
 * HTTP referrer, and note the WebView is given an explicit `baseUrl` below so
 * that a referrer actually exists to match against.
 */
function buildGoogleMapHtml(
  lat: number,
  lng: number,
  apiKey: string,
  bounds?: MapBounds,
): string {
  const restriction = bounds
    ? `,
      restriction: {
        latLngBounds: { south: ${bounds.south}, west: ${bounds.west}, north: ${bounds.north}, east: ${bounds.east} },
        strictBounds: false,
      }`
    : "";
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    #pin {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      font-size: 34px; pointer-events: none; z-index: 5;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="pin">\u{1F4CD}</div>
  <script>
    function initMap() {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: ${lat}, lng: ${lng} },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false${restriction}
      });

      // "dragend", not "center_changed" — the latter also fires for the
      // programmatic panTo in setMarker, which is not a choice the shopper made.
      map.addListener("dragend", () => {
        const c = map.getCenter();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "LOCATION_SELECTED", lat: c.lat(), lng: c.lng(),
        }));
      });

      window.setMarker = function (lat, lng) {
        map.panTo({ lat: lat, lng: lng });
      };

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "READY" }));
    }
  </script>
  <script async src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap"></script>
</body>
</html>`;
}

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

/**
 * The origin the Google Maps WebView reports as its referrer. Must match one of
 * the referrer patterns on the Google Maps key, or the map refuses to load.
 */
const STOREFRONT_ORIGIN =
  process.env.EXPO_PUBLIC_STOREFRONT_ORIGIN || "https://fishstudio.in";

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
  /**
   * Which map to render. Must match the geocoding backend in force: Google
   * results may not be displayed on a non-Google map. Defaults to OSM, which
   * needs no key.
   */
  provider?: "osm" | "google";
}

const LocationPickerMap = forwardRef<LocationPickerMapHandle, LocationPickerMapProps>(
  ({ initialLat, initialLng, bounds, onLocationSelected, provider = "osm" }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const googleKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const useGoogle = provider === "google" && Boolean(googleKey);
    // The HTML embeds the starting position/bounds at load time only — later
    // pin moves go through setMarker via injectJavaScript, not a reload.
    const htmlRef = useRef(
      useGoogle
        ? buildGoogleMapHtml(initialLat, initialLng, googleKey as string, bounds)
        : buildMapHtml(initialLat, initialLng, bounds),
    );

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
        // baseUrl gives the page a real origin, which is what a Google Maps
        // key's HTTP-referrer restriction matches against — without it the
        // referrer is empty and the key would have to be left unrestricted.
        source={
          useGoogle
            ? { html: htmlRef.current, baseUrl: STOREFRONT_ORIGIN }
            : { html: htmlRef.current }
        }
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
