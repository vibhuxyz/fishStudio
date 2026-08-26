"use client";

// Shared by the Google map view and the Google geocoding provider — both
// need the JS SDK loaded (with the `places` library) before touching
// `window.google.maps.*`, and only one <script> tag should ever be injected
// no matter how many callers ask for it around the same time.
let loadPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(apiKey: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!apiKey) return Promise.resolve(false);
  if ((window as any).google?.maps?.places) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      // Don't cache a permanent failure — a transient network blip shouldn't
      // wedge every later caller into an immediate false forever.
      loadPromise = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
