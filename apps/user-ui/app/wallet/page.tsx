"use client";

import { Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-6 text-xl font-bold text-foreground md:text-2xl">
        Wallet
      </h1>

      {/* Balance card */}
      <div className="mb-6 rounded-2xl bg-primary p-6 text-white">
        <p className="text-sm text-white/80">Available balance</p>
        <p className="mt-1 text-3xl font-bold">₹0.00</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-[#F8F8FA] py-16 text-center">
        <Wallet className="h-10 w-10 text-primary" />
        <p className="text-base font-semibold text-foreground">Coming soon</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Pay faster with Fish Studio Wallet, earn cashback on orders and get
          instant refunds. We&apos;re putting the finishing touches on it.
        </p>
      </div>
    </div>
  );
}
