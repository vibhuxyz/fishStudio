import { Suspense } from "react";
import { notFound } from "next/navigation";

import { OrderConfirmationDetail } from "./_components/order-confirmation-detail";
import { OrderConfirmationSkeleton } from "./_components/order-confirmation-skeleton";
import { fetchServerOrderById } from "@/lib/orders-api";

async function OrderConfirmationStream({ orderId }: { orderId: string }) {
  const order = await fetchServerOrderById(orderId);
  if (!order) notFound();

  return <OrderConfirmationDetail initialOrder={order} orderId={orderId} />;
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Suspense fallback={<OrderConfirmationSkeleton />}>
          <OrderConfirmationStream orderId={orderId} />
        </Suspense>
      </main>
    </div>
  );
}
