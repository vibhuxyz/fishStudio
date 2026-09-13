"use client";

import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { renderInvoiceHtml, type Invoice } from "@repo/shared/invoice-html";

/**
 * Fetches the GST tax invoice for an order and saves it as a real PDF file.
 *
 * Rendered off-screen and converted client-side with html2pdf.js, so this
 * downloads straight to disk — no popup window, no browser print dialog.
 *
 * Shared between the order-confirmation page and the My Orders detail page —
 * download must work the same way from either place, for an order in any
 * non-cancelled status.
 */
export function useDownloadInvoice() {
  const [isPreparingInvoice, setIsPreparingInvoice] = useState(false);

  const downloadInvoice = async (orderId: string) => {
    if (isPreparingInvoice) return;
    setIsPreparingInvoice(true);

    let container: HTMLDivElement | null = null;

    try {
      const { data } = await axiosInstance.get(`/order/api/invoice/${orderId}`);
      if (!data?.success || !data.invoice) throw new Error("No invoice returned");

      const invoice = data.invoice as Invoice;

      // html2pdf renders from a live DOM node, not a raw string. It clones this
      // node into its own off-screen overlay to keep it invisible — deliberately
      // NOT given `position: fixed`/absolute here, because that inline style
      // gets cloned along with it and escapes html2pdf's overlay (fixed is
      // relative to the viewport, not the ancestor it's nested under), landing
      // the clone outside the region html2canvas actually captures and coming
      // out as a blank page. A plain, normally-flowed node is what html2pdf
      // itself hides — see its own toContainer overlay implementation.
      container = document.createElement("div");
      container.innerHTML = renderInvoiceHtml(invoice);
      document.body.appendChild(container);

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `Invoice-${invoice.invoiceNumber.replace(/\//g, "-")}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      // The server refuses when the store has no GSTIN configured yet, and says
      // so — that reason is far more actionable than a generic failure.
      toast.error(message || "Couldn't prepare the invoice. Please try again.");
    } finally {
      container?.remove();
      setIsPreparingInvoice(false);
    }
  };

  return { downloadInvoice, isPreparingInvoice };
}
