export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface WhatsAppOrderContext {
  orderId: string;
  orderDate: string;
  status: string;
  storeName: string;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  items: WhatsAppOrderItem[];
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  tax?: number;
  totalAmount: number;
  /** Free-text note appended under "Customer Message" — defaults if omitted. */
  customerMessage?: string;
}

// The sectioned, emoji-headed layout every store gets by default. A seller
// can override this per-store (Store Support Configuration) with their own
// text using the same {{PLACEHOLDER}} / {{#ORDER_ITEMS}}...{{/ORDER_ITEMS}}
// syntax — see fillWhatsAppTemplate below.
const DEFAULT_TEMPLATE = `Hello,

I need help regarding my order.

📦 Order Details
------------------------------
Order ID: {{ORDER_ID}}
Order Date: {{ORDER_DATE}}
Order Status: {{ORDER_STATUS}}

🏪 Store
------------------------------
Store: {{STORE_NAME}}

👤 Customer
------------------------------
Name: {{CUSTOMER_NAME}}
Phone: {{CUSTOMER_PHONE}}

📍 Delivery Address
------------------------------
{{DELIVERY_ADDRESS}}

🛒 Ordered Items
------------------------------
{{#ORDER_ITEMS}}
• {{PRODUCT_NAME}}
  Qty: {{QUANTITY}}
  Price: ₹{{UNIT_PRICE}}
  Total: ₹{{TOTAL_PRICE}}

{{/ORDER_ITEMS}}
💰 Payment Summary
------------------------------
Subtotal: ₹{{SUBTOTAL}}
Delivery Fee: ₹{{DELIVERY_FEE}}
Discount: ₹{{DISCOUNT}}
Tax: ₹{{TAX}}
Grand Total: ₹{{ORDER_AMOUNT}}

📝 Customer Message
------------------------------
{{CUSTOMER_MESSAGE}}

Thank you.`;

const ORDER_ITEMS_SECTION = /\{\{#ORDER_ITEMS\}\}([\s\S]*?)\{\{\/ORDER_ITEMS\}\}/;

const formatMoney = (n: number) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

/**
 * Fills a store's WhatsApp support template (or the built-in default) with
 * this order's details. Kept a pure string function — no DOM/RN-specific
 * APIs — so it works identically from user-ui (web) and mobile (Expo).
 *
 * Supports one repeating section, {{#ORDER_ITEMS}}...{{/ORDER_ITEMS}}, which
 * is expanded once per item before the top-level placeholders are filled —
 * so {{PRODUCT_NAME}}/{{QUANTITY}}/{{UNIT_PRICE}}/{{TOTAL_PRICE}} only ever
 * resolve inside that block.
 */
export function fillWhatsAppTemplate(
  template: string | null | undefined,
  ctx: WhatsAppOrderContext,
): string {
  const base = template?.trim() || DEFAULT_TEMPLATE;

  const withItems = base.replace(ORDER_ITEMS_SECTION, (_match, itemBlock: string) =>
    ctx.items
      .map((item) =>
        itemBlock
          .replaceAll("{{PRODUCT_NAME}}", item.name)
          .replaceAll("{{QUANTITY}}", String(item.quantity))
          .replaceAll("{{UNIT_PRICE}}", formatMoney(item.unitPrice))
          .replaceAll("{{TOTAL_PRICE}}", formatMoney(item.unitPrice * item.quantity)),
      )
      .join(""),
  );

  const vars: Record<string, string> = {
    ORDER_ID: ctx.orderId,
    ORDER_DATE: ctx.orderDate,
    ORDER_STATUS: ctx.status,
    STORE_NAME: ctx.storeName,
    CUSTOMER_NAME: ctx.customerName || "—",
    CUSTOMER_PHONE: ctx.customerPhone || "—",
    DELIVERY_ADDRESS: ctx.deliveryAddress || "—",
    SUBTOTAL: formatMoney(ctx.subtotal),
    DELIVERY_FEE: formatMoney(ctx.deliveryFee ?? 0),
    DISCOUNT: formatMoney(ctx.discount ?? 0),
    TAX: formatMoney(ctx.tax ?? 0),
    ORDER_AMOUNT: formatMoney(ctx.totalAmount),
    CUSTOMER_MESSAGE: ctx.customerMessage || "Please help me with this order.",
  };

  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, value),
    withItems,
  );
}

/**
 * Builds a wa.me deep link with a prefilled message. If WhatsApp isn't
 * installed, opening this URL falls back to WhatsApp Web automatically —
 * that's inherent to the wa.me scheme, no extra handling needed here.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string,
  message: string,
  whatsappLinkOverride?: string | null,
): string {
  if (whatsappLinkOverride?.trim()) return whatsappLinkOverride.trim();
  const digitsOnly = whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}
