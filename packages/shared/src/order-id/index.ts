/**
 * Legacy display id, derived from the cuid primary key.
 *
 * Still used for every order placed before sequential numbering existed, and
 * as the fallback for a store whose `locationCode` has not been set. Prefer
 * `displayOrderNumber` below, which shows the real number when there is one.
 */
export function formatOrderId(id: string): string {
  return `FS${id.replace(/[^0-9A-Za-z]/g, "").slice(-10).toUpperCase()}`;
}

/**
 * What to show a human for an order: the sequential number when the order has
 * one, otherwise the id-derived form above.
 *
 * Every screen that shows an order to a person should go through this rather
 * than reaching for either function directly, so old and new orders render
 * consistently and no screen has to know the difference.
 */
export function displayOrderNumber(order: {
  id: string;
  orderNumber?: string | null;
}): string {
  return order.orderNumber || formatOrderId(order.id);
}

/** IST. India has one zone and no daylight saving, so a fixed offset is exact. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * The ddMMyyyy date key an order belongs to, in IST.
 *
 * The sequence resets on the *store's* calendar day, not UTC's — keyed on UTC
 * the counter would roll over at 05:30 local, splitting a single trading day
 * across two sequences.
 */
export function orderDateKey(at: Date = new Date()): string {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = ist.getUTCFullYear();
  return `${dd}${mm}${yyyy}`;
}

/**
 * Normalise an admin-entered location code: "noi" / "Noida " -> "NOI".
 *
 * Letters only and at most four of them, so the middle segment of an order
 * number stays a fixed, readable shape. Returns null for anything that has no
 * letters at all, which the caller treats as "this store has no code".
 */
export function normalizeLocationCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 4);
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Assemble an order number from its parts: FS-NOI-30082026-001.
 *
 * The counter is zero-padded to three digits for readability but deliberately
 * not truncated — a location doing more than 999 orders in a day should get
 * FS-NOI-30082026-1000, not a number that collides with an earlier one.
 */
export function buildOrderNumber(params: {
  locationCode: string;
  dateKey: string;
  seq: number;
}): string {
  const { locationCode, dateKey, seq } = params;
  return `FS-${locationCode}-${dateKey}-${String(seq).padStart(3, "0")}`;
}
