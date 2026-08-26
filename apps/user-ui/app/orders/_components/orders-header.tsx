import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// The page chrome renders immediately — it needs no data, so it shouldn't wait
// behind a skeleton. Shared by the page and its loading state so the title
// doesn't shift when the orders arrive.
export function OrdersHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Link
        href="/"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">My Orders</h1>
        <p className="text-sm text-muted-foreground">Manage your orders and track status</p>
      </div>
    </div>
  );
}
