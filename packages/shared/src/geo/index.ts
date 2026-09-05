/**
 * Distance between two coordinates, and the geofence rule built on it.
 *
 * Haversine rather than a projected/planar approximation: at the distances that
 * matter here (tens of metres to a few kilometres) the difference is
 * centimetres, but Haversine is the one that stays correct if it is ever used
 * for something larger, and it has no magic constants to get wrong.
 */

/** Mean Earth radius in metres. */
const EARTH_RADIUS_M = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Great-circle distance in metres, rounded to the nearest metre. */
export function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return Math.round(2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a)));
}

export function distanceInKm(from: Coordinates, to: Coordinates): number {
  // Two decimals — a delivery log does not need sub-10-metre precision, and
  // the column is Decimal(6,2).
  return Math.round(distanceInMeters(from, to) / 10) / 100;
}

/**
 * How close to the store a rider must be to check in.
 *
 * Phone GPS is routinely 10–30m out and worse between buildings, so this is
 * deliberately not tighter — a fence that rejects honest check-ins gets worked
 * around, and a worked-around control measures nothing.
 */
export const ATTENDANCE_GEOFENCE_METERS = 50;

export function isWithinGeofence(
  from: Coordinates,
  to: Coordinates,
  radiusMeters: number = ATTENDANCE_GEOFENCE_METERS,
): boolean {
  return distanceInMeters(from, to) <= radiusMeters;
}
