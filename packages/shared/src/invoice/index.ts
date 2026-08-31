/**
 * GST invoice identity and tax helpers.
 *
 * Kept apart from order-id: an order number and an invoice number are
 * different things with different rules. An order number is an operational
 * handle that may be issued for an order later cancelled; an invoice number is
 * a statutory record that must be consecutive within a financial year.
 */

/** IST. India has one zone and no daylight saving, so a fixed offset is exact. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const toIst = (at: Date) => new Date(at.getTime() + IST_OFFSET_MS);

/**
 * The Indian financial year a date falls in, as "2026-27".
 *
 * April to March, evaluated in IST — an invoice raised at 02:00 IST on 1 April
 * belongs to the new year, and judging that in UTC would put it in the old one.
 */
export function financialYear(at: Date = new Date()): string {
  const ist = toIst(at);
  const year = ist.getUTCFullYear();
  // getUTCMonth is 0-based, so 3 is April.
  const startYear = ist.getUTCMonth() >= 3 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

/**
 * Assemble an invoice number: FS/NOI/2026-27/00042.
 *
 * Five digits so the series stays readable and sortable at realistic volumes,
 * but never truncated — a store issuing more than 99,999 invoices in a year
 * gets a six-digit number rather than one that collides with an earlier month.
 */
export function buildInvoiceNumber(params: {
  locationCode: string;
  financialYear: string;
  seq: number;
}): string {
  const { locationCode, financialYear: fy, seq } = params;
  return `FS/${locationCode}/${fy}/${String(seq).padStart(5, "0")}`;
}

/** dd-MM-yyyy in IST — the format the invoice prints dates in. */
export function invoiceDate(at: Date): string {
  const ist = toIst(at);
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${ist.getUTCFullYear()}`;
}

/**
 * How a line's GST is split.
 *
 * Intra-state supply is CGST+SGST (half each); inter-state is IGST. Every
 * order here is intra-state by construction — a store only delivers to the
 * pincodes it services, which are in its own state — but the distinction is
 * modelled rather than assumed away, so an inter-state supply cannot silently
 * print the wrong tax heads if the business ever ships further.
 */
export type GstType = "CGST+SGST" | "IGST";

export type InvoiceLineTax = {
  /** Taxable value after any apportioned discount. */
  netAmount: number;
  gstRatePercent: number;
  gstType: GstType;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  /** netAmount + gstAmount. */
  lineTotal: number;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeLineTax(params: {
  netAmount: number;
  gstRatePercent: number;
  gstType: GstType;
}): InvoiceLineTax {
  const { netAmount, gstRatePercent, gstType } = params;
  const gstAmount = round2((netAmount * gstRatePercent) / 100);
  // Halved from the rounded total, not rounded independently, so CGST + SGST
  // always equals the GST shown on the line.
  const half = round2(gstAmount / 2);
  return {
    netAmount: round2(netAmount),
    gstRatePercent,
    gstType,
    gstAmount,
    cgst: gstType === "CGST+SGST" ? half : 0,
    sgst: gstType === "CGST+SGST" ? round2(gstAmount - half) : 0,
    igst: gstType === "IGST" ? gstAmount : 0,
    lineTotal: round2(netAmount + gstAmount),
  };
}

/**
 * Spread an order-level discount across lines in proportion to their value.
 *
 * GST requires a discount to reduce the taxable value of the supply it applies
 * to, so an order-level coupon has to be attributed to the lines rather than
 * subtracted at the bottom. The last line absorbs any rounding remainder, so
 * the apportioned parts always sum to exactly the discount given.
 */
export function apportionDiscount(lineValues: number[], discount: number): number[] {
  const total = lineValues.reduce((sum, v) => sum + v, 0);
  if (discount <= 0 || total <= 0) return lineValues.map(() => 0);

  const shares = lineValues.map((v) => round2((v / total) * discount));
  const drift = round2(discount - shares.reduce((sum, v) => sum + v, 0));
  if (drift !== 0 && shares.length > 0) {
    shares[shares.length - 1] = round2(shares[shares.length - 1]! + drift);
  }
  return shares;
}

export { round2 as roundCurrency };
