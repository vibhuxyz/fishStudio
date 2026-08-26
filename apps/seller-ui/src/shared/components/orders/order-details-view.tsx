"use client";

import React from "react";

import RefundPanel from "./refund-panel";
import { PaymentBadge } from "./payment-badge";
import PaymentRecheck from "./payment-recheck";

// The read-only half of a seller order: everything a seller looks at, none of
// what they act on. Lives here rather than inside order/[id] because the
// dashboard's detail drawer renders exactly the same thing — keeping one copy
// is what stops the drawer and the full page from disagreeing about an order.
// Status changes, rider assignment and cancellation stay on the full page,
// where a single owner of that logic keeps refunds and stock restore honest.

export const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING: "text-amber-400",
  ACCEPTED: "text-blue-400",
  PREPARING: "text-cyan-400",
  READY_FOR_PICKUP: "text-teal-400",
  ASSIGNED_TO_RIDER: "text-fuchsia-400",
  SHIPPED: "text-indigo-400",
  DELIVERED: "text-green-400",
  REJECTED: "text-red-400",
  CANCELLED: "text-red-400",
};

interface OrderPhoto {
  url: string;
  publicId: string;
  uploadedAt: string;
}

export const formatCurrency = (value: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const Section = ({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
    <header className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h2>
      {right}
    </header>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 py-1 text-sm">
    <span className="shrink-0 text-gray-500">{label}</span>
    <span className="min-w-0 text-right text-gray-200">{children}</span>
  </div>
);

interface OrderDetailsViewProps {
  order: any;
  /** Called after a manual refund or a payment recheck, so the caller can refetch. */
  onRefunded?: () => void;
}

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, onRefunded }) => {
  const billDetails = order.billDetails as
    | { itemTotal?: number; deliveryCharge?: number; discount?: number; totalAmount?: number }
    | null
    | undefined;
  const itemTotal =
    billDetails?.itemTotal ?? order.total - (order.deliveryCharge ?? 0) + (order.discountAmount ?? 0);

  return (
    <div className="space-y-4">
      <RefundPanel order={order} onRefunded={onRefunded} />

      {order.status === "REJECTED" && order.rejectionReason && (
        <p className="text-sm text-red-400">
          <span className="font-semibold">Rejection Reason:</span> {order.rejectionReason}
        </p>
      )}

      {order.status === "CANCELLED" && order.cancelledBy && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm">
          <h3 className="mb-2 font-semibold text-red-400">Cancellation Details</h3>
          <div className="space-y-1 text-gray-300">
            <p>
              <span className="font-semibold">Cancelled By:</span>{" "}
              {order.cancelledBy === "CUSTOMER"
                ? "Customer"
                : order.cancelledBy === "SYSTEM"
                  ? "System"
                  : order.cancelledBy === "STAFF"
                    ? "Staff"
                    : "Seller"}
            </p>
            {order.cancellationReason && (
              <p>
                <span className="font-semibold">Reason:</span> {order.cancellationReason}
              </p>
            )}
            {order.cancelledAt && (
              <p>
                <span className="font-semibold">Time:</span>{" "}
                {new Date(order.cancelledAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Order Summary">
          <Row label="Order status">
            <span className={`font-semibold ${ORDER_STATUS_BADGE[order.status] ?? "text-gray-300"}`}>
              {order.status}
            </span>
          </Row>
          <Row label="Payment status">
            <PaymentRecheck order={order} onRechecked={onRefunded} />
            <PaymentBadge
              paymentStatus={order.paymentStatus}
              paymentMethod={order.paymentMethod}
              refundStatus={order.refundStatus}
              orderStatus={order.status}
            />
          </Row>
          {order.paymentMethod && <Row label="Method">{order.paymentMethod}</Row>}
          {order.paymentRef && (
            <Row label="Payment ref">
              <span className="break-all font-mono text-xs">{order.paymentRef}</span>
            </Row>
          )}
          <Row label="Placed">{new Date(order.createdAt).toLocaleString()}</Row>
        </Section>

        <Section title="Charges">
          <Row label="Item total">{formatCurrency(itemTotal)}</Row>
          <Row label="Delivery">{formatCurrency(order.deliveryCharge ?? 0)}</Row>
          {order.discountAmount > 0 && (
            <Row label="Discount">
              <span className="text-green-400">
                -{formatCurrency(order.discountAmount)}
                {order.coupon
                  ? ` (${order.coupon.discountType === "percentage" ? `${order.coupon.discountValue}%` : formatCurrency(order.coupon.discountValue)} off)`
                  : ""}
              </span>
            </Row>
          )}
          {order.couponCode && (
            <Row label="Coupon">
              <span className="text-blue-400">
                {order.coupon?.public_name ?? order.couponCode}
              </span>
            </Row>
          )}
          <div className="mt-2 border-t border-slate-800 pt-2">
            <Row label="Total paid">
              <span className="text-base font-bold text-white">
                {formatCurrency(order.total)}
              </span>
            </Row>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section
          title="Placed By"
          right={
            order.deliverySlot ? (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-300">
                {order.deliverySlot}
              </span>
            ) : undefined
          }
        >
          {order.buyer ? (
            <div className="text-sm text-gray-200">
              <p className="font-medium">{order.buyer.name}</p>
              <p className="text-xs text-gray-400">{order.buyer.email}</p>
              <p className="text-xs text-gray-400">{order.buyer.phone_number}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Buyer details unavailable.</p>
          )}

          {(order.deliveryName || order.deliveryAddress) && (
            <div className="mt-3 border-t border-slate-800 pt-3 text-sm text-gray-300">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Deliver to
              </p>
              <p className="font-medium text-gray-200">{order.deliveryName}</p>
              {order.deliveryPhone && (
                <p className="text-xs text-gray-400">{order.deliveryPhone}</p>
              )}
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                {order.deliveryAddress}
                {order.deliveryLandmark ? `, ${order.deliveryLandmark}` : ""}
                {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                {order.deliveryPincode ? ` - ${order.deliveryPincode}` : ""}
              </p>
              {order.deliveryInstructions && (
                <p className="mt-2 rounded-md border border-amber-900/40 bg-amber-950/20 px-2 py-1.5 text-xs text-amber-300">
                  {order.deliveryInstructions}
                </p>
              )}
            </div>
          )}
        </Section>

        <Section title="Fulfilled By">
          {order.store ? (
            <div className="text-sm text-gray-200">
              <p className="font-medium">{order.store.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                {order.store.address}, {order.store.city} - {order.store.pincode}
              </p>
              {order.store.sellerPhone && (
                <p className="text-xs text-gray-400">{order.store.sellerPhone}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Store details unavailable.</p>
          )}
        </Section>
      </div>

      {/* Payment Records */}
      {order.payments && order.payments.length > 0 && (
        <Section title="Payment Records">
          <div className="space-y-2 text-sm text-gray-300">
            {order.payments.map((payment: any) => (
              <div
                key={payment.id}
                className="rounded-md border border-slate-800 bg-slate-900/50 p-3"
              >
                <p>
                  <span className="font-semibold">Method:</span> {payment.method}
                  {payment.metadata?.method && (
                    <>
                      {" "}
                      ({payment.metadata.method.toUpperCase()}
                      {payment.metadata.instrumentDetail ? ` · ${payment.metadata.instrumentDetail}` : ""})
                    </>
                  )}{" "}
                  ·{" "}
                  <PaymentBadge
                    paymentStatus={payment.status}
                    paymentMethod={payment.method}
                    orderStatus={order.status}
                  />
                  {payment.status === "COMPLETED" && order.refundStatus === "FAILED" && (
                    <span className="ml-1 text-xs text-red-400">(refund failed — not returned)</span>
                  )}
                </p>
                <p>
                  <span className="font-semibold">Amount:</span> {formatCurrency(payment.amount)}
                </p>
                {payment.transactionId && (
                  <p>
                    <span className="font-semibold">Transaction ID:</span> {payment.transactionId}
                  </p>
                )}
                {payment.gatewayOrderId && (
                  <p>
                    <span className="font-semibold">Gateway Order ID:</span> {payment.gatewayOrderId}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Fulfilment proof — kept on the seller side so a "never delivered"
          complaint can be answered with the rider's own photo. */}
      {(order.deliveryProofPhotoUrl || (order.preparationPhotos?.length ?? 0) > 0) && (
        <Section title="Fulfilment Proof">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(order.preparationPhotos?.length ?? 0) > 0 && (
              <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-sm font-semibold text-gray-200 mb-3">
                  Cutting &amp; Weight
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    shared with the customer
                  </span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {order.preparationPhotos.map((photo: OrderPhoto, idx: number) => (
                    <a
                      key={photo.publicId ?? idx}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square overflow-hidden rounded-md border border-slate-800"
                    >
                      <img
                        src={photo.url}
                        alt={`Cutting and weight photo ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {order.deliveryProofPhotoUrl && (
              <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-sm font-semibold text-gray-200 mb-3">
                  Delivery Proof
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    store record only
                  </span>
                </p>
                <a
                  href={order.deliveryProofPhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video overflow-hidden rounded-md border border-slate-800"
                >
                  <img
                    src={order.deliveryProofPhotoUrl}
                    alt="Delivery proof"
                    className="h-full w-full object-cover"
                  />
                </a>
                {order.deliveryProofUploadedAt && (
                  <p className="mt-2 text-xs text-gray-500">
                    Taken {new Date(order.deliveryProofUploadedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      <Section title={`Order Items (${order.items.length})`}>
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3"
            >
              <img
                src={item.product?.images[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product image"}
                className="h-14 w-14 shrink-0 rounded-md border border-slate-800 object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-200">
                  {item.product?.title || "Unnamed Product"}
                </p>
                {item.selectedOptions?.cuttingType || item.selectedOptions?.weightGrams ? (
                  <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                    {(item.selectedOptions?.cuttingType || item.selectedOptions?.pieceSize) && (
                      <p>
                        {item.selectedOptions.cuttingType}
                        {item.selectedOptions.pieceSize ? ` · ${item.selectedOptions.pieceSize}` : ""}
                      </p>
                    )}
                    {item.selectedOptions?.weightGrams ? (
                      <p>
                        Weight:{" "}
                        {item.selectedOptions.weightGrams >= 1000
                          ? `${(item.selectedOptions.weightGrams / 1000).toFixed(2)} kg`
                          : `${item.selectedOptions.weightGrams} gm`}
                      </p>
                    ) : (
                      <p>Qty: {item.quantity}</p>
                    )}
                    {item.selectedOptions?.cuttingCharge != null && item.selectedOptions.cuttingCharge > 0 && (
                      <p className="text-amber-400">
                        ₹{item.selectedOptions.baseRatePerKg}/kg + ₹{item.selectedOptions.cuttingCharge} cut
                        {item.selectedOptions.sizeMultiplier && item.selectedOptions.sizeMultiplier !== 1
                          ? ` ×${item.selectedOptions.sizeMultiplier}`
                          : ""}
                        {" = "}₹{item.selectedOptions.effectiveRatePerKg}/kg
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">Qty: {item.quantity}</p>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-200">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default OrderDetailsView;
