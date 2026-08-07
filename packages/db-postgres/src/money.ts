import { Prisma } from "../prisma/generated-client/index.js";

/**
 * Money crosses this codebase in two forms, deliberately.
 *
 * In Postgres it is `numeric(12,2)` and reaches JS as a `Prisma.Decimal`, so
 * storage and SQL aggregation are exact — a float `totalAmount` cannot
 * represent 20.35 and drifts against Razorpay, which settles in integer paise.
 *
 * Everywhere else — the cart formula in @repo/pricing, the JSON sent to
 * user-ui and mobile, the analytics rollups — it stays a plain `number`.
 * Pushing Decimal past this boundary would drag decimal.js into the React
 * Native bundle and turn every `+` in the reporting code into a method call,
 * for no accuracy gain: those figures are derived and displayed, never settled.
 *
 * So: Decimal at rest and in SQL, number at the edges, and these two functions
 * are the only sanctioned crossing points.
 */

/** Postgres Decimal -> number, for JSON responses and analytics. */
export function toMoney(value: Prisma.Decimal | null | undefined): number {
  return value == null ? 0 : value.toNumber();
}

/** Same, but preserves an absent value instead of coercing it to 0. */
export function toMoneyOrNull(
  value: Prisma.Decimal | null | undefined,
): number | null {
  return value == null ? null : value.toNumber();
}

/**
 * number -> Decimal for persistence. Goes through a fixed-2dp string rather
 * than `new Decimal(number)` so an already-drifted float (449.00000000000006,
 * the kind JS addition produces) is snapped to the value the customer was
 * actually shown instead of being stored to full binary precision.
 */
export function toDecimal(value: number): Prisma.Decimal {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot store non-finite value as money: ${value}`);
  }
  return new Prisma.Decimal(value.toFixed(2));
}
