// react-native-razorpay ships no types and has no @types package.
declare module "react-native-razorpay" {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description?: string;
    prefill?: {
      name?: string;
      contact?: string;
      email?: string;
      /** Rail the checkout sheet opens on. */
      method?: "upi" | "card" | "netbanking" | "wallet" | "emi";
      /** Razorpay bank code, e.g. "HDFC" — only read when method is netbanking. */
      bank?: string;
      /** Razorpay wallet code, e.g. "freecharge" — only read when method is wallet. */
      wallet?: string;
    };
    theme?: { color?: string };
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayErrorResponse {
    code: number;
    description: string;
  }

  const RazorpayCheckout: {
    open: (options: RazorpayOptions) => Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}
