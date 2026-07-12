export const metadata = { title: "Privacy Policy · Fish Studio" };

const SECTIONS = [
  {
    h: "Information we collect",
    p: "We collect details you provide — name, phone number, email and delivery addresses — along with order history and how you browse the app, so we can fulfil orders and improve your experience.",
  },
  {
    h: "How we use your information",
    p: "Your data is used to process orders, arrange delivery, personalise recommendations, prevent fraud, and send service updates. We do not sell your personal data.",
  },
  {
    h: "Sharing",
    p: "We share only what's necessary with delivery partners and payment providers to complete your order, and where required by law.",
  },
  {
    h: "Data retention",
    p: "We keep your account data while your account is active. Order records may be retained for legal and accounting purposes after account deletion.",
  },
  {
    h: "Your choices",
    p: "You can edit your profile, manage addresses, or delete your account at any time from My Account. Deleting your account removes your personal profile data from our systems.",
  },
  {
    h: "Contact",
    p: "Questions about privacy? Email us at privacy@fishstudio.in.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-1 text-xl font-bold text-foreground md:text-2xl">
        Privacy Policy
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
