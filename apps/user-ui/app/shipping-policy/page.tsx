import { PolicyPage, type PolicySection } from "@/components/shared/policy-page";

export const metadata = { title: "Shipping & Delivery Policy · Fish Studio" };

const SECTIONS: PolicySection[] = [
  {
    h: "Delivery Coverage",
    p: [
      "We deliver only to the locations and serviceable areas listed or supported on our website at the time of ordering.",
    ],
  },
  {
    h: "Delivery Charges",
    p: [
      "Applicable delivery charges, if any, will be displayed to the customer before the order is confirmed.",
    ],
  },
  {
    h: "Estimated Delivery Time",
    p: [
      "The estimated delivery timeline communicated on the website or during checkout applies to the relevant order. While we make reasonable efforts to meet the estimated timeline, actual delivery may vary because of traffic, weather, order volume, operational conditions, technical issues, or circumstances outside our reasonable control.",
    ],
  },
  {
    h: "Delivery Availability",
    p: [
      "Customers should ensure that someone is available at the delivery address to receive the order and that the contact information provided at checkout is accurate and reachable.",
    ],
  },
  {
    h: "Failed Delivery",
    p: [
      "If the customer is unavailable, the delivery personnel may contact the customer to complete delivery. Where operationally feasible, another delivery attempt may be arranged. Additional arrangements or charges, where applicable, will depend on the circumstances and the business's operational policy.",
    ],
  },
  {
    h: "Incorrect Address or Contact Details",
    p: [
      "Customers are responsible for providing a complete and accurate delivery address and working contact number. Delays or failed delivery resulting from incorrect or incomplete information may be the customer's responsibility.",
    ],
  },
  {
    h: "Refusal of Delivery",
    p: [
      "If a customer refuses to accept an order, the order may be treated as a failed or refused delivery. A refund will not be automatic and will depend on the circumstances, including whether the order had already been prepared or dispatched.",
    ],
  },
  {
    h: "Fresh Product Storage",
    p: [
      "Fresh and perishable products should be refrigerated or frozen promptly after delivery, as appropriate for the product, and handled according to the storage instructions provided. The business is not responsible for deterioration caused by improper storage or handling after delivery.",
    ],
  },
  {
    h: "Delivery Delays Outside Our Control",
    p: [
      "We may experience delivery delays due to circumstances beyond our reasonable control, including severe weather, traffic, natural events, government restrictions, technical failures, or disruptions affecting third-party delivery services. We will make reasonable efforts to keep customers informed where a material delay occurs.",
    ],
  },
  {
    h: "Contact Us",
    p: [
      "For delivery-related questions or concerns, customers should contact us using the customer-support details published on our website and provide their order number and relevant delivery information.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping & Delivery Policy"
      lastUpdated="September 2026"
      sections={SECTIONS}
    />
  );
}
