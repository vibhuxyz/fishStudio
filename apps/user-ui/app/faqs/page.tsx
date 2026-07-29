export const metadata = { title: "FAQs · Fish Studio" };

const FAQS = [
  {
    q: "How fresh is the seafood?",
    a: "Everything is sourced daily and cut after you order. Fish and meat are kept temperature-controlled from our facility to your door.",
  },
  {
    q: "What are the delivery timings?",
    a: "Delivery windows depend on your location and are shown at checkout. Many areas qualify for instant delivery during store hours.",
  },
  {
    q: "How is my order packed?",
    a: "Orders are vacuum-packed where applicable and delivered chilled in insulated packaging to preserve freshness.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "You can change or cancel before the order is packed. Open the order from Order History or contact our Help Centre.",
  },
  {
    q: "What is your refund policy?",
    a: "If anything isn't right with your order, reach out within 24 hours and we'll arrange a refund or replacement.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "We accept UPI, cards, and cash on delivery where available. Wallet payments are coming soon.",
  },
];

export default function FaqsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-6 text-xl font-bold text-foreground md:text-2xl">
        Frequently Asked Questions
      </h1>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card p-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground">
              {item.q}
              <span className="ml-2 text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
