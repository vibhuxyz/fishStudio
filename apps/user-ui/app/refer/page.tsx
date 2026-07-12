"use client";

import { Gift, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ReferEarnPage() {
  const code = "FISH50";

  const handleShare = async () => {
    const message = `Get fresh fish & meat delivered! Use my code ${code} on Fish Studio for ₹50 off your first order. https://fishstudio.in`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Fish Studio", text: message });
      } else {
        await navigator.clipboard.writeText(message);
        toast.success("Invite copied to clipboard");
      }
    } catch {
      // user cancelled share — ignore
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-6 text-xl font-bold text-foreground md:text-2xl">
        Refer &amp; Earn
      </h1>

      <div className="rounded-2xl bg-[#5A2C96] p-6 text-center text-white">
        <Gift className="mx-auto h-10 w-10" />
        <p className="mt-3 text-lg font-bold">Give ₹50, Get ₹50</p>
        <p className="mt-1 text-sm text-white/80">
          Invite friends to Fish Studio. They get ₹50 off their first order, and
          you earn ₹50 when they order.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="rounded-xl border border-dashed border-white/50 bg-white/10 px-5 py-2 text-lg font-bold tracking-widest">
            {code}
          </span>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background"
      >
        <Share2 className="h-4 w-4" />
        Share invite
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Referral rewards are credited once your friend&apos;s first order is
        delivered. Full program terms coming soon.
      </p>
    </div>
  );
}
