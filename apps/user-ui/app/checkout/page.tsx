import { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout | Fish Studio",
  description: "Securely complete your order at Fish Studio.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <CheckoutClient />
    </main>
  );
}
