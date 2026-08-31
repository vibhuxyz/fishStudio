import CouponSheet from "@/components/shared/coupon-sheet";
import SlotSheet from "@/components/shared/slot-sheet";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { useDeliverySlotStore } from "@/lib/delivery-slot-store";
import { useStore } from "@/store";
import { SLOT_OPTIONS, SCHEDULED_SLOTS } from "@/constants/delivery-slots";
import axiosInstance from "@/utils/axiosInstance";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { createOrderSchema } from "@repo/zod-schema";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeModules,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────
// Mirrors createOrderSchema's paymentMethod enum in @repo/zod-schema — the
// server only recognizes COD/ONLINE/RAZORPAY, not the upi/card split.
type PaymentMethod = "RAZORPAY" | "COD";

// Which rail Razorpay opens on (`prefill.method`). Picking one here saves the
// shopper a tap inside the gateway sheet; the order is still placed as
// RAZORPAY because the rail isn't something the order schema records.
type OnlineRail = "upi" | "card" | "netbanking" | "wallet";

const ONLINE_METHODS: {
  id: OnlineRail;
  label: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}[] = [
  { id: "upi", label: "UPI", subtitle: "GPay, PhonePe, Paytm & more", icon: "cellphone" },
  { id: "card", label: "Credit / Debit Card", subtitle: "Visa, Mastercard, RuPay & Amex", icon: "credit-card-outline" },
  { id: "netbanking", label: "Net Banking", subtitle: "All major banks supported", icon: "bank-outline" },
  { id: "wallet", label: "Wallets", subtitle: "Paytm, Freecharge, Mobikwik & more", icon: "wallet-outline" },
];

// The UPI app itself is chosen inside Razorpay's intent sheet — standard
// checkout hands the payment to whichever app the customer taps there. These
// are shown so the rail is recognisable, not as separate destinations.
const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];

// Razorpay bank codes for `prefill.bank`.
const NETBANKING_BANKS = [
  { code: "SBIN", label: "SBI" },
  { code: "HDFC", label: "HDFC Bank" },
  { code: "ICIC", label: "ICICI Bank" },
  { code: "UTIB", label: "Axis Bank" },
  { code: "KKBK", label: "Kotak" },
];

// Razorpay wallet codes for `prefill.wallet`.
const WALLETS = [
  { code: "paytm", label: "Paytm" },
  { code: "freecharge", label: "Freecharge" },
  { code: "mobikwik", label: "Mobikwik" },
];

// Every shape a stalled online payment can land in. Only the genuinely
// retryable ones are represented here — cases where the order itself is dead
// (cancelled, already paid, its payment record is gone, gateway unavailable)
// are resolved immediately wherever they're detected instead of being stored,
// so anything sitting in this state is always safe to hand back to "Retry
// Payment" rather than a button that fails the same way forever.
type PaymentIssueCode = "NETWORK" | "SERVER_ERROR" | "PAYMENT_CANCELLED" | "PAYMENT_START_FAILED";

interface PaymentIssue {
  orderId: string;
  code: PaymentIssueCode;
}

const PAYMENT_ISSUE_MESSAGES: Record<PaymentIssueCode, string> = {
  NETWORK: "Connection lost. Your order is still waiting for payment.",
  SERVER_ERROR: "We're having trouble processing your payment. Please try again.",
  PAYMENT_CANCELLED: "Payment cancelled. Complete payment to confirm your order.",
  // Deliberately doesn't say "cancelled" — RazorpayCheckout.open() rejects
  // for a mix of reasons (bad options, TLS, an incompatible plugin, etc.),
  // and calling every one of them "cancelled" was itself the bug: it told
  // the customer something untrue about what happened.
  PAYMENT_START_FAILED: "Payment could not be completed. Your order is still waiting for payment.",
};

// RazorpayCheckout.open() rejects with { code, description } from the native
// SDK (react-native-razorpay's RazorpayModule.onPaymentError). `code` is an
// integer whose meaning isn't verifiable from this repo (it comes from the
// compiled native Razorpay SDK, not anything checked into source), so it's
// logged for diagnosis rather than trusted for classification. `description`
// is the one field Razorpay reliably populates with human text, and for a
// user-dismissed checkout that text reliably mentions "cancel" — that's the
// only case worth naming as such; everything else is an honest "could not
// complete", not a guess dressed up as "cancelled".
const isUserCancellation = (error: any): boolean =>
  typeof error?.description === "string" && error.description.toLowerCase().includes("cancel");

// Backend codes (payment-service's createPaymentOrder) that mean this exact
// order can never be paid — no retry will ever succeed against it.
const DEAD_ORDER_CODES = new Set(["ORDER_CANCELLED", "PAYMENT_RECORD_MISSING", "ORDER_STATE_CHANGED"]);

// react-native-razorpay ships real native Android/iOS code (see its
// android/.../RazorpayModule.java) — Expo Go's precompiled binary only
// includes Expo's own SDK modules, so RNRazorpayCheckout is never registered
// there and RazorpayCheckout.open() throws "Cannot read property 'open' of
// null" the instant it's called. That reads exactly like a payment failure
// (and used to get misclassified as "cancelled"), but no amount of retrying
// fixes it — it needs a custom dev-client build, not a different tap.
const isRazorpayAvailable = () => !!NativeModules.RNRazorpayCheckout;

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const { user } = useUser();
  const { cart, clearCart } = useStore();
  const { selectedLocation, setSelectedLocation, getSelectedAddress } = useAddressStore();
  const {
    appliedCoupons,
    availableCoupons,
    applyCoupon,
    removeCoupon,
    clearAllCoupons,
    isCouponApplied,
    getDiscountForCoupon,
    getTotalDiscount,
    fetchAvailableCoupons,
  } = useCouponStore();

  const {
    selectedSlot, instantFee, setSlotAvailability,
    gstRate, packagingCharge, baseDeliveryCharge: sellerDeliveryCharge, freeDeliveryThreshold,
    setBillConfig,
  } = useDeliverySlotStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [onlineRail, setOnlineRail] = useState<OnlineRail | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  // Short status shown on the CTA while isPlacingOrder is true — the request
  // is a single round trip per step, but naming the step makes the wait read
  // as progress instead of a frozen button.
  const [placingStage, setPlacingStage] = useState<string | null>(null);
  const [couponSheetOpen, setCouponSheetOpen] = useState(false);
  const [slotSheetOpen, setSlotSheetOpen] = useState(false);
  // Only rewards the referrer, and only on the referee's genuine first
  // order — order-service silently no-ops it otherwise, so there's no
  // separate "invalid code" state to show here.
  const [referralCodeInput, setReferralCodeInput] = useState("");

  // A payment that didn't complete this round but is still safe to retry
  // against the same order. See PaymentIssueCode for what "safe" excludes.
  const [paymentIssue, setPaymentIssue] = useState<PaymentIssue | null>(null);
  const paymentIssueRef = useRef<PaymentIssue | null>(null);

  const selectedAddress = getSelectedAddress();
  const slot = SLOT_OPTIONS.find((s) => s.key === selectedSlot);
  const razorpayAvailable = isRazorpayAvailable();

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [cart],
  );

  // Fetch coupons when store is known
  useEffect(() => {
    if (selectedLocation?.storeId) {
      fetchAvailableCoupons(selectedLocation.storeId, user?.id);
    }
  }, [selectedLocation?.storeId, user?.id, fetchAvailableCoupons]);

  // Resolve store from address pincode if not set
  useEffect(() => {
    if (selectedLocation?.storeId || !selectedAddress?.pincode) return;
    axiosInstance
      .get(`/auth/api/check-pincode?pincode=${selectedAddress.pincode}`)
      .then(({ data }) => {
        if (data.success && data.store?.id) {
          setSelectedLocation({
            storeId: data.store.id,
            storeName: data.store.name,
            pincode: selectedAddress.pincode,
            city: selectedAddress.city || data.store.city || "",
            deliveryTimeMinutes: data.store.cityDeliveryTimes?.[selectedAddress.city],
            isOpen: data.store.isOpen,
            openingHours: data.store.opening_hours,
            closingHours: data.store.closing_hours,
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId, selectedAddress?.pincode]);

  // The slot sheet on this screen offers "instant" based on availableSlots,
  // which was previously only kept fresh by the cart tab's own validate-cart
  // effect — this screen shouldn't depend on another screen's timer for its
  // own correctness, so re-check independently while checkout is open (e.g.
  // a shopper who lingers here past the store's closing time).
  useEffect(() => {
    const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
    const city = selectedLocation?.city || selectedAddress?.city;
    if (cart.length === 0 || !pincode) return;

    const validateCart = () => {
      const cartItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
        size: item.selectedSize || undefined,
        // Sent on every line, not just combo members: this array is also what
        // gets persisted as the server-side cart, and a line restored on the
        // web without its cutting type and size is not the same line.
        cuttingType: item.cuttingType || undefined,
        pieceSize: item.pieceSize || undefined,
        ...(item.comboId ? { comboId: item.comboId } : {}),
      }));
      axiosInstance
        .post("/product/api/validate-cart", {
          cartItems,
          pincode,
          city,
          storeId: selectedLocation?.storeId || undefined,
        })
        .then(({ data }) => {
          if (data.success) {
            setSlotAvailability(data.availableSlots || SCHEDULED_SLOTS, data.instantFee || 20);
            setBillConfig({
              gstRate: data.gstRate ?? 0,
              packagingCharge: data.packagingCharge ?? 0,
              baseDeliveryCharge: data.baseDeliveryCharge ?? 49,
              freeDeliveryThreshold: data.freeDeliveryThreshold ?? 500,
            });
          }
        })
        .catch(() => {});
    };

    validateCart();
    const id = setInterval(validateCart, 60_000);
    return () => clearInterval(id);
  }, [cart.length, selectedLocation?.storeId, selectedLocation?.pincode, selectedAddress?.pincode]);

  // Leaving with an unpaid order would hold its stock reservation until the
  // sweeper runs — release it as soon as the customer walks away.
  useEffect(
    () => () => {
      if (paymentIssueRef.current) cancelUnpaidOrder(paymentIssueRef.current.orderId);
    },
    [],
  );

  const trackPaymentIssue = (issue: PaymentIssue | null) => {
    paymentIssueRef.current = issue;
    setPaymentIssue(issue);
  };

  const baseDelivery = subtotal >= freeDeliveryThreshold ? 0 : sellerDeliveryCharge;

  // A quantity change in the cart can drop the subtotal below an already
  // applied coupon's minimum — getDiscountForCoupon would then silently
  // clamp its saving to 0 while the UI still claimed it was applied.
  useEffect(() => {
    const applied = appliedCoupons[0];
    if (!applied || subtotal >= applied.minOrderValue) return;
    removeCoupon(applied.code);
    toast.info(`'${applied.code}' removed — order no longer meets its ₹${applied.minOrderValue} minimum`);
  }, [subtotal]);

  // ── Pricing ────────────────────────────────────────────────────────────────
  const isFreeDelivery = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && subtotal >= c.minOrderValue,
  );
  const deliveryCharge = isFreeDelivery ? 0 : baseDelivery;
  const slotExtraCharge = selectedSlot === "instant" ? instantFee : 0;
  const discount = Math.min(getTotalDiscount(subtotal), subtotal);
  const gstAmount = Math.round(subtotal * gstRate);
  const grandTotal = Math.max(
    0,
    subtotal - discount + deliveryCharge + slotExtraCharge + packagingCharge + gstAmount,
  );

  // The coupon store now holds at most one entry.
  const appliedCoupon = appliedCoupons[0] ?? null;
  const appliedCouponSaving = appliedCoupon ? getDiscountForCoupon(appliedCoupon, subtotal) : 0;

  // Order created with paymentMethod RAZORPAY is unpaid until verified.
  // Release it if the customer backs out before Razorpay hands us a payment.
  // order-service refuses this while a checkout is still within its settle
  // grace window (a webhook may confirm it any moment), so this can
  // legitimately no-op — callers that tell the user "cancelled" check the
  // return value rather than assuming success.
  const cancelUnpaidOrder = (orderId: string) =>
    axiosInstance
      .put(`/order/api/cancel/${orderId}`)
      .then(() => true)
      .catch(() => false);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // RazorpayCheckout.open() can reject even though the payment went through —
  // a UPI intent hand-off backgrounds the app, and the native success
  // callback isn't always reliable coming back from that. A webhook may have
  // already settled the order server-side, so ask before assuming failure;
  // guessing wrong here is what let a paid order get cancelled out from under
  // its own capture webhook (order-service then has to flag it for a manual
  // refund instead of just confirming it — see cancelOrder's settle guard).
  const fetchOrderPaymentStatus = async (orderId: string): Promise<string | null> => {
    try {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data?.order?.paymentStatus ?? null;
    } catch {
      return null;
    }
  };

  const startRazorpayPayment = async (orderId: string) => {
    let paymentAttempted = false;
    try {
      setPlacingStage("Opening payment…");
      const { data: rzp } = await axiosInstance.post("/payment/api/create-razorpay-order", {
        orderId,
      });

      const razorpayOptions = {
        key: rzp.keyId, // public key_id, supplied by the backend
        amount: rzp.amount, // in paise, computed server-side from the order
        currency: rzp.currency,
        order_id: rzp.razorpayOrderId,
        name: "Fish Studio",
        description: "Order payment",
        prefill: {
          name: selectedAddress?.name,
          contact: selectedAddress?.phone || user?.phone,
          email: user?.email,
          ...(onlineRail ? { method: onlineRail } : {}),
          ...(onlineRail === "netbanking" && selectedBank ? { bank: selectedBank } : {}),
          ...(onlineRail === "wallet" && selectedWallet ? { wallet: selectedWallet } : {}),
        },
        theme: { color: "#5A2C96" },
      };

      let result;
      try {
        console.log("[Checkout] Opening Razorpay", { orderId, razorpayOrderId: rzp.razorpayOrderId, method: onlineRail });
        result = await RazorpayCheckout.open(razorpayOptions);
        console.log("[Checkout] Razorpay success", result);
      } catch (checkoutError: any) {
        // Log the raw SDK error in full — code/description come from the
        // compiled native Razorpay SDK and aren't something this repo can
        // verify the meaning of ahead of time, so this is the only way to
        // see what actually happened here in production.
        console.log("[Checkout] Razorpay error", {
          code: checkoutError?.code,
          description: checkoutError?.description,
          raw: checkoutError,
        });

        // Don't take the rejection at face value — check twice, a few
        // seconds apart, for the webhook to have already settled this order
        // before telling the customer nothing was captured.
        setPlacingStage("Confirming payment status…");
        let status = await fetchOrderPaymentStatus(orderId);
        if (status !== "COMPLETED") {
          await wait(3000);
          status = await fetchOrderPaymentStatus(orderId);
        }
        console.log("[Checkout] Order payment status after Razorpay error", { orderId, status });

        if (status === "COMPLETED") {
          trackPaymentIssue(null);
          clearCart();
          clearAllCoupons();
          haptic.orderPlaced();
          toast.success("Payment successful!", { haptic: false });
          router.replace({
            pathname: "/(routes)/order-confirmation/[id]",
            params: { id: orderId },
          });
          return;
        }

        // Still not confirmed — nothing was captured, as far as we can tell.
        // Only call this "cancelled" when Razorpay's own description says so;
        // every other rejection (bad options, TLS, an incompatible plugin,
        // a network drop mid-checkout) used to get the same "cancelled" label,
        // which told the customer something that may not have been true. The
        // order stays reserved either way so "Retry Payment" can reuse it —
        // it's only released when the customer leaves the screen, and
        // order-service still holds that release if a payment turns out to
        // be in flight after all.
        const code: PaymentIssueCode = isUserCancellation(checkoutError)
          ? "PAYMENT_CANCELLED"
          : "PAYMENT_START_FAILED";
        trackPaymentIssue({ orderId, code });
        toast.error(checkoutError?.description || PAYMENT_ISSUE_MESSAGES[code]);
        return;
      }

      paymentAttempted = true;
      setPlacingStage("Verifying payment…");
      const { data: verified } = await axiosInstance.post("/payment/api/verify", {
        orderId,
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      console.log("[Checkout] Verify response", verified);

      if (!verified.success) {
        toast.error("Payment could not be verified. Please contact support.");
        return;
      }

      setPlacingStage("Confirming order…");
      trackPaymentIssue(null);
      clearCart();
      clearAllCoupons();
      haptic.orderPlaced();
      toast.success("Payment successful!", { haptic: false });
      router.replace({
        pathname: "/(routes)/order-confirmation/[id]",
        params: { id: orderId },
      });
    } catch (error: any) {
      console.log("[Checkout] Payment flow error", {
        paymentAttempted,
        status: error?.response?.status,
        code: error?.response?.data?.details?.code,
        message: error?.response?.data?.message || error?.message,
      });

      // Razorpay already handed us a payment by this point, so money has
      // very likely moved even though verify() itself failed — don't cancel,
      // the webhook / reconciliation sweep settles it instead.
      if (paymentAttempted) {
        trackPaymentIssue(null);
        toast.error("Payment verification failed. If money was deducted, it will be auto-confirmed shortly.");
      } else {
        // This is the create-razorpay-order call failing. payment-service now
        // tags known cases with a `code` (see DEAD_ORDER_CODES) instead of a
        // message the client would have to parse — a code in that set means
        // this exact order object can never be paid, and retrying it just
        // fails the same way forever with Razorpay never opening (reads as a
        // dead button). Drop the order so the next tap on Pay builds a fresh
        // one instead of retrying something structurally unpayable.
        const backendCode = error?.response?.data?.details?.code as string | undefined;
        const backendMessage = error?.response?.data?.message as string | undefined;
        const status = error?.response?.status;

        if (backendCode === "ORDER_PAID") {
          // A previous attempt already settled this order (e.g. two retries
          // raced) — that's success, not a dead end.
          trackPaymentIssue(null);
          clearCart();
          clearAllCoupons();
          haptic.orderPlaced();
          toast.success("Payment already completed!", { haptic: false });
          router.replace({
            pathname: "/(routes)/order-confirmation/[id]",
            params: { id: orderId },
          });
        } else if (backendCode === "PAYMENT_GATEWAY_UNAVAILABLE") {
          trackPaymentIssue(null);
          toast.error(backendMessage || "Online payments aren't available right now. Please use Cash on Delivery.");
        } else if (backendCode ? DEAD_ORDER_CODES.has(backendCode) : typeof status === "number" && status < 500) {
          // Known dead codes, or an unrecognized 4xx — either way this order
          // won't become payable by tapping the same button again.
          trackPaymentIssue(null);
          toast.error(backendMessage || "This order can no longer be paid. Please place a new order.");
        } else {
          trackPaymentIssue({ orderId, code: typeof status === "number" ? "SERVER_ERROR" : "NETWORK" });
          toast.error("Could not start payment. Please check your connection and try again.");
        }
      }
    } finally {
      setIsPlacingOrder(false);
      setPlacingStage(null);
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address in your cart");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsPlacingOrder(true);
    setPlacingStage("Validating your order…");

    // storeId is usually resolved by the time the button is tapped, but the
    // lookup runs in the background off the address's pincode — give it one
    // more chance here instead of failing a checkout the customer is clearly
    // ready to complete.
    let storeId = selectedLocation?.storeId;
    if (!storeId && selectedAddress.pincode) {
      try {
        const { data } = await axiosInstance.get(
          `/auth/api/check-pincode?pincode=${selectedAddress.pincode}`,
        );
        if (data.success && data.store?.id) {
          storeId = data.store.id;
          setSelectedLocation({
            storeId: data.store.id,
            storeName: data.store.name,
            pincode: selectedAddress.pincode,
            city: selectedAddress.city || data.store.city || "",
            deliveryTimeMinutes: data.store.cityDeliveryTimes?.[selectedAddress.city],
            isOpen: data.store.isOpen,
            openingHours: data.store.opening_hours,
            closingHours: data.store.closing_hours,
          });
        }
      } catch {
        // fall through — the missing-storeId check below reports it
      }
    }
    if (!storeId) {
      toast.error("Please set your delivery location");
      setIsPlacingOrder(false);
      setPlacingStage(null);
      return;
    }

    // A previous attempt already reserved stock for this cart — pay for that
    // order rather than creating a second one. Switching to COD can't reuse it
    // (the order is bound to a gateway payment), so release it and start over.
    if (paymentIssue) {
      if (paymentMethod === "RAZORPAY") {
        await startRazorpayPayment(paymentIssue.orderId);
        return;
      }
      const released = await cancelUnpaidOrder(paymentIssue.orderId);
      if (!released) {
        // A payment may still be in flight on that order — creating a fresh
        // COD order now would reserve the same stock twice.
        toast.error("Still confirming your previous payment attempt. Please try again in a few minutes.");
        setIsPlacingOrder(false);
        setPlacingStage(null);
        return;
      }
      trackPaymentIssue(null);
    }

    try {
      const orderPayload = {
        storeId,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          selectedOptions: {
            cuttingType: item.cuttingType || "",
            pieceSize: item.pieceSize || "",
            size: item.selectedSize || "",
            // Tags this line as a combo bundle member so order-service
            // reprices the whole group to the bundle price at checkout.
            ...(item.comboId ? { comboId: item.comboId } : {}),
            ...(item.priceBreakdown || {}),
          },
        })),
        deliveryDetails: {
          name: selectedAddress.name,
          phone: selectedAddress.phone || user?.phone || "",
          address: `${selectedAddress.street}${selectedAddress.area ? `, ${selectedAddress.area}` : ""}`,
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
          itemTotal: subtotal,
          deliveryCharge,
          packagingCharge,
          gstAmount,
          discount,
          discountBreakdown: appliedCoupon
            ? [{ code: appliedCoupon.code, amount: appliedCouponSaving }]
            : [],
        },
        totalAmount: grandTotal,
        paymentMethod,
        deliverySlot: selectedSlot,
        // Order-service's couponCode is a single exact-match lookup against
        // discount_codes — sending more than one code here (the old
        // join(",")) never matches a real discountCode and createOrder
        // rejects the whole order. Event-derived offers (Flash Sale /
        // seasonal Discount / Free Delivery banners) aren't discount_codes
        // rows at all — they go through eventId instead, or the same
        // "invalid coupon" rejection happens for a different reason (no
        // discountCode ever existed for the fabricated event label).
        couponCode: appliedCoupon && !appliedCoupon.isEvent ? appliedCoupon.code : undefined,
        eventId: appliedCoupon?.isEvent ? appliedCoupon.eventId : undefined,
        referralCode: referralCodeInput.trim() || undefined,
        discountAmount: discount,
      };

      // Same schema the backend validates against (order-service's
      // createOrder) — catches malformed requests before they hit the network.
      const validation = createOrderSchema.safeParse(orderPayload);
      if (!validation.success) {
        toast.error(validation.error.errors[0]?.message || "Please check your order details");
        return;
      }

      setPlacingStage("Reserving your items…");
      const { data } = await axiosInstance.post("/order/api/create", orderPayload);

      if (paymentMethod === "RAZORPAY") {
        // Online payment: keep the loading state until checkout resolves.
        await startRazorpayPayment(data.orderId);
        return;
      }

      clearCart();
      clearAllCoupons();
      haptic.orderPlaced();
      toast.success("Order placed successfully!", { haptic: false });
      router.replace({
        pathname: "/(routes)/order-confirmation/[id]",
        params: { id: data.orderId },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
      setPlacingStage(null);
    }
  };

  const handleAbandonOrder = async () => {
    if (!paymentIssue) return;
    // order-service can refuse this while it's still within the settle
    // grace window — don't tell the customer it's cancelled unless it is.
    const cancelled = await cancelUnpaidOrder(paymentIssue.orderId);
    if (cancelled) {
      trackPaymentIssue(null);
      toast.info("Order cancelled. Your cart is still here.");
    } else {
      toast.info("Still confirming your payment — try cancelling again in a few minutes.");
    }
  };

  const selectOnlineRail = (rail: OnlineRail) => {
    setPaymentMethod("RAZORPAY");
    setOnlineRail(rail);
  };

  // ── Guard: not logged in ────────────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
        <PageHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="lock-closed-outline" size={56} color="#A1A1AA" />
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#1A1C1C", marginTop: 20, marginBottom: 8 }}>
            Not logged in
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(routes)/login")}
            style={{ backgroundColor: "#5A2C96", width: "100%", paddingVertical: 16, borderRadius: 50, alignItems: "center", marginTop: 16 }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#FFFFFF" }}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cart.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
        <PageHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="bag-handle-outline" size={56} color="#A1A1AA" />
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#1A1C1C", marginTop: 20, marginBottom: 8 }}>
            Your cart is empty
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={{ backgroundColor: "#5A2C96", width: "100%", paddingVertical: 16, borderRadius: 50, alignItems: "center", marginTop: 16 }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#FFFFFF" }}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Address is picked in the cart — checkout can't recover from it being gone.
  if (!selectedAddress) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
        <PageHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="location-outline" size={56} color="#A1A1AA" />
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#1A1C1C", marginTop: 20, marginBottom: 8 }}>
            No delivery address
          </Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: "#676968", textAlign: "center" }}>
            Choose where this order should go from your cart.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/cart")}
            style={{ backgroundColor: "#5A2C96", width: "100%", paddingVertical: 16, borderRadius: 50, alignItems: "center", marginTop: 20 }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#FFFFFF" }}>Back to Cart</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // storeId resolves asynchronously from the address pincode (see the effect
  // above) — gating on it here made the button look stuck disabled for that
  // window even with address, slot and payment all chosen. It's still
  // required to submit, just checked at that point instead.
  const canPlaceOrder = !isPlacingOrder && !!selectedAddress && !!selectedSlot && !!paymentMethod;

  // COD isn't a payment happening now, so it keeps the neutral "Place Order";
  // every online rail is a real charge, so the CTA says what it does.
  const ctaLabel = !paymentMethod
    ? "Select a payment method"
    : paymentIssue && paymentMethod === "RAZORPAY"
      ? "Retry Payment"
      : paymentMethod === "COD"
        ? "Place Order"
        : `Pay ₹${grandTotal.toFixed(0)}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      <PageHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Delivery slot ────────────────────────────────────────── */}
        <SectionTitle title="Delivery" />
        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={() => setSlotSheetOpen(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#E2E2E2",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3EEFB", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Ionicons name="time-outline" size={20} color="#5A2C96" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C" }}>
                {slot ? `${slot.name} · ${slot.time}` : "Select a slot"}
              </Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: "#898B8A", marginTop: 2 }}>
                Delivering to {selectedAddress.label} · {selectedAddress.city}
                {slotExtraCharge > 0 ? ` · +₹${slotExtraCharge} fee` : ""}
              </Text>
            </View>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: "#5A2C96" }}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* ── Payment Method ───────────────────────────────────────── */}
        <SectionTitle title="Payment Method" />
        <View style={{ paddingHorizontal: 16 }}>
          {!razorpayAvailable && (
            <View
              style={{
                backgroundColor: "#FFF7ED",
                borderWidth: 1,
                borderColor: "#FDBA74",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#9A3412" }}>
                Online payment needs a custom dev-client build — it is not available in Expo Go. Use Cash on Delivery for now.
              </Text>
            </View>
          )}
          {ONLINE_METHODS.map((method) => {
            const active = paymentMethod === "RAZORPAY" && onlineRail === method.id;
            return (
              <View key={method.id}>
                <PaymentOption
                  selected={active}
                  onPress={() => selectOnlineRail(method.id)}
                  icon={<MaterialCommunityIcons name={method.icon} size={22} color="#5A2C96" />}
                  label={method.label}
                  subtitle={method.subtitle}
                  disabled={!razorpayAvailable}
                />
                {active && method.id === "upi" && (
                  <RailDetail note="Pick your UPI app in the secure Razorpay window — it opens the app to approve the payment.">
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {UPI_APPS.map((app) => (
                        <View
                          key={app}
                          style={{
                            borderWidth: 1,
                            borderColor: "#E2E2E2",
                            borderRadius: 50,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: "#FFFFFF",
                          }}
                        >
                          <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#676968" }}>
                            {app}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </RailDetail>
                )}
                {active && method.id === "card" && (
                  <RailDetail note="Card number, expiry and CVV are entered on Razorpay's PCI-compliant screen — they never touch this app." />
                )}
                {active && method.id === "netbanking" && (
                  <RailDetail note="Pick your bank to land straight on its login page.">
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {NETBANKING_BANKS.map((bank) => {
                        const chosen = selectedBank === bank.code;
                        return (
                          <TouchableOpacity
                            key={bank.code}
                            onPress={() => setSelectedBank(chosen ? null : bank.code)}
                            activeOpacity={0.8}
                            style={{
                              borderWidth: 1.5,
                              borderColor: chosen ? "#5A2C96" : "#E2E2E2",
                              backgroundColor: chosen ? "#F1ECF8" : "#FFFFFF",
                              borderRadius: 50,
                              paddingHorizontal: 14,
                              paddingVertical: 7,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Inter-SemiBold",
                                fontSize: 12,
                                color: chosen ? "#5A2C96" : "#676968",
                              }}
                            >
                              {bank.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </RailDetail>
                )}
                {active && method.id === "wallet" && (
                  <RailDetail note="Pick a wallet to skip the selection step inside Razorpay.">
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {WALLETS.map((wallet) => {
                        const chosen = selectedWallet === wallet.code;
                        return (
                          <TouchableOpacity
                            key={wallet.code}
                            onPress={() => setSelectedWallet(chosen ? null : wallet.code)}
                            activeOpacity={0.8}
                            style={{
                              borderWidth: 1.5,
                              borderColor: chosen ? "#5A2C96" : "#E2E2E2",
                              backgroundColor: chosen ? "#F1ECF8" : "#FFFFFF",
                              borderRadius: 50,
                              paddingHorizontal: 14,
                              paddingVertical: 7,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "Inter-SemiBold",
                                fontSize: 12,
                                color: chosen ? "#5A2C96" : "#676968",
                              }}
                            >
                              {wallet.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </RailDetail>
                )}
              </View>
            );
          })}
          <PaymentOption
            selected={paymentMethod === "COD"}
            onPress={() => {
              setPaymentMethod("COD");
              setOnlineRail(null);
            }}
            icon={<MaterialCommunityIcons name="cash" size={22} color="#676968" />}
            label="Cash on Delivery"
            badge="AVAILABLE"
          />
        </View>

        {/* ── Coupon ───────────────────────────────────────────────── */}
        <SectionTitle title={appliedCoupon ? "Applied Coupon" : "Coupons"} />
        <View style={{ paddingHorizontal: 16 }}>
          {appliedCoupon ? (
            <TouchableOpacity
              onPress={() => setCouponSheetOpen(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(90, 44, 150,0.1)",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#5A2C96", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#300861" }}>
                  {appliedCoupon.code}
                </Text>
                <Text style={{ fontFamily: "Inter-Medium", fontSize: 12, color: "#5A2C96", marginTop: 1 }}>
                  {appliedCouponSaving > 0 ? `Saved ₹${appliedCouponSaving}` : "Free delivery"}
                </Text>
              </View>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: "#5A2C96" }}>
                Change
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setCouponSheetOpen(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderWidth: 1.5,
                borderColor: "#E2E2E2",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#5A2C96" />
              <Text style={{ flex: 1, fontFamily: "Inter-SemiBold", fontSize: 14, color: "#1A1C1C", marginLeft: 10 }}>
                View all coupons
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Referral code ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#E2E2E2",
              borderRadius: 16,
              paddingHorizontal: 16,
            }}
          >
            <MaterialCommunityIcons name="account-heart-outline" size={20} color="#5A2C96" />
            <TextInput
              value={referralCodeInput}
              onChangeText={(t) => setReferralCodeInput(t.toUpperCase())}
              placeholder="Friend's referral code (optional)"
              placeholderTextColor="#A1A1AA"
              autoCapitalize="characters"
              style={{ flex: 1, marginLeft: 10, paddingVertical: 14, fontFamily: "Inter-SemiBold", fontSize: 13, color: "#1A1C1C" }}
            />
          </View>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#898B8A", marginTop: 6, marginLeft: 4 }}>
            New customers only — applying one does not change your total.
          </Text>
        </View>

        {/* ── Bill Summary ─────────────────────────────────────────── */}
        {/* Items were already reviewed in the cart — checkout only needs the
            numbers, not another scroll of images and names. */}
        <SectionTitle title="Bill Summary" />
        <View style={{ paddingHorizontal: 16 }}>
          <BillRow label={`Items (${cart.length})`} value={`₹${subtotal.toFixed(2)}`} />
          {discount > 0 && appliedCoupon && (
            <BillRow
              label={`Coupon (${appliedCoupon.code})`}
              value={`-₹${discount.toFixed(2)}`}
              valueColor="#22C55E"
            />
          )}
          <BillRow
            label="Delivery Fee"
            value={deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}.00`}
            strikeValue={deliveryCharge === 0 && baseDelivery > 0 ? `₹${baseDelivery}.00` : undefined}
            valueColor={deliveryCharge === 0 ? "#22C55E" : undefined}
          />
          {slotExtraCharge > 0 && (
            <BillRow label="Instant delivery" value={`₹${slotExtraCharge}.00`} />
          )}
          <BillRow label="Packaging Charges" value={`₹${packagingCharge}.00`} />
          <BillRow label="Taxes (incl. GST)" value={`₹${gstAmount}.00`} />

          {/* Total */}
          <View style={{ height: 1, backgroundColor: "#EFEFEF", marginVertical: 12 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#1A1C1C" }}>Total Amount</Text>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#5A2C96" }}>
              ₹{grandTotal.toFixed(2)}
            </Text>
          </View>

          {/* Footer note */}
          <Text style={{
            fontFamily: "Inter-Regular",
            fontSize: 9,
            color: "#A1A1AA",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginTop: 16,
            lineHeight: 14,
          }}>
            By placing an order, you agree to our{"\n"}Terms of Service and Freshness Guarantee.
          </Text>
        </View>
      </ScrollView>

      {/* ── Sticky pay bar ───────────────────────────────────────────── */}
      <View style={{ backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#EFEFEF", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
        {paymentIssue && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={{ flex: 1, fontFamily: "Inter-Medium", fontSize: 12, color: "#DC2626", marginLeft: 6 }}>
              {PAYMENT_ISSUE_MESSAGES[paymentIssue.code]}
            </Text>
            <TouchableOpacity onPress={handleAbandonOrder} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#676968" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginRight: 14 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#1A1C1C" }}>
              ₹{grandTotal.toFixed(0)}
            </Text>
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 10, color: "#898B8A" }}>Total</Text>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={!canPlaceOrder}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={["#0DB3D9", "#5A2C96"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 50,
                paddingVertical: 16,
                alignItems: "center",
                opacity: canPlaceOrder ? 1 : 0.5,
              }}
            >
              {isPlacingOrder ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#FFFFFF" }}>
                    {placingStage || "Processing…"}
                  </Text>
                </View>
              ) : (
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#FFFFFF", letterSpacing: 0.3 }}>
                  {ctaLabel}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <SlotSheet visible={slotSheetOpen} onClose={() => setSlotSheetOpen(false)} />

      <CouponSheet
        visible={couponSheetOpen}
        onClose={() => setCouponSheetOpen(false)}
        subtotal={subtotal}
        deliveryCharge={baseDelivery}
        storeId={selectedLocation?.storeId}
      />
    </SafeAreaView>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
        <Ionicons name="arrow-back" size={22} color="#300861" />
      </TouchableOpacity>
      <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#300861", letterSpacing: -0.3, lineHeight: 26 }}>
        {"MEAT. FISH.\nREPEAT"}
      </Text>
    </View>
  );
}

function SectionTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 }}>
      <Text style={{ fontFamily: "Inter-Bold", fontSize: 22, color: "#1A1C1C" }}>{title}</Text>
      {right}
    </View>
  );
}

/** Expanded body under a selected online rail. */
function RailDetail({ note, children }: { note: string; children?: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "#F6F4FA",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        gap: 10,
      }}
    >
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: "#676968", lineHeight: 17 }}>
        {note}
      </Text>
      {children}
    </View>
  );
}

function PaymentOption({
  selected,
  onPress,
  icon,
  label,
  subtitle,
  badge,
  disabled,
}: {
  selected: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F3F3",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {/* Radio */}
      <View style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: selected ? 6 : 2,
        borderColor: selected ? "#5A2C96" : "#A1A1AA",
        marginRight: 14,
      }} />

      {/* Icon */}
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#F3F3F3", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        {icon}
      </View>

      {/* Label */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: "#1A1C1C" }}>{label}</Text>
        {subtitle && <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: "#898B8A", marginTop: 1 }}>{subtitle}</Text>}
      </View>

      {badge && (
        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: "#A1A1AA", letterSpacing: 0.5 }}>{badge}</Text>
      )}
    </TouchableOpacity>
  );
}

function BillRow({ label, value, strikeValue, valueColor }: {
  label: string;
  value: string;
  strikeValue?: string;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: "#676968" }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {strikeValue && (
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#A1A1AA", textDecorationLine: "line-through" }}>
            {strikeValue}
          </Text>
        )}
        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: valueColor || "#1A1C1C" }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
