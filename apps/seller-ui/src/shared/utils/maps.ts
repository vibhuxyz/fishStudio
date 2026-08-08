/**
 * The customer's exact map pin (when they set one) beats a text-address
 * search — a search can land on the wrong building on a street with several
 * similarly-named blocks, while a pin is unambiguous. The `dir` (directions)
 * endpoint, not `search`, is what reliably triggers "Open in Google Maps
 * app" on a rider's phone instead of just opening a browser map view.
 */
export function buildMapsUrl(order: {
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryAddress?: string | null;
}): string | null {
  if (order.deliveryLatitude != null && order.deliveryLongitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLatitude},${order.deliveryLongitude}`;
  }
  if (order.deliveryAddress) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`;
  }
  return null;
}
