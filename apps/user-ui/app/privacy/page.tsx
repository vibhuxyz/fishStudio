import { PolicyPage, type PolicySection } from "@/components/shared/policy-page";

export const metadata = { title: "Privacy Policy · Fish Studio" };

const SECTIONS: PolicySection[] = [
  {
    h: "Introduction",
    p: [
      "We respect your privacy and are committed to protecting the personal information you provide while using our website and services. This Privacy Policy explains what information we collect, how we use it, when it may be shared, and the measures we take to protect it.",
    ],
  },
  {
    h: "Information We Collect",
    p: [
      "When you browse our website, contact us, or place an order, we may collect information such as your name, mobile number, email address, billing and delivery address, order details, transaction or payment status, and information you voluntarily provide to our customer-support team.",
    ],
  },
  {
    h: "How We Use Your Information",
    p: [
      "We may use customer information to process and fulfil orders, arrange delivery, communicate order updates, provide customer support, process eligible cancellations, refunds and replacements, prevent fraudulent or unauthorised transactions, improve our products and services, and comply with applicable legal and regulatory requirements.",
    ],
  },
  {
    h: "Payments",
    p: [
      "Online payments may be processed through Razorpay or another authorised payment service provider. We do not intentionally collect or store sensitive payment credentials such as card CVV, UPI PIN, or banking passwords. Payment information is handled by the relevant payment service provider in accordance with its applicable terms and privacy practices.",
    ],
  },
  {
    h: "Cookies and Similar Technologies",
    p: [
      "Our website may use cookies and similar technologies that are necessary for website functionality, security, analytics, and improving the customer experience. We may also use third-party analytics or advertising technologies where applicable.",
    ],
  },
  {
    h: "Sharing of Information",
    p: [
      "We may share information with payment service providers, delivery and logistics partners, technology and service providers, analytics or advertising providers, and government or regulatory authorities where required or permitted by applicable law. Information shared with delivery personnel will be limited to what is reasonably necessary to complete the delivery.",
    ],
  },
  {
    h: "Data Security",
    p: [
      "We use reasonable administrative, technical, and organisational measures intended to protect customer information against unauthorised access, misuse, alteration, disclosure, or destruction. However, no method of electronic transmission or storage can be guaranteed to be completely secure.",
    ],
  },
  {
    h: "Data Retention",
    p: [
      "We may retain customer and transaction information for as long as reasonably necessary to fulfil the purposes for which it was collected, provide customer support, resolve disputes, maintain appropriate business and transaction records, and comply with applicable legal, accounting, or regulatory requirements.",
    ],
  },
  {
    h: "Your Choices",
    p: [
      "Where applicable, customers may request information about the personal data held by us, ask for correction of inaccurate information, or opt out of promotional communications. Requests should be made through our designated customer-support channels.",
    ],
  },
  {
    h: "Contact",
    p: [
      "For privacy-related questions or requests, please contact us using the customer-support details published on our website.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      lastUpdated="September 2026"
      sections={SECTIONS}
    />
  );
}
