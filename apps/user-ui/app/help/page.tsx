import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const metadata = { title: "Help Centre · Fish Studio" };

const CONTACTS = [
  {
    label: "Chat on WhatsApp",
    sub: "Fastest response, 8am–10pm",
    href: "https://wa.me/919999999999",
    icon: MessageCircle,
  },
  {
    label: "Call us",
    sub: "+91 99999 99999",
    href: "tel:+919999999999",
    icon: Phone,
  },
  {
    label: "Email support",
    sub: "support@fishstudio.in",
    href: "mailto:support@fishstudio.in",
    icon: Mail,
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-2 text-xl font-bold text-foreground md:text-2xl">
        Help Centre
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        We&apos;re here to help with orders, delivery, refunds and anything else.
      </p>

      <div className="space-y-3">
        {CONTACTS.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-[#F8F8FA] p-4">
        <p className="text-sm font-semibold text-foreground">Common topics</p>
        <ul className="mt-2 space-y-1.5 text-sm text-primary">
          <li><Link href="/orders" className="hover:underline">Track or manage an order</Link></li>
          <li><Link href="/faqs" className="hover:underline">Read frequently asked questions</Link></li>
          <li><Link href="/addresses" className="hover:underline">Update delivery addresses</Link></li>
        </ul>
      </div>
    </div>
  );
}
