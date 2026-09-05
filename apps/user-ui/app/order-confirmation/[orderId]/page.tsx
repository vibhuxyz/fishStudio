"use client";

import { use } from "react";

import { OrderConfirmationDetail } from "./_components/order-confirmation-detail";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  // The order fetch no longer waits on the session — blocking the whole page
  // on it meant a slow session read looked like a failed checkout.
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <OrderConfirmationDetail initialOrder={null} orderId={orderId} />
      </main>
    </div>
  );
}
