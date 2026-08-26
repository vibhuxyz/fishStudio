// One vocabulary for "where is the money?", shared by admin-ui, seller-ui,
// user-ui and mobile.
//
// Every screen used to derive its own labels from the raw PaymentStatus enum,
// and the copies disagreed: COMPLETED rendered as "Paid", "PAID", "SUCCESSFUL"
// and bare "COMPLETED" depending on which dashboard you were looking at, and
// most maps had never heard of REFUND_PENDING. Worse, PENDING alone cannot say
// whether cash is due, a checkout is still open, or nobody ever paid — that
// needs the payment method and the order status too.
//
// Pure logic on purpose: this compiles as node18 ESM and is imported by React
// Native, so it returns semantic tokens rather than Tailwind classes or icons.
// Each app owns its own token -> style table.

export type PaymentStatusValue =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "NOT_PAID"
  | "REFUND_PENDING"
  | "REFUNDED";

export type RefundStatusValue =
  | "NONE"
  | "REQUESTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

/** Semantic colour intent. Never a class name — mobile uses hex. */
export type PaymentTone =
  | "paid"
  | "due"
  | "dead"
  | "pending"
  | "refunded"
  | "danger";

export type PaymentStateKey =
  | "PAID"
  | "CASH_COLLECTED"
  | "CASH_DUE"
  | "AWAITING_PAYMENT"
  | "NOT_PAID"
  | "NOT_COLLECTED"
  | "PAYMENT_FAILED"
  | "REFUND_QUEUED"
  | "REFUND_IN_PROGRESS"
  | "REFUNDED"
  | "REFUND_FAILED";

export interface PaymentStateInput {
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  refundStatus?: string | null;
  orderStatus?: string | null;
}

export interface PaymentState {
  key: PaymentStateKey;
  /** Short label for a badge or table cell. */
  label: string;
  tone: PaymentTone;
  /** One sentence of context, for detail views and tooltips. */
  detail: string;
  /** Money has finally settled one way or the other — nothing left to watch. */
  isSettled: boolean;
  /** Worth asking the gateway again what happened. */
  canRecheck: boolean;
  /** A refund could be submitted right now. */
  canRefund: boolean;
}

const CANCELLED_ORDER_STATUSES = new Set(["CANCELLED", "REJECTED"]);

/**
 * Resolve the four raw fields into one honest statement about the money.
 *
 * Refund states are checked first: once a refund exists it is the whole story,
 * and the underlying payment being COMPLETED is exactly what makes a *failed*
 * refund worth flagging rather than reassuring.
 */
export const resolvePaymentState = ({
  paymentMethod,
  paymentStatus,
  refundStatus,
  orderStatus,
}: PaymentStateInput): PaymentState => {
  const isCod = paymentMethod === "COD";
  const payment = (paymentStatus ?? "PENDING") as PaymentStatusValue;
  const refund = (refundStatus ?? "NONE") as RefundStatusValue;
  const orderIsDead = CANCELLED_ORDER_STATUSES.has(orderStatus ?? "");

  if (refund === "FAILED") {
    return {
      key: "REFUND_FAILED",
      label: "Refund failed",
      tone: "danger",
      detail:
        "The gateway rejected the refund, so the money is still with the store. It can be retried.",
      isSettled: false,
      canRecheck: false,
      // The failed attempt released the claim back to COMPLETED, so a retry
      // can take it again.
      canRefund: payment === "COMPLETED",
    };
  }

  if (payment === "REFUNDED" || refund === "COMPLETED") {
    return {
      key: "REFUNDED",
      label: "Refunded",
      tone: "refunded",
      detail:
        "The gateway confirmed the refund. It reaches the customer on their bank's schedule.",
      isSettled: true,
      canRecheck: false,
      canRefund: false,
    };
  }

  if (payment === "REFUND_PENDING" || refund === "PROCESSING") {
    return {
      key: "REFUND_IN_PROGRESS",
      label: "Refund in progress",
      tone: "pending",
      detail:
        "The gateway accepted the refund and is settling it. This usually completes within 5-7 working days.",
      isSettled: false,
      canRecheck: false,
      canRefund: false,
    };
  }

  if (refund === "REQUESTED") {
    return {
      key: "REFUND_QUEUED",
      label: "Refund queued",
      tone: "pending",
      detail:
        "A refund was requested but has not reached the gateway yet. Start it manually if it has been sitting for more than a few minutes.",
      isSettled: false,
      canRecheck: false,
      canRefund: payment === "COMPLETED",
    };
  }

  if (payment === "COMPLETED") {
    return isCod
      ? {
          key: "CASH_COLLECTED",
          label: "Cash collected",
          tone: "paid",
          detail: "The rider collected the cash on delivery.",
          isSettled: true,
          canRecheck: false,
          canRefund: false,
        }
      : {
          key: "PAID",
          label: "Paid",
          tone: "paid",
          detail: "The gateway captured the payment in full.",
          isSettled: true,
          canRecheck: false,
          canRefund: true,
        };
  }

  if (payment === "FAILED") {
    return {
      key: "PAYMENT_FAILED",
      label: "Payment failed",
      tone: "danger",
      detail:
        "The customer tried to pay and the gateway declined it. No money was taken.",
      isSettled: true,
      canRecheck: !isCod,
      canRefund: false,
    };
  }

  // NOT_PAID, or a legacy row still on PENDING behind a cancelled order — the
  // backfill misses nothing new, but old data and any path we haven't found
  // yet must still read honestly.
  if (payment === "NOT_PAID" || orderIsDead) {
    return isCod
      ? {
          key: "NOT_COLLECTED",
          label: "Not collected",
          tone: "dead",
          detail:
            "The order was cancelled before delivery, so no cash was ever collected. Nothing is owed.",
          isSettled: true,
          canRecheck: false,
          canRefund: false,
        }
      : {
          key: "NOT_PAID",
          label: "Not paid",
          tone: "dead",
          detail:
            "The customer never completed payment, so no money was taken. Nothing is owed and there is nothing to refund.",
          isSettled: true,
          canRecheck: !isCod,
          canRefund: false,
        };
  }

  return isCod
    ? {
        key: "CASH_DUE",
        label: "Cash due",
        tone: "due",
        detail: "The rider collects this on delivery.",
        isSettled: false,
        canRecheck: false,
        canRefund: false,
      }
    : {
        key: "AWAITING_PAYMENT",
        label: "Awaiting payment",
        tone: "due",
        detail:
          "Checkout is open and the gateway has not reported an outcome yet.",
        isSettled: false,
        canRecheck: true,
        canRefund: false,
      };
};

/** Short label only — for table cells and badges. */
export const paymentStateLabel = (input: PaymentStateInput): string =>
  resolvePaymentState(input).label;

/**
 * Every value the admin order-list filter can offer. Kept here so a new
 * PaymentStatus can't be added without the filter learning about it.
 */
export const PAYMENT_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: PaymentStatusValue;
  label: string;
}> = [
  { value: "PENDING", label: "Awaiting payment" },
  { value: "COMPLETED", label: "Paid" },
  { value: "NOT_PAID", label: "Not paid" },
  { value: "FAILED", label: "Payment failed" },
  { value: "REFUND_PENDING", label: "Refund in progress" },
  { value: "REFUNDED", label: "Refunded" },
];
