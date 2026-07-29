import type { PaymentProvider } from "./payment.interface.js";
import { RazorpayProvider } from "./providers/razorpay.provider.js";

// Keyed by PaymentProvider.name, which is also what Order.paymentMethod stores.
// Adding a gateway = implement PaymentProvider in providers/ and register it here.
const providers: Record<string, PaymentProvider> = {
  RAZORPAY: new RazorpayProvider(),
};

export function getPaymentProvider(name: string = "RAZORPAY"): PaymentProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`No payment provider registered for "${name}"`);
  }
  return provider;
}
