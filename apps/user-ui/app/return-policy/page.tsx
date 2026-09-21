import { PolicyPage, type PolicySection } from "@/components/shared/policy-page";

export const metadata = {
  title: "Return, Replacement, Refund & Cancellation Policy · Fish Studio",
};

const SECTIONS: PolicySection[] = [
  {
    h: "Our Commitment",
    p: [
      "We want you to receive the products you ordered in good condition and as described. Because our products may be fresh and perishable, returns and replacements are subject to the conditions below.",
    ],
  },
  {
    h: "Return / Replacement Window",
    p: ["Any eligible issue must be reported to us within **48 hours of delivery**."],
  },
  {
    h: "Product Condition",
    p: [
      "The product must be **unused and unconsumed** to qualify for a return or replacement. Customers should retain the product and its original packaging, where applicable, until the issue has been reviewed and the collection process is completed.",
      "Products that have been consumed or partially consumed are generally not eligible for return or replacement solely because the customer is dissatisfied with the product.",
    ],
  },
  {
    h: "Eligible Reasons for Replacement",
    p: [
      "A replacement may be considered where the customer receives an incorrect product, a missing item, damaged packaging or product, or a genuine quality issue attributable to the business. We may request photographs or videos of the product, packaging, or reported issue to assess the complaint.",
    ],
  },
  {
    h: "Product Collection",
    p: [
      "Where a replacement is approved, the original product must be handed over to the delivery personnel during the collection/return process. The replacement will be processed after the original product has been successfully handed over, subject to product availability and operational feasibility.",
      "If the original product cannot be returned or collected, the replacement or refund may not be processed unless the business approves an exception based on the circumstances.",
    ],
  },
  {
    h: "Replacement Charges",
    p: [
      "For an approved issue attributable to the business, the replacement will generally be provided without an additional replacement/product charge.",
    ],
  },
  {
    h: "Product Unavailability",
    p: [
      "If the same product is unavailable, we may offer an alternative product of comparable value or provide an applicable refund, depending on the circumstances.",
    ],
  },
  {
    h: "Refunds",
    p: [
      "A refund may be provided where replacement is not possible, the relevant product is unavailable, an eligible order cancellation has been accepted, or the business determines that a refund is appropriate.",
      "Refunds will generally be issued to the original payment method where technically possible. Once a refund is initiated, the time required for the amount to reflect in the customer's account may depend on the payment gateway, bank, card issuer, or other financial institution.",
    ],
  },
  {
    h: "Order Cancellation",
    p: [
      "Customers may request cancellation before the order has been dispatched or handed over to the delivery personnel. Once an order has been prepared, dispatched, or handed over for delivery, cancellation may no longer be possible.",
      "Where an eligible cancellation is accepted after payment has been made, the applicable refund will be initiated in accordance with this policy.",
    ],
  },
  {
    h: "How to Request a Return, Replacement or Refund",
    p: [
      "Customers should contact customer support as soon as possible and provide the order number, details of the issue, and any photographs or other information requested by our team. Requests received after the applicable 48-hour window may not be eligible.",
    ],
  },
];

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="Return, Replacement, Refund & Cancellation Policy"
      lastUpdated="September 2026"
      sections={SECTIONS}
    />
  );
}
