/**
 * Scheduled delivery slots: what a store offers, on which day, and whether a
 * given slot can still be booked.
 *
 * Lives here rather than in order-service because two callers must agree
 * exactly. product-service's validate-cart decides what the customer is shown,
 * and order-service re-decides it at checkout — if those two disagreed, a
 * customer could be offered a slot that placing the order then rejects.
 *
 * "instant" is not a slot in this sense. It is bounded by the store's delivery
 * window and by whether the store is open (see store-hours), not by a per-day
 * count, so it never appears here and is never reserved.
 */

/** India has one zone and no daylight saving, so a fixed offset is exact. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface DeliverySlotDefinition {
  /** Stable identifier, stored on the order. Never shown to a customer. */
  key: string;
  label: string;
  /** "HH:mm", store-local. */
  startTime: string;
  endTime: string;
  /**
   * How long before startTime the slot stops accepting orders. The kitchen
   * needs a head start, so a 09:00 slot with a 60-minute cutoff closes at
   * 08:00 — not at 09:00 when the rider should already be leaving.
   */
  cutoffMinutesBefore: number;
  /** Orders the store can fulfil in this slot on one day. */
  capacity: number;
}

/**
 * What a store falls back to when `deliverySlotConfig` has never been set.
 *
 * These reproduce the morning/evening pair that was hardcoded before slots were
 * configurable, so an existing store keeps trading unchanged. The capacity is a
 * placeholder a seller is expected to tune — it is deliberately generous rather
 * than restrictive, because a cap that is too low turns customers away silently
 * while one that is too high only reproduces today's behaviour.
 */
export const DEFAULT_DELIVERY_SLOTS: DeliverySlotDefinition[] = [
  { key: "morning", label: "Morning (9 AM – 12 PM)", startTime: "09:00", endTime: "12:00", cutoffMinutesBefore: 60, capacity: 50 },
  { key: "evening", label: "Evening (5 PM – 9 PM)", startTime: "17:00", endTime: "21:00", cutoffMinutesBefore: 60, capacity: 50 },
];

function isSlotDefinition(value: unknown): value is DeliverySlotDefinition {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" && v.key.length > 0 &&
    typeof v.label === "string" &&
    typeof v.startTime === "string" &&
    typeof v.endTime === "string" &&
    typeof v.cutoffMinutesBefore === "number" && Number.isFinite(v.cutoffMinutesBefore) &&
    typeof v.capacity === "number" && Number.isFinite(v.capacity) && v.capacity > 0
  );
}

/**
 * Read a store's configured slots, falling back to the defaults.
 *
 * The column is untyped Json, so a hand-edited or half-migrated document can
 * hold anything. A malformed entry is dropped rather than throwing: refusing to
 * serve any slot because one row is bad would take checkout down for a typo.
 */
export function parseDeliverySlotConfig(raw: unknown): DeliverySlotDefinition[] {
  if (!Array.isArray(raw)) return DEFAULT_DELIVERY_SLOTS;
  const valid = raw.filter(isSlotDefinition);
  return valid.length > 0 ? valid : DEFAULT_DELIVERY_SLOTS;
}

/** ddMMyyyy in IST — the same key Order.deliveryDate and the sequences use. */
export function deliveryDateKey(at: Date = new Date()): string {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}${mm}${ist.getUTCFullYear()}`;
}

/** Minutes since IST midnight for `at`. */
function istMinutesOfDay(at: Date): number {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export interface AvailableSlot extends DeliverySlotDefinition {
  /** ddMMyyyy, IST. */
  deliveryDate: string;
  /** Human label for the day, e.g. "Today" / "Tomorrow" / "07 Sep". */
  dateLabel: string;
  remaining: number;
  isFull: boolean;
  /** Past its cutoff for this date. */
  isPastCutoff: boolean;
  /** The only field the UI needs to decide whether the option is selectable. */
  isBookable: boolean;
}

function dateLabelFor(offsetDays: number, key: string): string {
  if (offsetDays === 0) return "Today";
  if (offsetDays === 1) return "Tomorrow";
  return `${key.slice(0, 2)}/${key.slice(2, 4)}`;
}

/**
 * Every slot on offer across the next `daysAhead` days, each marked bookable
 * or not and why.
 *
 * Full and past-cutoff slots are returned rather than filtered out, so the UI
 * can show "Evening — full" instead of a gap the customer cannot explain. The
 * caller decides whether to render or hide them.
 *
 * `bookedCounts` is keyed `${deliveryDate}:${slotKey}`; a missing entry means
 * nothing is booked yet, which is the common case.
 */
export function buildAvailableSlots(params: {
  slots: DeliverySlotDefinition[];
  bookedCounts: Map<string, number>;
  daysAhead?: number;
  now?: Date;
}): AvailableSlot[] {
  const { slots, bookedCounts, daysAhead = 3, now = new Date() } = params;
  const nowMinutes = istMinutesOfDay(now);
  const out: AvailableSlot[] = [];

  for (let offset = 0; offset < daysAhead; offset++) {
    const date = new Date(now.getTime() + offset * DAY_MS);
    const deliveryDate = deliveryDateKey(date);

    for (const slot of slots) {
      const booked = bookedCounts.get(`${deliveryDate}:${slot.key}`) ?? 0;
      const remaining = Math.max(0, slot.capacity - booked);
      // Only today's slots can be past their cutoff — a later day's cutoff is
      // still hours away by definition.
      const isPastCutoff =
        offset === 0 && nowMinutes >= toMinutes(slot.startTime) - slot.cutoffMinutesBefore;

      out.push({
        ...slot,
        deliveryDate,
        dateLabel: dateLabelFor(offset, deliveryDate),
        remaining,
        isFull: remaining === 0,
        isPastCutoff,
        isBookable: remaining > 0 && !isPastCutoff,
      });
    }
  }

  return out;
}

/**
 * Whether a slot the customer submitted is one the store would still offer.
 *
 * Capacity is deliberately *not* checked here — that is settled atomically by
 * the reservation statement at checkout, and re-checking it first would only
 * add a read-then-write window for two orders to slip through.
 */
export function isSlotStillOffered(params: {
  slots: DeliverySlotDefinition[];
  slotKey: string;
  deliveryDate: string;
  daysAhead?: number;
  now?: Date;
}): boolean {
  const { slots, slotKey, deliveryDate, daysAhead = 3, now = new Date() } = params;
  return buildAvailableSlots({ slots, bookedCounts: new Map(), daysAhead, now }).some(
    (s) => s.key === slotKey && s.deliveryDate === deliveryDate && !s.isPastCutoff,
  );
}

/**
 * A ddMMyyyy key as a person reads it: "Today", "Tomorrow", or "07 Sep 2026".
 *
 * Compared against today's key rather than by parsing into a Date and
 * subtracting — the key is already IST, and a Date built from it would be
 * interpreted in whatever zone the renderer happens to run in.
 */
export function formatDeliveryDateKey(
  key: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!key || !/^\d{8}$/.test(key)) return "";
  if (key === deliveryDateKey(now)) return "Today";
  if (key === deliveryDateKey(new Date(now.getTime() + DAY_MS))) return "Tomorrow";

  const day = key.slice(0, 2);
  const month = Number(key.slice(2, 4));
  const year = key.slice(4);
  const monthName = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][month - 1] ?? "";
  return `${day} ${monthName} ${year}`;
}
