// Combo bundle pricing — shared by order-service (checkout, authoritative)
// and product-service (cart preview) so a combo's discount always resolves
// to byte-identical per-line prices in both places. Each service still does
// its own DB lookups/ownership checks; only the distribution math lives here.

export interface ComboGroupLine {
  /** Catalog per-unit price, used as the weight for proportional distribution. */
  catalogUnitPrice: number;
  quantity: number;
}

/**
 * Distributes a combo's bundle price across its member lines, proportional
 * to each line's own catalog value, so `sum(unitPrice * quantity)` lands
 * exactly on `comboPrice` — the last line absorbs any rounding remainder
 * rather than letting it drift the total.
 *
 * Returns one resolved per-unit price per input line, same order as `lines`.
 */
export function distributeComboPrice(comboPrice: number, lines: ComboGroupLine[]): number[] {
  if (lines.length === 0) return [];

  const groupRawTotal = lines.reduce((sum, l) => sum + l.catalogUnitPrice * l.quantity, 0);

  const resolved: number[] = [];
  let allocated = 0;
  lines.forEach((line, idx) => {
    if (idx === lines.length - 1) {
      resolved.push((comboPrice - allocated) / line.quantity);
      return;
    }
    const share =
      groupRawTotal > 0
        ? (line.catalogUnitPrice * line.quantity) / groupRawTotal
        : 1 / lines.length;
    const linePrice = comboPrice * share;
    allocated += linePrice;
    resolved.push(linePrice / line.quantity);
  });

  return resolved;
}

export interface ComboDefinitionItem {
  productId: string;
  quantity: number;
  cuttingType?: string;
  pieceSize?: string;
}

export interface SubmittedComboItem {
  productId: string;
  quantity: number;
  cuttingType?: string;
  pieceSize?: string;
}

/**
 * A combo's submitted items must match its definition exactly — same
 * products, quantities, and any seller-fixed variant — before its members
 * are repriced to the bundle price. Otherwise a client could swap in a
 * cheaper product/variant and still get the combo discount.
 */
export function comboItemsMatchDefinition(
  submitted: SubmittedComboItem[],
  definition: ComboDefinitionItem[],
): boolean {
  if (submitted.length !== definition.length) return false;
  const remaining = [...definition];
  for (const item of submitted) {
    const matchIdx = remaining.findIndex(
      (ci) =>
        ci.productId === item.productId &&
        ci.quantity === item.quantity &&
        (!ci.cuttingType || ci.cuttingType === item.cuttingType) &&
        (!ci.pieceSize || ci.pieceSize === item.pieceSize),
    );
    if (matchIdx === -1) return false;
    remaining.splice(matchIdx, 1);
  }
  return true;
}
