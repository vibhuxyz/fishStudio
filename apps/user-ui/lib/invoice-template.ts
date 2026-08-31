/**
 * Renders the GST tax invoice returned by GET /order/api/invoice/:orderId.
 *
 * Presentation only. Every figure here is already computed and rounded by
 * order-service — this file must never derive a total, a tax amount or a
 * discount of its own, because an invoice is a statutory document and the
 * browser is not the authority on what was charged.
 */

export type InvoiceLine = {
  slNo: number;
  description: string;
  descriptionDetail: string | null;
  hsnCode: string | null;
  unitPrice: number;
  unit: string;
  quantity: number;
  discount: number;
  netAmount: number;
  gstRatePercent: number;
  gstType: string;
  gstAmount: number;
  lineTotal: number;
};

export type Invoice = {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string | null;
  deliverySlot: string | null;
  paymentMode: string;
  seller: {
    legalName: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    gstin: string;
    fssaiLicenseNumber: string | null;
    jurisdiction: string | null;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  lines: InvoiceLine[];
  totals: {
    itemsTotal: number;
    deliveryCharge: number;
    packagingCharge: number;
    roundOff: number;
    grandTotal: number;
    totalDiscount: number;
  };
};

/** Everything interpolated below is order data that may contain `<` or `&`. */
const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: number) => n.toFixed(2);

/** A label/value row in the right-hand header block. */
const field = (label: string, value: unknown) =>
  value === null || value === undefined || value === ""
    ? ""
    : `<tr><td class="lbl">${esc(label)} :</td><td>${esc(value)}</td></tr>`;

export function renderInvoiceHtml(invoice: Invoice): string {
  const { seller, customer, lines, totals } = invoice;

  const rows = lines
    .map(
      (line) => `
      <tr>
        <td class="c">${line.slNo}</td>
        <td>
          ${esc(line.description)}
          ${line.descriptionDetail ? `<div class="sub">${esc(line.descriptionDetail)}</div>` : ""}
        </td>
        <td class="c">${esc(line.hsnCode ?? "—")}</td>
        <td class="r">${money(line.unitPrice)}</td>
        <td class="c">${esc(line.unit)}</td>
        <td class="c">${line.quantity}</td>
        <td class="r">${money(line.discount)}</td>
        <td class="r">${money(line.netAmount)}</td>
        <td class="c">${line.gstRatePercent}%</td>
        <td class="c">${esc(line.gstType)}</td>
        <td class="r">${money(line.gstAmount)}</td>
        <td class="r">${money(line.lineTotal)}</td>
      </tr>`,
    )
    .join("");

  // A zero round-off is still printed: the reference invoice shows "0.00", and
  // a totals block that silently drops a line is harder to reconcile.
  const totalsRows = [
    ["Total", totals.itemsTotal],
    ["Delivery Charges (Including GST)", totals.deliveryCharge],
    ["Platform Charge (Including GST)", totals.packagingCharge],
    ["Roundoff (Rs.)", totals.roundOff],
  ]
    .map(
      ([label, value]) =>
        `<tr><td class="r">${esc(label)}</td><td class="r">${money(value as number)}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>Invoice ${esc(invoice.invoiceNumber)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; font-size: 11px; margin: 0; }
  h1 { font-size: 17px; text-align: center; margin: 0 0 14px; letter-spacing: .5px; }
  .head { display: flex; gap: 24px; align-items: flex-start; }
  .head > div { flex: 1; }
  .seller { font-size: 11px; line-height: 1.7; }
  .seller .name { font-weight: bold; font-size: 12px; }
  table.meta td { padding: 1px 0; vertical-align: top; }
  table.meta td.lbl { white-space: nowrap; padding-right: 8px; width: 1%; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 16px; }
  table.items th, table.items td { border: 1px solid #000; padding: 4px 5px; vertical-align: top; }
  table.items th { font-size: 10px; text-align: center; font-weight: bold; }
  .sub { color: #444; font-size: 10px; }
  .c { text-align: center; }
  .r { text-align: right; }
  table.totals { margin-top: 10px; margin-left: auto; border-collapse: collapse; }
  table.totals td { padding: 3px 10px; }
  table.totals tr.grand td { border-top: 1px solid #000; font-weight: bold; font-size: 12px; }
  .foot { margin-top: 28px; display: flex; gap: 24px; align-items: flex-start; }
  .foot > div { flex: 1; }
  .sign { text-align: right; }
  .sign .space { height: 52px; }
  .jur { margin-top: 22px; padding-top: 6px; border-top: 1px solid #000;
         display: flex; justify-content: space-between; font-size: 10px; }
</style></head>
<body>
  <h1>TAX INVOICE</h1>

  <div class="head">
    <div class="seller">
      <div class="name">${esc(seller.legalName)}</div>
      ${seller.address ? `<div>Address : ${esc(seller.address)}</div>` : ""}
      ${seller.phone ? `<div>Phone : ${esc(seller.phone)}</div>` : ""}
      ${seller.email ? `<div>Email : ${esc(seller.email)}</div>` : ""}
      <div>GSTIN : ${esc(seller.gstin)}</div>
      ${seller.fssaiLicenseNumber ? `<div>FSSAI LIC NO : ${esc(seller.fssaiLicenseNumber)}</div>` : ""}
    </div>

    <div>
      <table class="meta">
        <tr>
          <td class="lbl">Invoice # :</td><td>${esc(invoice.invoiceNumber)}</td>
        </tr>
        <tr>
          <td class="lbl">Order # :</td><td>${esc(invoice.orderNumber)}</td>
        </tr>
        ${field("Invoice Date", invoice.invoiceDate)}
        ${field("Order Date", invoice.orderDate)}
        ${field("Customer Name", customer.name)}
        ${field("Phone Number", customer.phone)}
        ${field("Address", [customer.address, customer.city].filter(Boolean).join(", "))}
        ${field("Pincode", customer.pincode)}
        ${field("Delivery Slot", invoice.deliverySlot)}
        ${field("Payment Mode", invoice.paymentMode)}
        ${field("Delivery Date", invoice.deliveryDate)}
      </table>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Sl<br/>No.</th>
        <th>Description of Goods</th>
        <th>HSN<br/>Code</th>
        <th>Unit<br/>Price</th>
        <th>Unit</th>
        <th>Qty</th>
        <th>Discount</th>
        <th>Net<br/>Amount</th>
        <th>GST<br/>Rate</th>
        <th>GST<br/>Type</th>
        <th>GST<br/>Amount</th>
        <th>Amount<br/>(INR)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    ${totalsRows}
    <tr class="grand">
      <td class="r">Total Amount</td>
      <td class="r">${money(totals.grandTotal)}</td>
    </tr>
  </table>

  <div class="foot">
    <div>
      <strong>Declaration:</strong> We declare this Invoice shows the actual price of the
      goods described and that all particulars are true and correct.
    </div>
    <div class="sign">
      <div>For ${esc(seller.legalName)}</div>
      <div class="space"></div>
      <div>Authorized Signatory</div>
    </div>
  </div>

  <div class="jur">
    <span>SUBJECT TO ${esc((seller.jurisdiction ?? "").toUpperCase())} JURISDICTION</span>
    <span>This is Computer Generated Invoice</span>
  </div>
</body></html>`;
}
