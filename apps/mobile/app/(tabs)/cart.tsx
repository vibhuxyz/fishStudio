import useUser from "@/hooks/useUser";
import { CartItem, useStore } from "@/store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { useDeliverySlotStore } from "@/lib/delivery-slot-store";
import { SLOT_OPTIONS, formatSlotLabel } from "@/constants/delivery-slots";
import {
  BASE_DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD,
  GST_RATE,
  PACKAGING_CHARGE,
} from "@/constants/pricing";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Offer = {
  code: string;
  description: string;
  discountType: "percent" | "flat" | "free_delivery";
  discountValue: number;
  minOrderValue: number;
  badge?: string;
  isEvent?: boolean;
};

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity, checkAndIncrement } = useStore();
  const { user } = useUser();
  const { selectedLocation, getSelectedAddress, addresses } = useAddressStore();
  const { selectedSlot, setSelectedSlot } = useDeliverySlotStore();
  const {
    appliedCoupons,
    applyCoupon,
    isCouponApplied,
    getDiscountForCoupon,
    getTotalDiscount,
    validateCouponCode,
  } = useCouponStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [incrementingKey, setIncrementingKey] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    isStoreOpen: boolean;
    cartDeliveryTime: number | null;
    storeName: string | null;
    openingHours: string | null;
  }>({ isStoreOpen: true, cartDeliveryTime: null, storeName: null, openingHours: null });

  const selectedAddress = getSelectedAddress();

  // Auto-resolve storeId from selected address pincode
  useEffect(() => {
    if (selectedLocation?.storeId) return;
    if (!selectedAddress?.pincode) return;

    axiosInstance
      .get(`/auth/api/check-pincode?pincode=${selectedAddress.pincode}`)
      .then(({ data }) => {
        if (data.success && data.store?.id) {
          const { setSelectedLocation: updateLocation } = useAddressStore.getState();
          updateLocation({
            storeId: data.store.id,
            storeName: data.store.name,
            pincode: selectedAddress.pincode,
            city: selectedAddress.city || data.store.city || "",
            deliveryTimeMinutes: data.store.cityDeliveryTimes?.[selectedAddress.city],
            isOpen: data.store.isOpen,
            openingHours: data.store.openingHours,
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId, selectedAddress?.pincode]);

  // Validate cart with server
  useEffect(() => {
    if (cart.length === 0) return;
    const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
    const city = selectedLocation?.city || selectedAddress?.city;
    if (!pincode) return;

    const cartItems = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity || 1,
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
          setDeliveryInfo({
            isStoreOpen: data.isStoreOpen !== false,
            cartDeliveryTime: data.cartDeliveryTime || null,
            storeName: data.storeName || data.store?.name || null,
            openingHours: data.openingHours || data.store?.opening_hours || null,
          });
        }
      })
      .catch(() => {});
  }, [cart.length, selectedLocation?.storeId, selectedLocation?.pincode]);

  // Fetch available offers for this store
  useEffect(() => {
    const storeId = selectedLocation?.storeId || cart[0]?.shopId;
    if (!storeId) return;
    axiosInstance
      .get(`/product/api/public/store-offers/${storeId}`)
      .then(({ data }) => {
        if (!data.success) return;
        const now = new Date();
        const offers: Offer[] = [];
        if (Array.isArray(data.discountCodes)) {
          for (const dc of data.discountCodes) {
            if (!dc.isActive) continue;
            if (dc.expiresAt && new Date(dc.expiresAt) <= now) continue;
            if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) continue;
            const dtype =
              dc.discountType === "percentage"
                ? "percent"
                : dc.discountType === "free_delivery"
                  ? "free_delivery"
                  : ("flat" as const);
            offers.push({
              code: dc.discountCode,
              description: dc.public_name || dc.discountCode,
              discountType: dtype,
              discountValue: Number(dc.discountValue),
              minOrderValue: Number(dc.minOrderValue ?? 0),
            });
          }
        }
        setAvailableOffers(offers);
      })
      .catch(() => {});
  }, [selectedLocation?.storeId, cart[0]?.shopId]);

  const itemsTotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );
  const totalWeightKg = cart.reduce((sum, item) => {
    const grams = item.priceBreakdown?.weightGrams;
    return grams ? sum + (grams * (item.quantity || 1)) / 1000 : sum;
  }, 0);

  const discountAmount = getTotalDiscount(itemsTotal);
  const isFreeDeliveryCoupon = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && itemsTotal >= c.minOrderValue,
  );
  const baseDeliveryCharge = itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_CHARGE;
  const deliveryCharge = isFreeDeliveryCoupon ? 0 : baseDeliveryCharge;
  const gstAmount = Math.round(itemsTotal * GST_RATE);
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - itemsTotal);
  const grandTotal = Math.max(
    0,
    itemsTotal + deliveryCharge + PACKAGING_CHARGE + gstAmount - discountAmount,
  );

  const rowKeyFor = (p: CartItem) =>
    `${p.id}__${p.cuttingType || "default"}__${p.pieceSize || "default"}`;

  const handleDecrement = (product: CartItem) => {
    const newQty = (product.quantity || 1) - 1;
    updateQuantity(product.id, newQty);
  };

  const handleIncrement = async (product: CartItem) => {
    const key = rowKeyFor(product);
    setIncrementingKey(key);
    const result = await checkAndIncrement(product.id, 1);
    setIncrementingKey(null);
    if (!result.ok && result.message) {
      toast.error(result.message);
    }
  };

  const applyCouponCode = async (code: string) => {
    if (!code.trim()) return;
    try {
      const storeId = selectedLocation?.storeId || cart[0]?.shopId;
      if (!storeId) {
        toast.error("Select delivery location first");
        return;
      }
      const normalizedCode = code.trim().toUpperCase();
      if (isCouponApplied(normalizedCode)) {
        toast.info("Coupon already applied");
        setCouponCode("");
        return;
      }

      const { coupon, error } = await validateCouponCode(
        normalizedCode,
        itemsTotal,
        storeId,
      );
      if (!coupon) {
        toast.error(error || "Invalid coupon code");
        return;
      }
      applyCoupon(coupon);
      const nextDiscount = getDiscountForCoupon(coupon, itemsTotal);
      setCouponCode("");
      setCouponModalOpen(false);
      toast.success(
        coupon.discountType === "free_delivery"
          ? `${coupon.code} will unlock free delivery`
          : `Coupon applied! Saving ₹${nextDiscount}`,
      );
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    router.push("/(routes)/checkout");
  };

  const ctaLabel = !user
    ? "Proceed to Checkout"
    : addresses.length === 0 || !selectedAddress
      ? "Add Address"
      : !deliveryInfo.isStoreOpen
        ? "Schedule Order"
        : "Proceed to Checkout";

  // ── Empty state ───────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-2xl text-gray-900"
          >
            My Cart
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="bag-handle-outline" size={44} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-poppins-bold text-gray-900 mb-2">Your cart is empty</Text>
          <Text className="text-gray-500 font-poppins-medium text-center mb-8">
            Add items to get started
          </Text>
          <TouchableOpacity
            className="bg-primary px-10 py-3.5 rounded-2xl"
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="text-white font-poppins-semibold text-base">Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#F4F4F4" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View className="bg-white px-4 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <View>
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-2xl text-gray-900"
          >
            My Cart
          </Text>
          <Text className="text-gray-500 font-poppins-medium text-xs mt-0.5">
            {cart.length} Item{cart.length !== 1 ? "s" : ""}
            {totalWeightKg > 0 ? ` • Total ${totalWeightKg.toFixed(1)} kg` : ""}
          </Text>
        </View>
        <View className="flex-row items-center bg-primary/5 px-2.5 py-1.5 rounded-full">
          <Ionicons name="shield-checkmark-outline" size={14} color="#5A2C96" />
          <Text className="text-primary font-poppins-semibold text-[10px] ml-1">
            100% Safe &{"\n"}Hygienic Delivery
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 160 }}
      >
        {/* ── Free-delivery progress banner ─────────────────────────── */}
        <View
          className="rounded-2xl px-4 py-3 mb-3"
          style={{ backgroundColor: "#F3EEFB" }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="pricetag-outline" size={16} color="#5A2C96" />
              <Text className="text-primary font-poppins-semibold text-xs ml-2 flex-1">
                {deliveryCharge === 0
                  ? "Yay! FREE delivery unlocked"
                  : `Add items worth ₹${amountToFreeDelivery} more to save delivery charge`}
              </Text>
            </View>
            <Text className="text-gray-500 font-poppins-semibold text-[11px]">
              ₹{Math.min(itemsTotal, FREE_DELIVERY_THRESHOLD)} / ₹{FREE_DELIVERY_THRESHOLD}
            </Text>
          </View>
          <View className="h-1.5 bg-white rounded-full overflow-hidden">
            <View
              className="h-1.5 bg-primary rounded-full"
              style={{
                width: `${Math.min(100, (itemsTotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
              }}
            />
          </View>
        </View>

        {/* ── Delivery ETA banner ───────────────────────────────────── */}
        <View className="bg-white rounded-2xl border border-gray-100 flex-row items-start px-4 py-3.5 mb-3">
          <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mr-3">
            <Ionicons name="time-outline" size={22} color="#10b981" />
          </View>
          <View className="flex-1">
            {deliveryInfo.isStoreOpen ? (
              <>
                <Text className="text-[15px] font-poppins-bold text-gray-900 leading-snug">
                  Delivery in {deliveryInfo.cartDeliveryTime ?? 30} minutes
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                  Shipment of {cart.length} item{cart.length !== 1 ? "s" : ""}
                  {deliveryInfo.storeName ? ` · ${deliveryInfo.storeName}` : ""}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-[15px] font-poppins-bold text-gray-900 leading-snug">
                  Scheduled order available
                  {deliveryInfo.openingHours ? ` · Opens at ${deliveryInfo.openingHours}` : ""}
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                  Quick delivery is off right now. Pick a delivery slot below.
                </Text>
              </>
            )}
          </View>
        </View>

        {/* ── Product list ──────────────────────────────────────────── */}
        {cart.map((product) => {
          const atStockLimit =
            product.stock !== undefined && (product.quantity ?? 1) >= product.stock;
          const rowKey = rowKeyFor(product);
          const isIncrementing = incrementingKey === rowKey;
          const weightKg = product.priceBreakdown?.weightGrams
            ? (product.priceBreakdown.weightGrams * (product.quantity || 1)) / 1000
            : null;
          const optionsLine = [product.cuttingType, product.pieceSize]
            .filter(Boolean)
            .join(" • ");
          const weightLine = weightKg
            ? `${weightKg >= 1 ? `${weightKg.toFixed(weightKg % 1 === 0 ? 0 : 1)} kg` : `${Math.round(weightKg * 1000)} g`}`
            : null;
          const discountPct =
            product.regularPrice && product.regularPrice > product.price
              ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
              : 0;
          const freshnessBadge = product.badges?.[0];

          return (
            <View
              key={rowKey}
              className="bg-white rounded-2xl border border-gray-100 mb-3 px-3 py-3"
            >
              <View className="flex-row items-start">
                {/* Decorative "in cart" check */}
                <View className="w-6 h-6 rounded-md bg-primary items-center justify-center mr-2 mt-1">
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>

                <Image
                  source={{
                    uri:
                      product.image ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120",
                  }}
                  className="w-16 h-16 rounded-xl bg-gray-100 mr-3"
                  resizeMode="cover"
                />

                <View className="flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text
                      className="text-sm font-poppins-semibold text-gray-900 leading-5 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {product.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFromCart(product.id, user, selectedAddress, "Mobile App")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={17} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {optionsLine ? (
                    <Text className="text-xs text-gray-400 font-poppins-medium mt-0.5" numberOfLines={1}>
                      {optionsLine}
                    </Text>
                  ) : null}
                  {weightLine && (
                    <Text className="text-xs text-primary font-poppins-medium mt-0.5">
                      {weightLine}
                    </Text>
                  )}

                  {freshnessBadge && (
                    <View className="self-start bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5 mt-1.5">
                      <Text className="text-emerald-700 text-[10px] font-poppins-semibold">
                        {freshnessBadge.toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-baseline">
                      <Text className="text-sm font-poppins-bold text-gray-900">
                        ₹{product.price}
                      </Text>
                      {discountPct > 0 && (
                        <>
                          <Text className="text-xs text-gray-400 line-through font-poppins-medium ml-2">
                            ₹{product.regularPrice}
                          </Text>
                          <Text className="text-red-500 text-[11px] font-poppins-semibold ml-1.5">
                            {discountPct}% OFF
                          </Text>
                        </>
                      )}
                    </View>

                    <View className="flex-row items-center border border-gray-200 rounded-xl">
                      <TouchableOpacity
                        className="w-8 h-8 items-center justify-center"
                        disabled={isIncrementing}
                        onPress={() => handleDecrement(product)}
                      >
                        <Ionicons name="remove" size={16} color="#5A2C96" />
                      </TouchableOpacity>
                      <Text className="text-gray-900 text-xs font-poppins-bold min-w-[36px] text-center">
                        {weightLine || product.quantity || 1}
                      </Text>
                      <TouchableOpacity
                        className={`w-8 h-8 items-center justify-center ${
                          atStockLimit || isIncrementing ? "opacity-40" : ""
                        }`}
                        disabled={atStockLimit || isIncrementing}
                        onPress={() => handleIncrement(product)}
                      >
                        {isIncrementing ? (
                          <ActivityIndicator size="small" color="#5A2C96" />
                        ) : (
                          <Ionicons name="add" size={16} color="#5A2C96" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
                    <View className="mt-1.5 self-start bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Text className="text-amber-600 text-[10px] font-poppins-semibold">
                        Only {product.stock} left
                      </Text>
                    </View>
                  )}
                  {product.stock === 0 && (
                    <View className="mt-1.5 self-start bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      <Text className="text-red-500 text-[10px] font-poppins-semibold">
                        Out of stock
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* ── Delivery slot ─────────────────────────────────────────── */}
        <TouchableOpacity
          className="bg-white rounded-2xl border border-gray-100 flex-row items-center justify-between px-4 py-3.5 mb-3"
          onPress={() => setSlotModalOpen(true)}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Ionicons name="time-outline" size={16} color="#5A2C96" />
            <Text className="text-gray-700 font-poppins-medium text-sm ml-2">
              Delivery Slot: {formatSlotLabel(selectedSlot)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-primary font-poppins-semibold text-xs mr-1">Change Slot</Text>
            <Ionicons name="chevron-forward" size={14} color="#5A2C96" />
          </View>
        </TouchableOpacity>

        {/* ── Coupon ────────────────────────────────────────────────── */}
        <TouchableOpacity
          className="rounded-2xl flex-row items-center px-4 py-3.5 mb-3"
          style={{ backgroundColor: "#F3EEFB", borderWidth: 1, borderColor: "#E5D9F7" }}
          onPress={() => setCouponModalOpen(true)}
          activeOpacity={0.8}
        >
          <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center mr-3">
            <MaterialCommunityIcons name="tag-outline" size={18} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-poppins-semibold text-gray-900">
              {appliedCoupons.length > 0 ? `"${appliedCoupons[0].code}" applied` : "Apply Coupon"}
            </Text>
            <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
              {discountAmount > 0
                ? `You're saving ₹${discountAmount} on this order`
                : "Save more on your order"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#5A2C96" />
        </TouchableOpacity>

        {/* ── Price summary ─────────────────────────────────────────── */}
        <View className="bg-white rounded-2xl border border-gray-100 px-4 py-4 mb-3">
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-base text-gray-900 mb-3"
          >
            Price Summary
          </Text>

          <BillRow icon="cube-outline" label={`Item Total (${cart.length} items)`} value={`₹${itemsTotal.toFixed(0)}`} />
          <BillRow
            icon="bicycle-outline"
            label="Delivery Charge"
            value={deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
            strikeValue={deliveryCharge === 0 && baseDeliveryCharge > 0 ? `₹${baseDeliveryCharge}` : undefined}
            green={deliveryCharge === 0}
            info
          />
          <BillRow icon="cube-outline" label="Packaging Charge" value={`₹${PACKAGING_CHARGE}`} info />
          <BillRow icon="receipt-outline" label="Taxes (incl. GST)" value={`₹${gstAmount}`} info />
          {discountAmount > 0 && (
            <BillRow icon="pricetag-outline" label="Coupon discount" value={`−₹${discountAmount}`} green />
          )}

          {/* Wallet / Reward points — not live yet */}
          <View className="flex-row items-center justify-between mb-2.5 opacity-50">
            <View className="flex-row items-center gap-1">
              <Ionicons name="wallet-outline" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 font-poppins-medium ml-1">Wallet</Text>
            </View>
            <Text className="text-xs text-gray-400 font-poppins-semibold">Coming soon</Text>
          </View>
          <View className="flex-row items-center justify-between mb-1 opacity-50">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star-outline" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 font-poppins-medium ml-1">Reward Points</Text>
            </View>
            <Text className="text-xs text-gray-400 font-poppins-semibold">Coming soon</Text>
          </View>

          <View className="border-t border-gray-100 mt-2 pt-3 flex-row justify-between">
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-base text-gray-900"
            >
              To Pay
            </Text>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-base text-primary"
            >
              ₹{grandTotal.toFixed(0)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────── */}
      <View className="bg-white border-t border-gray-100 px-3 py-3 flex-row items-center" style={{ gap: 12 }}>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center border border-primary rounded-2xl py-3.5"
          onPress={() => router.push("/(tabs)")}
          activeOpacity={0.85}
        >
          <Ionicons name="cube-outline" size={16} color="#5A2C96" style={{ marginRight: 6 }} />
          <Text className="text-primary font-poppins-semibold text-sm">Add More Items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-primary rounded-2xl py-3.5"
          onPress={handleCheckout}
          activeOpacity={0.9}
        >
          <Text className="text-white font-poppins-semibold text-sm mr-1.5">{ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Delivery slot modal ─────────────────────────────────────────── */}
      <Modal visible={slotModalOpen} transparent animationType="fade" onRequestClose={() => setSlotModalOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setSlotModalOpen(false)}
        >
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8">
            <Text className="text-lg font-poppins-semibold text-gray-900 mb-4">
              Choose delivery slot
            </Text>
            {SLOT_OPTIONS.map((slot) => {
              const selected = slot.key === selectedSlot;
              return (
                <TouchableOpacity
                  key={slot.key}
                  onPress={() => {
                    setSelectedSlot(slot.key);
                    setSlotModalOpen(false);
                  }}
                  className={`flex-row items-center justify-between border rounded-2xl px-4 py-3.5 mb-3 ${
                    selected ? "border-primary bg-primary/5" : "border-gray-200"
                  }`}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text className="text-sm font-poppins-semibold text-gray-900">
                      {slot.day === "TODAY" ? "Today" : "Tomorrow"} · {slot.time}
                    </Text>
                    {slot.badge && (
                      <Text className="text-emerald-600 text-xs font-poppins-semibold mt-0.5">
                        {slot.badge}
                      </Text>
                    )}
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color="#5A2C96" />
                  ) : (
                    <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Coupon modal ─────────────────────────────────────────────────── */}
      <Modal visible={couponModalOpen} transparent animationType="fade" onRequestClose={() => setCouponModalOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setCouponModalOpen(false)}
        >
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8" style={{ maxHeight: "80%" }}>
            <Text className="text-lg font-poppins-semibold text-gray-900 mb-4">Apply Coupon</Text>

            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-2 mb-2">
              <MaterialCommunityIcons name="tag-outline" size={18} color="#5A2C96" />
              <TextInput
                className="flex-1 ml-3 text-sm font-poppins-medium text-gray-700"
                placeholder="Enter coupon code"
                placeholderTextColor="#9CA3AF"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity onPress={() => applyCouponCode(couponCode)} disabled={!couponCode.trim()}>
                <Text
                  className={`text-sm font-poppins-semibold ${
                    couponCode.trim() ? "text-primary" : "text-gray-400"
                  }`}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>

            {appliedCoupons.length > 0 && (
              <View className="mb-3">
                {appliedCoupons.map((coupon) => (
                  <Text key={coupon.code} className="text-green-600 text-xs font-poppins-medium">
                    "{coupon.code}" applied
                    {coupon.discountType !== "free_delivery"
                      ? ` — saving ₹${getDiscountForCoupon(coupon, itemsTotal)}`
                      : " — free delivery"}
                  </Text>
                ))}
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {availableOffers.length === 0 ? (
                <Text className="text-xs text-gray-400 font-poppins-medium py-2">
                  No offers available right now.
                </Text>
              ) : (
                availableOffers.map((o) => {
                  const meetsMin = itemsTotal >= o.minOrderValue;
                  const applied = isCouponApplied(o.code);
                  const shortfall = Math.max(0, o.minOrderValue - itemsTotal);
                  return (
                    <View
                      key={o.code}
                      className="border border-gray-200 rounded-xl px-3.5 py-3 mb-2 flex-row items-start"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-[15px] font-poppins-bold text-primary tracking-wider">
                          {o.code}
                        </Text>
                        <Text className="text-xs text-gray-600 font-poppins-medium mt-0.5">
                          {o.description}
                        </Text>
                        {!meetsMin && (
                          <Text className="text-xs text-red-500 font-poppins-medium mt-1">
                            Add ₹{shortfall} more to unlock
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => applyCouponCode(o.code)}
                        disabled={!meetsMin || applied}
                        className={`px-4 py-1.5 rounded-full border ${
                          applied
                            ? "border-green-500 bg-green-50"
                            : meetsMin
                              ? "border-primary"
                              : "border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-sm font-poppins-semibold ${
                            applied
                              ? "text-green-600"
                              : meetsMin
                                ? "text-primary"
                                : "text-gray-400"
                          }`}
                        >
                          {applied ? "Applied" : "Apply"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function BillRow({
  icon,
  label,
  value,
  strikeValue,
  info = false,
  green = false,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  strikeValue?: string;
  info?: boolean;
  green?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center mb-2.5">
      <View className="flex-row items-center gap-1">
        {icon && <Ionicons name={icon} size={14} color="#9CA3AF" style={{ marginRight: 4 }} />}
        <Text className="text-sm text-gray-600 font-poppins-medium">{label}</Text>
        {info && <Ionicons name="information-circle-outline" size={13} color="#9CA3AF" />}
      </View>
      <View className="flex-row items-center">
        {strikeValue && (
          <Text className="text-xs text-gray-400 line-through font-poppins-medium mr-1.5">
            {strikeValue}
          </Text>
        )}
        <Text
          className={`text-sm font-poppins-medium ${green ? "text-green-600" : "text-gray-900"}`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
