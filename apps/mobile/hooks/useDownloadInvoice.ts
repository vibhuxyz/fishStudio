import { useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { renderInvoiceHtml, type Invoice } from "@repo/shared/invoice-html";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";

/**
 * Fetches the GST tax invoice for an order, renders it with the same
 * template used on the web, and shares/saves it as a real PDF file — no
 * native PDF library needed, expo-print does the HTML → PDF conversion.
 *
 * Mirrors apps/user-ui/hooks/useDownloadInvoice.ts so the invoice looks
 * identical whichever surface it was generated from.
 */
export function useDownloadInvoice() {
  const [isPreparingInvoice, setIsPreparingInvoice] = useState(false);

  const downloadInvoice = async (orderId: string) => {
    if (isPreparingInvoice) return;
    setIsPreparingInvoice(true);

    try {
      const { data } = await axiosInstance.get(`/order/api/invoice/${orderId}`);
      if (!data?.success || !data.invoice) throw new Error("No invoice returned");

      const invoice = data.invoice as Invoice;
      const html = renderInvoiceHtml(invoice);

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: `Invoice ${invoice.invoiceNumber}`,
        });
      } else {
        toast.info("Invoice ready", { description: uri });
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      // The server refuses when the store has no GSTIN configured yet, and
      // says so — that reason is far more actionable than a generic failure.
      toast.error(message || "Couldn't prepare the invoice. Please try again.");
    } finally {
      setIsPreparingInvoice(false);
    }
  };

  return { downloadInvoice, isPreparingInvoice };
}
