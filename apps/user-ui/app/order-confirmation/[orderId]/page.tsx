"use client";

import { use } from "react";

import { OrderConfirmationDetail } from "./_components/order-confirmation-detail";
import { useUserSession } from "@/hooks/useUserSession";
import { OrderConfirmationSkeleton } from "./_components/order-confirmation-skeleton";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { isLoading } = useUserSession();

  if (isLoading) {
    return <OrderConfirmationSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <OrderConfirmationDetail initialOrder={null} orderId={orderId} />
      </main>
    </div>
  );
}
