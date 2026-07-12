export const metadata = { title: "Terms & Conditions · Fish Studio" };

const SECTIONS = [
  {
    h: "Acceptance of terms",
    p: "By using Fish Studio you agree to these terms. If you do not agree, please do not use the service.",
  },
  {
    h: "Orders & pricing",
    p: "All orders are subject to product availability and acceptance. Prices, weights and offers may change, and the price shown at checkout applies to your order.",
  },
  {
    h: "Delivery",
    p: "Delivery times are estimates and depend on your location and store hours. We are not liable for delays caused by events beyond our reasonable control.",
  },
  {
    h: "Cancellations & refunds",
    p: "Orders may be cancelled before packing. Refunds and replacements are handled per our policy — contact the Help Centre within 24 hours of delivery for any issues.",
  },
  {
    h: "Accounts",
    p: "You are responsible for activity under your account and for keeping your login secure. We may suspend accounts involved in fraud or misuse.",
  },
  {
    h: "Contact",
    p: "For questions about these terms, email support@fishstudio.in.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-1 text-xl font-bold text-foreground md:text-2xl">
        Terms &amp; Conditions
      </h1>
      <p className="mb-6 text-xs text-muted-foreground">Last updated: June 2026</p>

      <div className="space-y-5">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-base font-semibold text-foreground">{s.h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {s.p}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
