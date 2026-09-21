import { PolicyPage, type PolicySection } from "@/components/shared/policy-page";

export const metadata = { title: "Terms & Conditions · Fish Studio" };

const SECTIONS: PolicySection[] = [
  {
    h: "Acceptance of Terms",
    p: [
      "By using our website or placing an order, you agree to these Terms & Conditions and any other policies published on the website. If you do not agree with these terms, please do not use the website or place an order.",
    ],
  },
  {
    h: "Customer Information",
    p: [
      "Customers are responsible for providing accurate and complete information, including their name, contact details, delivery address, and other information required to fulfil an order.",
    ],
  },
  {
    h: "Orders",
    p: [
      "An order may be declined or cancelled where a product is unavailable, customer information is incorrect or incomplete, payment fails, fraudulent or unauthorised activity is suspected, delivery is unavailable in the requested area, a product or price has been listed incorrectly, or for other legitimate operational reasons.",
    ],
  },
  {
    h: "Product Information",
    p: [
      "Product descriptions and images are provided to help customers understand the products offered. Actual appearance may vary slightly because of preparation, cutting, packaging, photography, and natural variation in fresh products.",
      "Where products are sold by weight, reasonable variations may occur due to the nature of fresh products and preparation. The applicable pricing and weight information displayed during checkout will govern the order.",
    ],
  },
  {
    h: "Prices and Charges",
    p: [
      "Product prices and applicable charges will be displayed before the customer completes the order. Delivery charges, if applicable, will be shown during checkout. Prices may change from time to time; the price applicable at the time an order is placed will generally apply, subject to correction of obvious pricing or listing errors.",
    ],
  },
  {
    h: "Payments",
    p: [
      "We may accept online payment methods made available through our payment gateway, including supported UPI, debit card, credit card, net banking, and other payment methods. An online payment is considered successful when the payment service provider confirms the transaction and the order is successfully recorded or accepted by the business.",
      "If an amount is debited from a customer's account but the order is not confirmed, the customer should contact support with the relevant transaction details. We will verify the payment status and, where the order cannot be fulfilled, initiate the applicable refund.",
    ],
  },
  {
    h: "Delivery",
    p: [
      "Delivery is available only in the areas served by the business. Estimated delivery timelines and applicable delivery charges will be displayed or communicated to customers as applicable. Delivery times are estimates and may be affected by traffic, weather, operational issues, third-party delivery disruptions, government restrictions, or circumstances beyond our reasonable control.",
    ],
  },
  {
    h: "Customer Responsibilities on Delivery",
    p: [
      "Customers should provide accurate delivery information, remain available to receive the order, inspect the package where reasonably possible, and follow any storage or handling instructions provided with the product.",
    ],
  },
  {
    h: "Fresh and Perishable Products",
    p: [
      "Fresh and perishable products should be stored and handled in accordance with the instructions provided with the product. Customers are responsible for appropriate storage after delivery. Issues arising from improper storage or handling after delivery may not qualify for replacement or refund.",
    ],
  },
  {
    h: "Failed Delivery",
    p: [
      "If the customer is unavailable, the delivery team may attempt to contact the customer. A further delivery attempt may be made where operationally feasible. If a customer refuses delivery, any refund will be subject to the applicable cancellation and refund provisions.",
    ],
  },
  {
    h: "Complaints",
    p: [
      "Customers should raise complaints through the designated customer-support channels and provide the order number and relevant details so that the issue can be reviewed promptly.",
    ],
  },
  {
    h: "Limitation of Certain Claims",
    p: [
      "Nothing in these Terms & Conditions is intended to exclude or restrict any right or remedy that cannot lawfully be excluded or restricted under applicable law.",
    ],
  },
  {
    h: "Changes to These Terms",
    p: [
      "We may update these Terms & Conditions from time to time. The updated version will be published on the website and will apply from the effective date stated in the updated policy.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      lastUpdated="September 2026"
      sections={SECTIONS}
    />
  );
}
