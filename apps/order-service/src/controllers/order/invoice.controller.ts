import { Request, Response, NextFunction } from "express";
import { prismaPostgres, toMoney } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { logger } from "@repo/libs/logger";
import { displayOrderNumber, normalizeLocationCode } from "@repo/shared/order-id";
import {
  apportionDiscount,
  buildInvoiceNumber,
  computeLineTax,
  financialYear,
  invoiceDate,
  roundCurrency,
  type GstType,
} from "@repo/shared/invoice";

interface InvoiceRequest extends Request {
  role?: "user" | "seller" | "staff" | "admin";
  user?: { id?: string };
  seller?: { store?: { id?: string } };
}

/**
 * Every order here is an intra-state supply: a store only delivers to the
 * pincodes it services, and those are in its own state. Modelled as a constant
 * rather than hard-coded at the call site so an inter-state supply is a
 * one-line change if the business ever ships beyond its own state, instead of
 * silently printing the wrong tax heads.
 */
const SUPPLY_GST_TYPE: GstType = "CGST+SGST";

/**
 * Claim this order's invoice number, once.
 *
 * Allocated lazily — the first time an invoice is actually issued — rather
 * than at checkout, because GST invoice numbers must be consecutive within a
 * financial year and an order that is cancelled before it is ever invoiced
 * must not leave a hole in the series.
 *
 * Runs in a transaction with the counter increment, so a crash between
 * claiming a number and stamping the order cannot burn one.
 */
async function allocateInvoiceNumber(
  orderId: string,
  locationCode: string,
  issuedAt: Date,
): Promise<string> {
  const fy = financialYear(issuedAt);

  return prismaPostgres.$transaction(async (tx) => {
    // Re-read inside the transaction: two tabs hitting Download at once must
    // not each claim a number for the same order.
    const current = await tx.order.findUnique({
      where: { id: orderId },
      select: { invoiceNumber: true },
    });
    if (current?.invoiceNumber) return current.invoiceNumber;

    const rows = await tx.$queryRaw<Array<{ lastSeq: number }>>`
      INSERT INTO "InvoiceSequence" ("locationCode", "financialYear", "lastSeq", "updatedAt")
      VALUES (${locationCode}, ${fy}, 1, NOW())
      ON CONFLICT ("locationCode", "financialYear")
      DO UPDATE SET "lastSeq" = "InvoiceSequence"."lastSeq" + 1, "updatedAt" = NOW()
      RETURNING "lastSeq"
    `;
    const seq = rows[0]?.lastSeq;
    if (!seq) throw new Error("Invoice sequence returned no row");

    const invoiceNumber = buildInvoiceNumber({ locationCode, financialYear: fy, seq });
    await tx.order.update({
      where: { id: orderId },
      data: { invoiceNumber, invoicedAt: issuedAt },
    });
    return invoiceNumber;
  });
}

/**
 * The GST tax invoice for one order.
 *
 * Every figure is computed here rather than in the browser: an invoice is a
 * statutory document, and its tax breakdown must come from the stored order,
 * not from whatever a client happens to hold. The caller renders the returned
 * payload; it decides nothing.
 */
export const getOrderInvoice = async (
  req: InvoiceRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = typeof req.params.orderId === "string" ? req.params.orderId : "";
    if (!orderId) return next(new ValidationError("Order id is required"));

    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!order) return next(new NotFoundError("Order not found"));

    // Same role-based ownership rules as getOrderById — an invoice exposes the
    // customer's name, phone and full address, so it must not be reachable by
    // guessing an id.
    const role = req.role;
    if (role === "user") {
      if (order.userId !== req.user?.id) return next(new NotFoundError("Order not found"));
    } else if (role === "seller" || role === "staff") {
      const storeId = req.seller?.store?.id;
      if (!storeId || order.storeId !== storeId) return next(new NotFoundError("Order not found"));
    } else if (role !== "admin") {
      return next(new NotFoundError("Order not found"));
    }

    // No tax invoice for a supply that never happened. A cancelled or rejected
    // order has no taxable event to document.
    if (order.status === "CANCELLED" || order.status === "REJECTED") {
      return next(new ValidationError("No invoice for a cancelled order"));
    }

    const [store, products, buyer] = await Promise.all([
      prismaMongo.stores.findUnique({
        where: { id: order.storeId },
        select: {
          name: true, city: true, state: true, pincode: true, address: true,
          gst_rate: true, locationCode: true,
          legalName: true, gstin: true, fssaiLicenseNumber: true,
          registeredAddress: true, invoiceJurisdiction: true,
          supportPhone: true, supportEmail: true,
        },
      }),
      prismaMongo.products.findMany({
        where: { id: { in: order.orderItems.map((oi) => oi.productId) } },
        select: {
          id: true, title: true, hsnCode: true, gstRatePercent: true,
          catalogProduct: { select: { hsnCode: true, gstRatePercent: true } },
        },
      }),
      prismaMongo.users.findUnique({
        where: { id: order.userId },
        select: { name: true, phone_number: true, email: true },
      }),
    ]);

    if (!store) return next(new NotFoundError("Store not found"));

    // Refuse rather than print a document with a blank GSTIN — an invoice
    // missing the supplier's registration is worse than no invoice, because it
    // looks official while being invalid.
    const locationCode = normalizeLocationCode(store.locationCode);
    if (!store.legalName || !store.gstin || !locationCode) {
      logger.warn("[invoice] store is not configured for tax invoices", {
        storeId: order.storeId,
        hasLegalName: !!store.legalName,
        hasGstin: !!store.gstin,
        hasLocationCode: !!locationCode,
      });
      return next(
        new ValidationError(
          "This store is not set up for tax invoices yet. Please contact support.",
        ),
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    // Store-level rate is a fraction (0.05); a product override is a percentage.
    const storeRatePercent = roundCurrency((store.gst_rate ?? 0) * 100);

    // Line value before discount, used both to bill and to apportion.
    const grossValues = order.orderItems.map((oi) => roundCurrency(toMoney(oi.price) * oi.quantity));
    const discounts = apportionDiscount(grossValues, toMoney(order.discountAmount));

    const lines = order.orderItems.map((oi, index) => {
      const product = productMap.get(oi.productId);
      // HSN and rate describe the goods, so they come from the catalog root
      // where authored, falling back to the variant's own value.
      const hsnCode = product?.catalogProduct?.hsnCode ?? product?.hsnCode ?? null;
      const overrideRate =
        product?.catalogProduct?.gstRatePercent ?? product?.gstRatePercent ?? null;
      const gstRatePercent = typeof overrideRate === "number" ? overrideRate : storeRatePercent;

      const gross = grossValues[index]!;
      const discount = discounts[index]!;
      const tax = computeLineTax({
        netAmount: roundCurrency(gross - discount),
        gstRatePercent,
        gstType: SUPPLY_GST_TYPE,
      });

      const options = (oi.selectedOptions ?? {}) as Record<string, unknown>;
      const unitParts = [options.size, options.cuttingType, options.pieceSize]
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

      return {
        slNo: index + 1,
        description: product?.title ?? "Product",
        // Printed under the description, the way the reference invoice shows
        // "250 Gram (14 - 16 Pcs)" beneath the fish name.
        descriptionDetail: unitParts.join(", ") || null,
        hsnCode,
        unitPrice: toMoney(oi.price),
        unit: typeof options.size === "string" ? options.size : "1 Pcs",
        quantity: oi.quantity,
        discount,
        ...tax,
      };
    });

    const bill = (order.billDetails ?? {}) as Record<string, number | undefined>;
    const itemsNet = roundCurrency(lines.reduce((sum, l) => sum + l.netAmount, 0));
    const itemsGst = roundCurrency(lines.reduce((sum, l) => sum + l.gstAmount, 0));
    const itemsTotal = roundCurrency(itemsNet + itemsGst);
    const deliveryCharge = roundCurrency(
      (bill.deliveryCharge ?? 0) + (bill.slotExtraCharge ?? 0),
    );
    const packagingCharge = roundCurrency(bill.packagingCharge ?? 0);
    const grandTotal = toMoney(order.totalAmount);
    // Whatever the stored total does not account for. Printed rather than
    // silently absorbed, so the invoice always adds up on its face.
    const roundOff = roundCurrency(
      grandTotal - roundCurrency(itemsTotal + deliveryCharge + packagingCharge),
    );

    const issuedAt = order.invoicedAt ?? new Date();
    const invoiceNumber =
      order.invoiceNumber ?? (await allocateInvoiceNumber(order.id, locationCode, issuedAt));

    return res.status(200).json({
      success: true,
      invoice: {
        invoiceNumber,
        invoiceDate: invoiceDate(issuedAt),
        orderNumber: displayOrderNumber(order),
        orderDate: invoiceDate(order.createdAt),
        deliveryDate: order.deliveredAt ? invoiceDate(order.deliveredAt) : null,
        deliverySlot: order.deliverySlot,
        paymentMode: order.paymentMethod === "COD" ? "Cash On Delivery" : "Prepaid",

        seller: {
          legalName: store.legalName,
          address: store.registeredAddress ?? store.address,
          phone: store.supportPhone,
          email: store.supportEmail,
          gstin: store.gstin,
          fssaiLicenseNumber: store.fssaiLicenseNumber,
          jurisdiction: store.invoiceJurisdiction ?? store.city,
        },

        customer: {
          name: order.deliveryName ?? buyer?.name ?? "",
          phone: order.deliveryPhone ?? buyer?.phone_number ?? "",
          address: order.deliveryAddress ?? "",
          city: order.deliveryCity ?? "",
          pincode: order.deliveryPincode ?? "",
        },

        lines,

        totals: {
          itemsTotal,
          deliveryCharge,
          packagingCharge,
          roundOff,
          grandTotal,
          totalCgst: roundCurrency(lines.reduce((sum, l) => sum + l.cgst, 0)),
          totalSgst: roundCurrency(lines.reduce((sum, l) => sum + l.sgst, 0)),
          totalIgst: roundCurrency(lines.reduce((sum, l) => sum + l.igst, 0)),
          totalDiscount: roundCurrency(lines.reduce((sum, l) => sum + l.discount, 0)),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
