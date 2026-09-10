"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle2, CreditCard, Phone, ArrowLeft, Ticket, Smartphone, Landmark, Wallet, Gift } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";
import { BillSummary } from "./bill-summary";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import type { AvailableSlot } from "@repo/shared/delivery-slots";

// Which rail Razorpay opens on (`prefill.method`). Picking one here saves the
// shopper a tap inside the gateway sheet; the order is still placed as
// RAZORPAY because the rail isn't something the order schema records.
const ONLINE_METHODS = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm & more", Icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay & Amex", Icon: CreditCard },
  { id: "netbanking", label: "Net Banking", hint: "All major banks supported", Icon: Landmark },
  { id: "wallet", label: "Wallets", hint: "Paytm, Freecharge, Mobikwik & more", Icon: Wallet },
] as const;

type OnlineMethod = (typeof ONLINE_METHODS)[number]["id"];

/**
 * Loads the Razorpay Checkout SDK, at most once per page.
 *
 * Module-scoped rather than defined in the component body so the promise
 * survives re-renders: the checkout screen re-renders on every cart/slot/fee
 * change, and a per-render closure would let two taps append two <script>
 * tags. Callers await the same promise instead.
 *
 * Called at mount (see the effect below) so the ~100KB download, its DNS
 * lookup and its TLS handshake all overlap with the shopper choosing an
 * address and a slot. Previously this ran only after `POST /order/api/create`
 * had returned, putting the whole download between the order being created
 * and the payment sheet appearing.
 */
/**
 * A key identifying one checkout attempt, so a retried POST cannot become a
 * second order.
 *
 * order-service has always honoured `x-idempotency-key` (it caches the
 * response under it and replays that on a repeat), but no client ever sent
 * one — so a request that timed out on a slow connection left the shopper
 * with a placed order, no confirmation, and a Place Order button that would
 * cheerfully charge them again.
 */
const newIdempotencyKey = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * The `items` array sent to BOTH /order/api/quote and /order/api/create.
 *
 * Shared rather than built twice on purpose: order-service fingerprints the
 * basket (`hashCartItems`) and refuses a quote whose fingerprint no longer
 * matches the order redeeming it. Two separately-maintained copies of this
 * mapping would drift on the first new option added to a cart line, and every
 * checkout would then fail with QUOTE_STALE for a basket nobody changed.
 */
const buildOrderItems = (items: ReturnType<typeof useCart>["items"]) =>
  items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    price: item.totalPayable / item.quantity,
    selectedOptions: {
      cuttingType: item.cuttingType.name,
      pieceSize: item.pieceSize.name,
      size: item.size,
      // Tags this line as a combo bundle member so order-service
      // reprices the whole group to the bundle price at checkout.
      ...(item.comboId ? { comboId: item.comboId } : {}),
      ...(item.priceBreakdown ? {
        baseRatePerKg: item.priceBreakdown.baseRatePerKg,
        cuttingCharge: item.priceBreakdown.cuttingCharge,
        sizeMultiplier: item.priceBreakdown.sizeMultiplier,
        weightGrams: item.priceBreakdown.weightGrams,
        effectiveRatePerKg: item.priceBreakdown.effectiveRatePerKg,
      } : {}),
    },
  }));

/** What the server quoted, plus the inputs it was quoted for. */
interface CheckoutQuote {
  quoteId: string;
  /** The input fingerprint this quote answers. A quote is only usable while
   *  it still matches what is on screen — see `quoteFingerprint` below. */
  fingerprint: string;
  itemTotal: number;
  deliveryCharge: number;
  slotExtraCharge: number;
  packagingCharge: number;
  gstAmount: number;
  discount: number;
  /** Carried and displayed verbatim rather than re-added from the lines above.
   *  The quote can include charges this bill has no row for (handling, say),
   *  and a total the screen derived itself could then differ from the total
   *  the customer is actually agreeing to. */
  grandTotal: number;
  /** Whether this environment defers the Order until payment settles. Gates
   *  speculative preparation — see `prepared` below. */
  sessionsEnabled: boolean;
}

/**
 * A checkout prepared ahead of the tap: stock held, price fixed, gateway order
 * already created.
 *
 * This is what makes Pay open the sheet immediately instead of waiting on a
 * session create and a Razorpay round trip. It is deliberately keyed to the
 * fingerprint it was built for — a prepared checkout describes one exact
 * basket, and the moment the basket changes it is not the thing the customer
 * is looking at any more.
 */
interface PreparedCheckout {
  fingerprint: string;
  sessionId: string;
  rzp: { keyId: string; amount: number; currency: string; razorpayOrderId: string };
}

/** How long the inputs must hold still before the bill is re-quoted. */
const QUOTE_DEBOUNCE_MS = 500;

/**
 * How long they must hold still before a checkout is prepared for them.
 *
 * Longer than the quote debounce because preparing is the expensive one: it
 * holds stock and creates a gateway order, so it should only happen once the
 * customer has genuinely stopped fiddling — not after every intermediate state
 * on the way there.
 */
const PREPARE_DEBOUNCE_MS = 800;

/**
 * How often a quote is refreshed while the customer sits on the screen.
 *
 * Comfortably inside order-service's 60s QUOTE_TTL_SEC. Without this, reading
 * the page for a minute would be enough to have the order rejected on the
 * first tap — with "your bill was updated" for a bill nobody changed, which
 * is both wrong and the exact message that teaches people to distrust it.
 */
const QUOTE_REFRESH_MS = 45_000;

/**
 * What the payment sheet is being opened against.
 *
 * Two checkout lifecycles are live at once and the client does not choose
 * between them: it uses whichever handle `/order/api/create` returned. With
 * checkout sessions on there is no Order yet and one is written when the money
 * lands, so the order id only becomes known from the verify response. With them
 * off, the order already exists and is what gets paid for.
 */
type PaymentHandle =
  | { kind: "order"; orderId: string }
  | { kind: "session"; sessionId: string };

let razorpayScriptPromise: Promise<boolean> | null = null;

const loadRazorpay = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as any).Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      // Cleared so a later tap can retry the download rather than being stuck
      // with a permanently rejected cache entry (a flaky network on mount
      // must not disable online payment for the rest of the session).
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};


export function CheckoutClient() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const { isLoggedIn, user } = useAuth();
  const modals = useModals();
  const clearCart = useCartStore((s) => s.clearCart);
  // Re-read on every render so the quote and the order assert the same value
  // the last validate-cart handed back.
  const cartVersion = useCartStore((s) => s.cartVersion);

  // Use Zustand address store (same as cart sidebar)
  const { getSelectedAddress, selectedLocation, setSelectedLocation } = useAddressStore();
  const selectedAddress = getSelectedAddress();

  const {
    getTotalDiscount,
    appliedCoupons,
    clearAllCoupons,
    fetchAvailableCoupons,
  } = useCouponStore();
  // The store now holds at most one applied coupon (real or event-derived).
  const appliedCoupon = appliedCoupons[0] ?? null;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  // Held across retries of the SAME attempt and cleared once an order exists,
  // so a resend after a dropped response returns the original order while a
  // genuinely new checkout still gets a new one.
  const idempotencyKeyRef = useRef<string | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  // A checkout prepared ahead of the tap. Held in a ref as well as state: the
  // cleanup that releases a superseded one has to see the current value, not
  // the one captured when its effect was set up.
  const [prepared, setPrepared] = useState<PreparedCheckout | null>(null);
  const preparedRef = useRef<PreparedCheckout | null>(null);
  preparedRef.current = prepared;
  // Bumped on a timer to re-quote before the current one lapses.
  const [quoteTick, setQuoteTick] = useState(0);
  // Set when an online payment was started but never completed. While it holds
  // an id, Place Order retries THAT order instead of creating another one —
  // this is what keeps one purchase to one Order id across payment retries.
  const [retryOrderId, setRetryOrderId] = useState<string | null>(null);
  // Which lifecycle the saved retry handle belongs to. Held separately because
  // an id alone no longer says whether it names an Order or a CheckoutSession.
  const [retryKind, setRetryKind] = useState<"order" | "session">("order");
  const [deliveryMetadata, setDeliveryMetadata] = useState<{
    availableSlots: string[];
    deliverySlots: AvailableSlot[];
    instantFee: number;
    isStoreOpen: boolean;
    gstRate: number;
    packagingCharge: number;
    baseDeliveryCharge: number;
    freeDeliveryThreshold: number;
  }>({
    availableSlots: ["morning", "evening"],
    deliverySlots: [],
    instantFee: 20,
    isStoreOpen: true,
    gstRate: 0,
    packagingCharge: 0,
    baseDeliveryCharge: 49,
    freeDeliveryThreshold: 500,
  });

  // Never defaulted — the shopper must actively pick a delivery slot every
  // checkout instead of silently inheriting an auto-picked one.
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  // Paired with selectedSlot: "morning" alone is ambiguous once slots are
  // dated. Null for instant, which is always today.
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string | null>(null);
  // The refresh effect below runs on a timer and would otherwise close over the
  // date as it was when the timer was set, and re-clear a slot the shopper had
  // since picked.
  const selectedDeliveryDateRef = useRef<string | null>(null);
  selectedDeliveryDateRef.current = selectedDeliveryDate;
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>("upi");
  // Only rewards the referrer, and only on the referee's genuine first
  // order — order-service silently no-ops it otherwise, so there's no
  // separate "invalid code" state to show here.
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const isInstantAvailable = deliveryMetadata.availableSlots.includes("instant");

  // Slots arrive as a flat list across the next few days; the picker shows them
  // under a heading per day. Insertion order is already chronological, so a Map
  // preserves it without a sort.
  const scheduledSlotsByDate = React.useMemo(() => {
    const byDate = new Map<string, AvailableSlot[]>();
    for (const slot of deliveryMetadata.deliverySlots) {
      const existing = byDate.get(slot.deliveryDate);
      if (existing) existing.push(slot);
      else byDate.set(slot.deliveryDate, [slot]);
    }
    return [...byDate.entries()];
  }, [deliveryMetadata.deliverySlots]);

  // Sync cart data to get latest delivery slots and fees
  const { syncItems } = useCartStore();
  useEffect(() => {
    if (items.length === 0) return;

    const refreshDelivery = () => {
      syncItems().then((res) => {
        if (res) {
          const freshSlots: AvailableSlot[] = res.deliverySlots || [];
          setDeliveryMetadata({
            availableSlots: res.availableSlots || ["morning", "evening"],
            deliverySlots: freshSlots,
            instantFee: res.instantFee || 20,
            isStoreOpen: res.isStoreOpen !== false,
            gstRate: res.gstRate ?? 0,
            packagingCharge: res.packagingCharge ?? 0,
            baseDeliveryCharge: res.baseDeliveryCharge ?? 49,
            freeDeliveryThreshold: res.freeDeliveryThreshold ?? 500,
          });

          // Don't auto-pick a slot — only clear one that's gone stale (e.g.
          // instant closed, or the slot filled up, while checkout sat open),
          // forcing a fresh choice rather than silently swapping in a
          // different slot underneath them.
          setSelectedSlot((prev) => {
            if (!prev) return prev;
            if (prev === "instant") {
              return (res.availableSlots || []).includes("instant") ? prev : null;
            }
            const stillBookable = freshSlots.some(
              (slot) =>
                slot.key === prev &&
                slot.deliveryDate === selectedDeliveryDateRef.current &&
                slot.isBookable,
            );
            if (!stillBookable) setSelectedDeliveryDate(null);
            return stillBookable ? prev : null;
          });
        }
      });
    };

    // A cart doesn't change size while someone fills in address/payment
    // details, so a mount-only fetch goes stale — e.g. instant delivery
    // stays "available" here even after the store's closing time passes
    // while checkout sits open. Re-check on a timer, same as the header.
    refreshDelivery();
    const id = setInterval(refreshDelivery, 60_000);
    return () => clearInterval(id);
  }, [items.length]);


  // Auto-resolve storeId from address pincode if selectedLocation is missing
  useEffect(() => {
    if (selectedLocation?.storeId) return;
    const addr = getSelectedAddress();
    if (!addr?.pincode) return;
    axiosInstance
      .get(`/auth/api/check-pincode?pincode=${addr.pincode}`)
      .then(({ data }) => {
        if (data.success && data.store?.id) {
          setSelectedLocation({
            storeId: data.store.id,
            storeName: data.store.name,
            pincode: addr.pincode,
            city: addr.city || data.store.city || "",
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId]);

  // Fetch available coupons when storeId is available — pass userId so the
  // backend filters out coupons this user has already exhausted.
  useEffect(() => {
    if (selectedLocation?.storeId) {
      fetchAvailableCoupons(selectedLocation.storeId, user?.id);
    }
  }, [selectedLocation?.storeId, user?.id]);


  // Derived pricing, and the retry-reset effect that depends on it, both sit
  // above the early returns below. The effect used to live under them, so the
  // moment a successful payment called clearCart() the component re-rendered
  // into the "cart is empty" guard, skipped the hook, and React threw
  // "Rendered fewer hooks than expected" — killing the page in the instant
  // between charging the customer and routing them to their confirmation.
  const slotExtraCharge = selectedSlot === "instant" ? deliveryMetadata.instantFee : 0;
  const baseDeliveryCharge =
    totalPrice >= deliveryMetadata.freeDeliveryThreshold ? 0 : deliveryMetadata.baseDeliveryCharge;
  const isFreeDelivery = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && totalPrice >= c.minOrderValue
  );
  const deliveryCharge = isFreeDelivery ? 0 : baseDeliveryCharge;
  const packagingCharge = deliveryMetadata.packagingCharge;
  const gstAmount = Math.round(totalPrice * deliveryMetadata.gstRate);

  const totalDeliveryCost = deliveryCharge + slotExtraCharge;


  const rawDiscount = getTotalDiscount(totalPrice);
  
  const discountBreakdown = appliedCoupons.map((c) => ({
    code: c.code,
    amount: useCouponStore.getState().getDiscountForCoupon(c, totalPrice),
  }));
  
  const discount = Math.min(rawDiscount, totalPrice + totalDeliveryCost);
  const grandTotal = Math.max(0, totalPrice + totalDeliveryCost + packagingCharge + gstAmount - discount);

  /* ── Server-authoritative bill ────────────────────────────────────────
     The arithmetic above is what the screen renders while a quote is being
     fetched, but it is the client's own reckoning of the price. The quote is
     the server's, produced by the same computeOrderTotals that /create bills
     with — so once one arrives for the current inputs, it is what the bill
     shows and what the customer agrees to by tapping Pay.

     Only inputs that can move the total are in the fingerprint. The address
     is not one: delivery fees come from the store's configuration, not from
     where it is going, and re-quoting on every address tap would be churn for
     a number that cannot change. Neither is the payment method. */
  const quoteFingerprint = useMemo(
    () =>
      JSON.stringify([
        selectedLocation?.storeId ?? null,
        buildOrderItems(items),
        selectedSlot ?? null,
        selectedDeliveryDate ?? null,
        appliedCoupon && !appliedCoupon.isEvent ? appliedCoupon.code : null,
        appliedCoupon?.isEvent ? appliedCoupon.eventId : null,
        cartVersion,
      ]),
    [selectedLocation?.storeId, items, selectedSlot, selectedDeliveryDate, appliedCoupon, cartVersion],
  );

  useEffect(() => {
    const storeId = selectedLocation?.storeId;
    if (!isLoggedIn || !storeId || items.length === 0 || !selectedSlot) return;

    // Debounced because the customer assembles the order in bursts — slot,
    // then coupon, then a quantity nudge. Quoting each keystroke would spend
    // a request per intermediate state nobody is going to buy.
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const { data } = await axiosInstance.post("/order/api/quote", {
            storeId,
            items: buildOrderItems(items),
            deliverySlot: selectedSlot,
            ...(selectedDeliveryDate ? { deliveryDate: selectedDeliveryDate } : {}),
            ...(appliedCoupon && !appliedCoupon.isEvent ? { couponCode: appliedCoupon.code } : {}),
            ...(appliedCoupon?.isEvent ? { eventId: appliedCoupon.eventId } : {}),
            ...(cartVersion !== null ? { cartVersion } : {}),
          });

          // A newer fingerprint won while this was in flight, or the server
          // could not park the snapshot (quoteId null) — in both cases there
          // is nothing redeemable here, so the local arithmetic stands.
          if (cancelled || !data?.success || !data.quoteId) return;

          setQuote({
            quoteId: data.quoteId,
            fingerprint: quoteFingerprint,
            itemTotal: data.subtotal,
            deliveryCharge: data.baseDeliveryFee,
            slotExtraCharge: data.slotExtraCharge,
            packagingCharge: data.packagingCharge,
            gstAmount: data.tax,
            discount: data.discount,
            grandTotal: data.grandTotal,
            sessionsEnabled: data.checkoutSessionsEnabled === true,
          });
        } catch {
          // Quoting is an enhancement over arithmetic the screen can already
          // do. A failure leaves the local figures rendered and the order
          // placeable without a quoteId, exactly as before quoting existed.
          if (!cancelled) setQuote(null);
        }
      })();
    }, QUOTE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [quoteFingerprint, quoteTick, isLoggedIn, selectedLocation?.storeId, items, selectedSlot, selectedDeliveryDate, appliedCoupon, cartVersion]);

  useEffect(() => {
    const id = setInterval(() => setQuoteTick((n) => n + 1), QUOTE_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Usable only while it still describes what is on screen. Anything else is
  // a quote for a basket the customer has already moved on from.
  const activeQuote = quote && quote.fingerprint === quoteFingerprint ? quote : null;

  /* ── Prepare the checkout before it is needed ─────────────────────────────
     Once the customer has settled on a basket, a slot and an online payment
     method, everything the payment sheet needs can be built while their thumb
     is still travelling: the session that holds the stock, and the Razorpay
     order itself. The tap then opens the sheet with no network in between.

     Gated on three things, each for its own reason. On the session lifecycle,
     because preparing under the order lifecycle would commit a real Order for
     a customer who has pressed nothing. On an online method, because COD has
     no sheet to open. And on a live quote, because preparing a price the
     server has not agreed to is the thing quoting exists to prevent.

     This does hold stock from the moment a payment method is picked rather
     than from the tap. That is the trade: a held basket is released by the
     expiry sweep within fifteen minutes, or immediately when the customer
     changes their mind, and in exchange the sheet opens instantly. */
  const canPrepare =
    Boolean(activeQuote?.sessionsEnabled) &&
    paymentMethod === "RAZORPAY" &&
    Boolean(selectedAddress) &&
    Boolean(selectedLocation?.storeId) &&
    Boolean(selectedSlot) &&
    (selectedSlot === "instant" || Boolean(selectedDeliveryDate)) &&
    !retryOrderId;

  const activePrepared =
    prepared && prepared.fingerprint === quoteFingerprint ? prepared : null;

  // A saved unpaid order is only worth retrying while it still describes what
  // the customer is looking at. Change the basket, the address or the slot and
  // the retry handle is dropped, so the next tap builds a fresh order rather
  // than charging them for the previous one's contents.
  useEffect(() => {
    setRetryOrderId(null);
    idempotencyKeyRef.current = null;
  }, [grandTotal, items.length, selectedAddress?.id, selectedSlot, paymentMethod]);

  // Start the gateway SDK download as soon as the checkout screen mounts, so
  // it is already in memory by the time Pay is tapped. Deliberately not
  // awaited and never surfaced: a failure here is retried by the tap path,
  // which is the only place that can tell the customer about it.
  useEffect(() => {
    void loadRazorpay();
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Please login to continue</h2>
        <p className="mt-2 text-muted-foreground">You need to be logged in to place an order.</p>
        <Button onClick={() => modals.openLogin()} className="mt-6">Login / Sign Up</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Add some delicious items to your cart first.</p>
        <Button onClick={() => router.push("/")} className="mt-6">Browse Products</Button>
      </div>
    );
  }

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchOrderPaymentStatus = async (orderId: string): Promise<string | null> => {
    try {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data?.order?.paymentStatus ?? null;
    } catch {
      return null;
    }
  };

  /**
   * Did this payment actually settle, whatever the verify call did?
   *
   * Razorpay has already handed us a payment by the time this runs, so a failed
   * verify says nothing about whether money moved — the webhook may settle it
   * server-side moments later. Returns the order id once one exists.
   */
  const fetchSettledOrderId = async (handle: PaymentHandle): Promise<string | null> => {
    if (handle.kind === "order") {
      const status = await fetchOrderPaymentStatus(handle.orderId);
      return status === "COMPLETED" ? handle.orderId : null;
    }
    try {
      const { data } = await axiosInstance.get(
        `/order/api/checkout-session/${handle.sessionId}`,
      );
      return data?.orderId ?? null;
    } catch {
      return null;
    }
  };

  // Order created with paymentMethod RAZORPAY is unpaid until verified.
  // Open the Razorpay popup, then verify the signature server-side.
  /** Fetches the gateway order for a handle, loading the SDK if it isn't yet. */
  const startRazorpayPayment = async (handle: PaymentHandle) => {
    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Could not load the payment gateway. Please try Pay on Delivery.");
      setIsPlacingOrder(false);
      return;
    }

    const { data: rzp } = await axiosInstance.post(
      "/payment/api/create-razorpay-order",
      handle.kind === "order" ? { orderId: handle.orderId } : { sessionId: handle.sessionId },
    );

    await openRazorpaySheet(handle, rzp);
  };

  /**
   * Opens the payment sheet against an already-fetched gateway order.
   *
   * Split out from the fetch above so a checkout prepared before the tap can
   * come straight here — which is the entire point of preparing one. Nothing
   * in this function touches the network before the sheet appears.
   */
  const openRazorpaySheet = async (
    handle: PaymentHandle,
    rzp: { keyId: string; amount: number; currency: string; razorpayOrderId: string },
  ) => {
    // The server takes exactly one of these and knows which lifecycle it means.
    const handleBody =
      handle.kind === "order" ? { orderId: handle.orderId } : { sessionId: handle.sessionId };

    // Once payment verifies we must NOT cancel the order on modal close.
    let paymentSettled = false;
    // Razorpay handed us a payment, so money has very likely moved even if the
    // verify call below never lands. Cancelling on dismiss after this point
    // could void an order the customer has already paid for — leave it to the
    // webhook and payment-service's reconciliation sweep instead.
    let paymentAttempted = false;

    const razorpay = new (window as any).Razorpay({
      key: rzp.keyId, // public key_id, supplied by the backend
      amount: rzp.amount, // in paise, computed server-side from the order
      currency: rzp.currency,
      order_id: rzp.razorpayOrderId,
      name: "Fish Studio",
      description: "Order payment",
      prefill: {
        name: selectedAddress?.name,
        contact: selectedAddress?.phone,
        email: user?.email,
        method: onlineMethod,
      },
      theme: { color: "#0ea5e9" },
      handler: async (response: any) => {
        paymentAttempted = true;
        try {
          const { data: verified } = await axiosInstance.post("/payment/api/verify", {
            ...handleBody,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          // Under the session lifecycle the Order is written by this very call,
          // so its id is only knowable from the response.
          const settledOrderId =
            verified.orderId ?? (handle.kind === "order" ? handle.orderId : null);

          if (verified.success && settledOrderId) {
            paymentSettled = true;
            setRetryOrderId(null);
            toast.success("Payment successful!");
            clearCart();
            clearAllCoupons();
            router.push(`/order-confirmation/${settledOrderId}`);
          } else {
            toast.error("Payment could not be verified. Please contact support.");
          }
        } catch {
          // The verify call itself failing doesn't mean the payment failed —
          // Razorpay already handed us a payment by this point, so a webhook
          // may settle the order server-side moments after this request
          // drops. Check twice, a few seconds apart, before telling the
          // customer nothing went through (mirrors the mobile app's retry
          // logic — see apps/mobile/app/(routes)/checkout/index.tsx).
          paymentSettled = true; // stop ondismiss from cancelling while we check
          let settledOrderId = await fetchSettledOrderId(handle);
          if (!settledOrderId) {
            await wait(3000);
            settledOrderId = await fetchSettledOrderId(handle);
          }

          if (settledOrderId) {
            setRetryOrderId(null);
            toast.success("Payment successful!");
            clearCart();
            clearAllCoupons();
            router.push(`/order-confirmation/${settledOrderId}`);
          } else {
            paymentSettled = false;
            toast.error(
              "Payment verification failed. If money was deducted, it will be auto-confirmed shortly."
            );
          }
        } finally {
          setIsPlacingOrder(false);
        }
      },
      modal: {
        ondismiss: () => {
          // Modal closed without a verified payment. The order is deliberately
          // NOT cancelled: one customer purchase is one Order id, and a retry
          // must reuse it rather than mint a second. Held here so the Place
          // Order button becomes Retry Payment against this same order.
          //
          // Nothing leaks if they never retry. Under the session lifecycle the
          // expiry sweep releases the stock and the delivery slot within
          // fifteen minutes; under the order one, cancelStaleUnpaidOrders does
          // it after thirty.
          if (!paymentSettled && !paymentAttempted) {
            setRetryOrderId(handle.kind === "order" ? handle.orderId : handle.sessionId);
            setRetryKind(handle.kind);
            toast.info(
              handle.kind === "session"
                ? "Payment not completed. Your basket is held — tap Retry Payment to try again."
                : "Payment not completed. Your order is saved — tap Retry Payment to try again.",
            );
          }
          setIsPlacingOrder(false);
        },
      },
    });

    // Razorpay keeps the modal open after a failure so the user can retry,
    // so we don't cancel here — ondismiss handles rollback when they close it.
    razorpay.on("payment.failed", () => {
      toast.error("Payment failed. Please try again or choose Pay on Delivery.");
    });

    razorpay.open();
  };

  /**
   * The body for POST /order/api/create.
   *
   * Shared by the tap and by the speculative preparation above it, because the
   * two must produce byte-identical requests: order-service fingerprints the
   * basket, and a prepared checkout built from a different payload than the one
   * the tap would have sent is a checkout for a different basket.
   *
   * Returns null when the screen is not yet in a state that can be ordered —
   * the callers differ on what to do about that, so it is not decided here.
   */
  const buildCreatePayload = () => {
    if (!selectedAddress || !selectedLocation?.storeId || !selectedSlot) return null;

    return {
        storeId: selectedLocation.storeId,
        items: buildOrderItems(items),

        deliveryDetails: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: `${selectedAddress.street}${selectedAddress.area ? ", " + selectedAddress.area : ""}`,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          ...(selectedAddress.lat != null && selectedAddress.lng != null
            ? { latitude: selectedAddress.lat, longitude: selectedAddress.lng }
            : {}),
          ...(selectedAddress.landmark ? { landmark: selectedAddress.landmark } : {}),
          ...(selectedAddress.deliveryInstructions
            ? { deliveryInstructions: selectedAddress.deliveryInstructions }
            : {}),
        },
        billDetails: {
          itemTotal: activeQuote?.itemTotal ?? totalPrice,
          deliveryCharge: activeQuote?.deliveryCharge ?? deliveryCharge,
          extraCharge: activeQuote?.slotExtraCharge ?? slotExtraCharge,
          packagingCharge: activeQuote?.packagingCharge ?? packagingCharge,
          gstAmount: activeQuote?.gstAmount ?? gstAmount,
          discount: activeQuote?.discount ?? discount,
          discountBreakdown,
        },
        // The figure the bill actually showed. Advisory either way — the
        // server recomputes what it charges — but sending the local sum while
        // displaying the quoted one would make the drift warning in
        // createOrder fire on orders that never drifted.
        totalAmount: activeQuote?.grandTotal ?? grandTotal,
        // Redeems the bill the customer read. Sent only while the quote still
        // matches the screen; the server treats its absence as "price this
        // fresh", which is the pre-quote behaviour.
        ...(activeQuote ? { quoteId: activeQuote.quoteId } : {}),
        ...(cartVersion !== null ? { cartVersion } : {}),
        paymentMethod,
        deliverySlot: selectedSlot,
        ...(selectedDeliveryDate ? { deliveryDate: selectedDeliveryDate } : {}),
        // Order-service's couponCode is a single exact-match lookup against
        // discount_codes — the old join(",") never matched a real
        // discountCode even for two real coupons, and event-derived offers
        // (Flash Sale / seasonal Discount / Free Delivery banners) aren't
        // discount_codes rows at all, so they go through eventId instead.
        couponCode: appliedCoupon && !appliedCoupon.isEvent ? appliedCoupon.code : undefined,
        eventId: appliedCoupon?.isEvent ? appliedCoupon.eventId : undefined,
        referralCode: referralCodeInput.trim() || undefined,
        discountAmount: discount,
    };
  };

  /**
   * Releases a prepared checkout the customer has moved on from.
   *
   * Fire-and-forget: the expiry sweep would get there eventually, but "eventually"
   * is fifteen minutes of a delivery slot and somebody's stock held for a basket
   * that no longer exists.
   */
  const releasePrepared = (sessionId: string) => {
    axiosInstance.put(`/order/api/checkout-session/${sessionId}/abandon`).catch(() => {});
  };

  useEffect(() => {
    if (!canPrepare) return;
    // Already prepared for exactly this basket — nothing to do.
    if (preparedRef.current?.fingerprint === quoteFingerprint) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        const payload = buildCreatePayload();
        if (!payload) return;

        try {
          // The SDK download is started alongside, not awaited: by the time
          // the gateway order comes back it is almost always already in memory.
          void loadRazorpay();

          const { data } = await axiosInstance.post("/order/api/create", payload, {
            headers: { "x-idempotency-key": newIdempotencyKey() },
          });
          // No sessionId means this environment is on the order lifecycle after
          // all — the flag changed under us. Abandon the attempt rather than
          // leave a speculatively created Order lying around.
          if (!data?.sessionId) return;

          const { data: rzp } = await axiosInstance.post(
            "/payment/api/create-razorpay-order",
            { sessionId: data.sessionId },
          );

          if (cancelled) {
            // The basket changed while this was in flight. What was just built
            // describes the old one, so give its stock back immediately.
            releasePrepared(data.sessionId);
            return;
          }

          const previous = preparedRef.current;
          if (previous && previous.sessionId !== data.sessionId) {
            releasePrepared(previous.sessionId);
          }

          setPrepared({
            fingerprint: quoteFingerprint,
            sessionId: data.sessionId,
            rzp,
          });
        } catch {
          // Preparation is an optimisation with a working fallback: the tap
          // does this same work itself. Deliberately silent — the customer has
          // not asked for anything yet, so there is nothing to report.
        }
      })();
    }, PREPARE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [canPrepare, quoteFingerprint]);

  // A prepared checkout that no longer matches the screen is holding stock for
  // a basket nobody is buying. Released as soon as that is true, rather than
  // waiting for the sweep.
  useEffect(() => {
    if (prepared && prepared.fingerprint !== quoteFingerprint) {
      releasePrepared(prepared.sessionId);
      setPrepared(null);
    }
  }, [prepared, quoteFingerprint]);

  // Leaving checkout with a prepared-but-unpaid basket holds its stock for the
  // full expiry window. Hand it back on the way out.
  useEffect(
    () => () => {
      const held = preparedRef.current;
      if (held) releasePrepared(held.sessionId);
    },
    [],
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("No delivery address found. Please add an address from your cart.");
      return;
    }
    if (!selectedLocation?.storeId) {
      toast.error("Please set your delivery location first (open cart → change location)");
      return;
    }
    if (!selectedSlot || (selectedSlot !== "instant" && !selectedDeliveryDate)) {
      toast.error("Please choose a delivery slot");
      return;
    }

    setIsPlacingOrder(true);

    /* The fast path: a checkout was prepared for exactly this basket while the
       customer was choosing, so the sheet opens with nothing between the tap
       and Razorpay. Everything below is the fallback for when it wasn't —
       they tapped inside the debounce, preparation failed, or the basket moved
       at the last moment. */
    if (activePrepared) {
      // Consumed: it is now this payment's, not a spare to be released if the
      // basket changes while the sheet is open.
      setPrepared(null);
      preparedRef.current = null;
      setRetryKind("session");
      try {
        const ok = await loadRazorpay();
        if (!ok) {
          toast.error("Could not load the payment gateway. Please try Pay on Delivery.");
          setIsPlacingOrder(false);
          return;
        }
        await openRazorpaySheet(
          { kind: "session", sessionId: activePrepared.sessionId },
          activePrepared.rzp,
        );
      } catch (error: any) {
        setIsPlacingOrder(false);
        toast.error(
          error.response?.data?.message || "Could not open payment. Please try again.",
        );
      }
      return;
    }

    // A previous attempt on this same basket failed or was dismissed. Pay
    // against that order again — create-razorpay-order opens a fresh payment
    // attempt bound to it, so the customer keeps one Order id no matter how
    // many times they retry.
    if (retryOrderId) {
      try {
        await startRazorpayPayment(
          retryKind === "session"
            ? { kind: "session", sessionId: retryOrderId }
            : { kind: "order", orderId: retryOrderId },
        );
      } catch (error: any) {
        // The saved handle is no longer payable — swept as stale, cancelled, or
        // (under the session lifecycle) expired past its hold. Drop it and let
        // the next tap build a fresh one.
        setRetryOrderId(null);
        setIsPlacingOrder(false);
        toast.error(
          error.response?.data?.message ||
            "That checkout expired. Please place it again.",
        );
      }
      return;
    }

    try {
      const orderData = buildCreatePayload();
      if (!orderData) {
        setIsPlacingOrder(false);
        return;
      }

      const { data } = await axiosInstance.post("/order/api/create", orderData, {
        headers: { "x-idempotency-key": idempotencyKeyRef.current },
      });

      if (!data.success) {
        setIsPlacingOrder(false);
        return;
      }

      // The checkout is committed now, so the key has done its job. The next
      // Place Order is a different purchase and must not replay this response.
      idempotencyKeyRef.current = null;

      if (paymentMethod === "RAZORPAY") {
        // Which lifecycle the server is on is read off the response, not from a
        // flag here: a sessionId means the Order is written when the money
        // lands, an orderId means it already exists.
        const handle: PaymentHandle = data.sessionId
          ? { kind: "session", sessionId: data.sessionId }
          : { kind: "order", orderId: data.orderId };
        setRetryKind(handle.kind);
        // Online payment: keep the loading state until the popup resolves.
        await startRazorpayPayment(handle);
        return;
      }

      // Cash on Delivery: order is placed immediately.
      toast.success("Order placed successfully!");
      clearCart();
      clearAllCoupons();
      router.push(`/order-confirmation/${data.orderId}`);
      setIsPlacingOrder(false);
    } catch (error: any) {
      const code = error.response?.data?.details?.code;

      // The bill moved between being read and being tapped. Drop the stale
      // quote so the effect above re-prices, and stop — deliberately WITHOUT
      // retrying. Re-submitting silently would charge a total the customer
      // never saw, which is the whole thing quoting exists to prevent.
      if (code === "QUOTE_STALE" || code === "QUOTE_EXPIRED") {
        setQuote(null);
        toast.error(
          error.response?.data?.message ||
            "Your bill was updated. Please review it and place the order again.",
        );
        setIsPlacingOrder(false);
        return;
      }

      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* 0. Order Summary */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">0</div>
              <h2 className="text-xl font-bold">Order Summary</h2>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                      <Image
                        src={item.product?.image || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate">{item.product?.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.size}
                        {item.cuttingType.name !== "default" && ` · ${item.cuttingType.name}`}
                        {item.pieceSize.name !== "default" && ` · ${item.pieceSize.name}`}
                      </p>
                      {item.priceBreakdown?.cuttingCharge != null && item.priceBreakdown.cuttingCharge > 0 && (
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          ₹{item.priceBreakdown.baseRatePerKg}/kg + ₹{item.priceBreakdown.cuttingCharge} cut
                          {item.priceBreakdown.sizeMultiplier && item.priceBreakdown.sizeMultiplier !== 1
                            ? ` ×${item.priceBreakdown.sizeMultiplier}`
                            : ""
                          } = ₹{item.priceBreakdown.effectiveRatePerKg}/kg
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold">₹{item.totalPayable.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 1. Delivery Address – read-only, from cart sidebar */}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
              <h2 className="text-xl font-bold">Delivery Address</h2>
            </div>

            {selectedAddress ? (
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm uppercase tracking-tight text-primary">
                        {selectedAddress.label || "Home"}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground">{selectedAddress.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {selectedAddress.street}
                      {selectedAddress.area ? `, ${selectedAddress.area}` : ""}
                      {`, ${selectedAddress.city}`}
                      {selectedAddress.state ? `, ${selectedAddress.state}` : ""}
                      {` – ${selectedAddress.pincode}`}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {selectedAddress.phone}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground italic border-t border-primary/10 pt-2">
                  To change the address, go back to your cart and update your delivery location.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">No delivery address selected.</p>
                <p className="text-xs text-muted-foreground mt-1">Please add an address from your cart first.</p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go back to Cart
                </Button>
              </div>
            )}
          </section>

          {/* Applied Coupons (if any) */}
          {appliedCoupons.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-offer-green/10">
                  <Ticket className="h-4 w-4 text-offer-green" />
                </div>
                <h2 className="text-xl font-bold">Applied Coupons</h2>
              </div>
              <div className="space-y-2">
                {appliedCoupons.map((c) => (
                  <div key={c.code} className="flex items-center justify-between rounded-xl border border-offer-green/30 bg-offer-green/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-offer-green" />
                      <div>
                        <p className="text-sm font-semibold text-offer-green">{c.code}</p>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-offer-green">
                      {c.discountType === "free_delivery"
                        ? "Free delivery"
                        : c.discountType === "flat"
                          ? `-₹${c.discountValue}`
                          : `-₹${Math.min(Math.round((totalPrice * c.discountValue) / 100), totalPrice)}`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Referral code — only affects the referrer's own account, never
              this order's price, so there's nothing to validate inline. */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Referral Code</h2>
            </div>
            <input
              type="text"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
              placeholder="Friend's referral code (optional)"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium tracking-wide placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-muted-foreground">
              New customers only — applying one does not change your total.
            </p>
          </section>

          {/* 2. Delivery Slot */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
              <h2 className="text-xl font-bold">Delivery Slot</h2>
            </div>
            {!deliveryMetadata.isStoreOpen && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">
                  Shop is closed right now. Scheduled ordering is still available.
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Quick delivery is off. Please choose a morning or evening slot.
                </p>
              </div>
            )}
            <div className="space-y-3">
              {/* Instant */}
              <div
                onClick={() => {
                  if (isInstantAvailable) {
                    setSelectedSlot("instant");
                    // Instant is always today; a date left over from a
                    // previously picked scheduled slot would be sent with it.
                    setSelectedDeliveryDate(null);
                  }
                }}
                className={`rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                  isInstantAvailable
                    ? `cursor-pointer ${selectedSlot === "instant" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`
                    : "cursor-not-allowed border-border bg-muted/40 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-sm">Instant Delivery (30-45 mins)</p>
                    <p className="text-xs text-muted-foreground">
                      {isInstantAvailable
                        ? "Our rider will be at your doorstep shortly"
                        : deliveryMetadata.isStoreOpen
                          ? "Quick delivery is off right now"
                          : "Quick delivery is off while the shop is closed"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isInstantAvailable ? (
                    <>
                      <p className="text-xs font-bold text-destructive">+₹{deliveryMetadata.instantFee} extra</p>
                      {selectedSlot === "instant" && <CheckCircle2 className="h-5 w-5 text-primary ml-auto mt-1" />}
                    </>
                  ) : (
                    <p className="text-xs font-bold text-muted-foreground">Quick delivery off</p>
                  )}
                </div>
              </div>

              {/* Scheduled slots, grouped by day. Rendered from what the
                  store actually offers rather than a fixed morning/evening
                  pair, and a full or closed slot stays visible-but-disabled so
                  the shopper can see why it isn't selectable. */}
              {scheduledSlotsByDate.map(([deliveryDate, slots]) => (
                <div key={deliveryDate} className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {slots[0]?.dateLabel ?? deliveryDate}
                  </p>
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot === slot.key && selectedDeliveryDate === slot.deliveryDate;
                    return (
                      <div
                        key={`${slot.deliveryDate}-${slot.key}`}
                        onClick={() => {
                          if (!slot.isBookable) return;
                          setSelectedSlot(slot.key);
                          setSelectedDeliveryDate(slot.deliveryDate);
                        }}
                        className={`rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                          slot.isBookable
                            ? `cursor-pointer ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`
                            : "cursor-not-allowed border-border bg-muted/40 opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{slot.key === "morning" ? "\u{1F305}" : "\u{1F306}"}</span>
                          <div>
                            <p className="font-bold text-sm">{slot.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {slot.isFull
                                ? "Fully booked for this day"
                                : slot.isPastCutoff
                                  ? "Ordering has closed for this slot"
                                  : slot.remaining <= 5
                                    ? `Only ${slot.remaining} left for this slot`
                                    : "Delivered within your chosen window"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {slot.isBookable ? (
                            <>
                              <p className="text-xs font-semibold text-offer-green">Lowest charge</p>
                              {isSelected && <CheckCircle2 className="h-5 w-5 text-primary ml-auto mt-1" />}
                            </>
                          ) : (
                            <p className="text-xs font-bold text-muted-foreground">
                              {slot.isFull ? "Full" : "Closed"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {scheduledSlotsByDate.length === 0 && (
                <p className="rounded-xl border-2 border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No scheduled slots are available right now.
                </p>
              )}
            </div>
          </section>

          {/* 3. Payment Method */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</div>
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {ONLINE_METHODS.map(({ id, label, hint, Icon }) => {
                const active = paymentMethod === "RAZORPAY" && onlineMethod === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      setPaymentMethod("RAZORPAY");
                      setOnlineMethod(id);
                    }}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-bold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                      </div>
                    </div>
                    {active && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                );
              })}

              {/* Pay on Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                  paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className="font-bold text-sm">Pay on Delivery</p>
                    <p className="text-xs text-muted-foreground">Cash, UPI or Card at your doorstep</p>
                  </div>
                </div>
                {paymentMethod === "COD" && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Bill Summary */}
        {/* Not `self-start`: the column must stay stretched to the row height,
            or the sticky child would only have its own short box to travel in
            and would scroll away again once past it. */}
        <div className="lg:col-span-1">
           {/* Scrolls internally on short viewports so a tall bill summary
               stays fully reachable instead of having its footer cut off. */}
           <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
             <BillSummary
                itemTotal={activeQuote?.itemTotal ?? totalPrice}
                deliveryCharge={activeQuote?.deliveryCharge ?? deliveryCharge}
                extraCharge={activeQuote?.slotExtraCharge ?? slotExtraCharge}
                extraChargeLabel="Instant Delivery Fee"
                packagingCharge={activeQuote?.packagingCharge ?? packagingCharge}
                gstAmount={activeQuote?.gstAmount ?? gstAmount}
                discount={activeQuote?.discount ?? discount}
                totalPayable={activeQuote?.grandTotal}
                discountBreakdown={discountBreakdown}
                onPlaceOrder={handlePlaceOrder}
                actionLabel={retryOrderId ? "Retry Payment" : "Place Order"}
                isLoading={isPlacingOrder}
                disabled={
                  !selectedAddress ||
                  !selectedLocation?.storeId ||
                  !selectedSlot ||
                  (selectedSlot !== "instant" && !selectedDeliveryDate)
                }
             />

             {/* Trusted Badges */}
             <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="flex flex-col items-center gap-1">
                   <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">🛡️</div>
                   <span className="text-[9px] font-bold uppercase tracking-tighter">Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">📦</div>
                   <span className="text-[9px] font-bold uppercase tracking-tighter">Contactless</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">🌱</div>
                   <span className="text-[9px] font-bold uppercase tracking-tighter">Eco Friendly</span>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
