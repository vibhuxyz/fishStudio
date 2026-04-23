import AddressModal from "@/components/shared/address-modal";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { user } = useUser();
  const { cart, clearCart } = useStore();
  const { addresses, selectedLocation, setSelectedLocation, getSelectedAddress } =
    useAddressStore();
  const {
    appliedCoupons,
    availableCoupons,
    autoApplied,
    applyCoupon,
    clearAllCoupons,
    setAutoApplied,
    isCouponApplied,
    getDiscountForCoupon,
    getTotalDiscount,
    fetchAvailableCoupons,
  } = useCouponStore();

  const [selectedSlot, setSelectedSlot] = useState("morning");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryMetadata, setDeliveryMetadata] = useState({
    availableSlots: ["morning", "evening"] as string[],
    instantFee: 20,
    isStoreOpen: true,
    cartDeliveryTime: null as number | null,
    storeName: null as string | null,
    openingHours: null as string | null,
  });

  const selectedAddress = getSelectedAddress();
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [cart],
  );

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
            openingHours: data.store.openingHours,
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId, selectedAddress?.pincode, selectedAddress?.city, setSelectedLocation]);

  useEffect(() => {
    const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
    const city = selectedLocation?.city || selectedAddress?.city;
    if (!pincode || cart.length === 0) return;

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
        if (!data.success) return;
        const nextSlots = data.availableSlots || ["morning", "evening"];
        setDeliveryMetadata({
          availableSlots: nextSlots,
          instantFee: data.instantFee || 20,
          isStoreOpen: data.isStoreOpen !== false,
          cartDeliveryTime: data.cartDeliveryTime || null,
          storeName: data.storeName || data.store?.name || null,
          openingHours: data.openingHours || data.store?.opening_hours || null,
        });
        setSelectedSlot((current) =>
          nextSlots.includes(current) ? current : nextSlots[0] || "morning",
        );
      })
      .catch(() => {});
  }, [cart, selectedLocation?.storeId, selectedLocation?.pincode, selectedLocation?.city, selectedAddress?.pincode, selectedAddress?.city]);

  useEffect(() => {
    if (selectedLocation?.storeId) {
      fetchAvailableCoupons(selectedLocation.storeId, user?.id);
    }
  }, [selectedLocation?.storeId, user?.id, fetchAvailableCoupons]);

  useEffect(() => {
    if (appliedCoupons.length > 0 || autoApplied) return;
    const eligibleAutoCoupon = availableCoupons.find(
      (coupon) =>
        coupon.autoApply &&
        subtotal >= coupon.minOrderValue &&
        !isCouponApplied(coupon.code),
    );
    if (eligibleAutoCoupon) {
      applyCoupon(eligibleAutoCoupon);
      setAutoApplied(true);
      toast.success(`Coupon ${eligibleAutoCoupon.code} auto-applied!`);
    }
  }, [availableCoupons, subtotal, appliedCoupons.length, autoApplied, applyCoupon, isCouponApplied, setAutoApplied]);

  // ── Not logged in ────────────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <CheckoutHeader user={user} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="lock-closed-outline" size={56} color="#9CA3AF" />
          <Text className="text-xl font-poppins-bold text-gray-900 mt-5 mb-2">
            You are not logged in
          </Text>
          <Text className="text-gray-500 font-poppins-medium text-center mb-8">
            Login to continue to checkout and place your order.
          </Text>
          <TouchableOpacity
            className="bg-primary w-full py-3.5 rounded-2xl items-center"
            onPress={() => router.push("/(routes)/login")}
          >
            <Text className="text-white font-poppins-semibold text-base">
              Login / Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty cart ───────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <CheckoutHeader user={user} />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="bag-handle-outline" size={56} color="#9CA3AF" />
          <Text className="text-xl font-poppins-bold text-gray-900 mt-5 mb-2">
            Your cart is empty
          </Text>
          <TouchableOpacity
            className="bg-primary w-full py-3.5 rounded-2xl items-center mt-4"
            onPress={() => router.replace("/(tabs)")}
          >
            <Text className="text-white font-poppins-semibold text-base">
              Browse Products
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const slotExtraCharge =
    selectedSlot === "instant" ? deliveryMetadata.instantFee : 0;
  const baseDeliveryCharge = subtotal > 500 ? 0 : 49;
  const isFreeDelivery = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && subtotal >= c.minOrderValue,
  );
  const deliveryCharge = isFreeDelivery ? 0 : baseDeliveryCharge;
  const totalDeliveryCost = deliveryCharge + slotExtraCharge;
  const discount = Math.min(getTotalDiscount(subtotal), subtotal + totalDeliveryCost);
  const grandTotal = Math.max(0, subtotal + totalDeliveryCost - discount);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please add or select a delivery address first");
      return;
    }
    if (!selectedLocation?.storeId) {
      toast.error("Please set your delivery location first");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        storeId: selectedLocation.storeId,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          selectedOptions: {
            cuttingType: item.cuttingType || "",
            pieceSize: item.pieceSize || "",
            ...(item.priceBreakdown || {}),
          },
        })),
        deliveryDetails: {
          name: selectedAddress.name,
          phone: selectedAddress.phone || user.phone || "",
          address: `${selectedAddress.street}${selectedAddress.area ? `, ${selectedAddress.area}` : ""}`,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        billDetails: {
          itemTotal: subtotal,
          deliveryCharge,
          extraCharge: slotExtraCharge,
          discount,
          discountBreakdown: appliedCoupons.map((coupon) => ({
            code: coupon.code,
            amount: getDiscountForCoupon(coupon, subtotal),
          })),
        },
        totalAmount: grandTotal,
        paymentMethod: "COD",
        deliverySlot: selectedSlot,
        couponCode:
          appliedCoupons.length > 0
            ? appliedCoupons.map((coupon) => coupon.code).join(",")
            : undefined,
        discountAmount: discount,
      };

      const { data } = await axiosInstance.post("/order/api/create", orderData);
      clearCart();
      clearAllCoupons();
      toast.success("Order placed successfully!");
      router.replace({
        pathname: "/(routes)/order-confirmation/[id]" as any,
        params: { id: data.orderId },
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const isInstantAvailable = deliveryMetadata.availableSlots.includes("instant");
  const slotOptions: Array<{
    key: "instant" | "morning" | "evening";
    title: string;
    subtitle: string;
    badge: string;
    badgeKind: "charge" | "disabled";
    emoji: string;
    disabled?: boolean;
  }> = [
    {
      key: "instant",
      title: "Instant Delivery (30-45 mins)",
      subtitle: isInstantAvailable
        ? "Get it as soon as possible"
        : "Quick delivery is off while the shop is closed",
      badge: isInstantAvailable ? `+₹${deliveryMetadata.instantFee}` : "Quick delivery off",
      badgeKind: isInstantAvailable ? "charge" : "disabled",
      emoji: "⚡",
      disabled: !isInstantAvailable,
    },
    {
      key: "morning",
      title: "Morning Delivery (6 AM – 10 AM)",
      subtitle: "Fresh delivery before you start your day",
      badge: "Lowest charge",
      badgeKind: "charge",
      emoji: "🌅",
    },
    {
      key: "evening",
      title: "Evening Delivery (5 PM – 9 PM)",
      subtitle: "Delivered when you get home",
      badge: "Lowest charge",
      badgeKind: "charge",
      emoji: "🌆",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CheckoutHeader user={user} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── 0. Order Summary ─────────────────────────────────────── */}
        <SectionHeader number="0" title="Order Summary" />
        <View className="mx-4 bg-white rounded-2xl border border-gray-100 p-4">
          {cart.map((item, idx) => {
            const weightKg = item.priceBreakdown?.weightGrams
              ? ((item.priceBreakdown.weightGrams as number) * (item.quantity || 1)) / 1000
              : null;
            const options = [
              weightKg ? `${weightKg.toFixed(1)}` : null,
              item.cuttingType,
              item.pieceSize,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <View
                key={`${item.id}-${item.cuttingType || ""}-${item.pieceSize || ""}-${idx}`}
                className={`flex-row items-center ${idx > 0 ? "border-t border-gray-100 pt-3 mt-3" : ""}`}
              >
                <Image
                  source={{ uri: item.image || "https://via.placeholder.com/80" }}
                  className="w-14 h-14 rounded-xl bg-gray-100"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-poppins-bold text-gray-900"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {options ? (
                    <Text
                      className="text-xs text-gray-500 font-poppins-medium mt-0.5"
                      numberOfLines={1}
                    >
                      {options}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-900 font-poppins-semibold mt-0.5">
                    Qty: {item.quantity || 1}
                  </Text>
                </View>
                <Text className="text-sm font-poppins-bold text-gray-900">
                  ₹{(item.price * (item.quantity || 1)).toFixed(0)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── 1. Delivery Address ──────────────────────────────────── */}
        <SectionHeader number="1" title="Delivery Address" />
        {selectedAddress ? (
          <View className="mx-4 bg-primary/5 rounded-2xl border-2 border-primary p-4">
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                <Ionicons name="location-outline" size={20} color="#6C3CE1" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      fontWeight: Platform.OS === "android" ? "700" : "normal",
                    }}
                    className="text-primary uppercase tracking-wider text-sm mr-1.5"
                  >
                    {selectedAddress.label || "HOME"}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#6C3CE1" />
                </View>
                <Text className="text-sm font-poppins-bold text-gray-900">
                  {selectedAddress.name}
                </Text>
                <Text className="text-sm text-gray-600 font-poppins-medium mt-0.5 leading-5">
                  {selectedAddress.street}
                  {selectedAddress.area ? `, ${selectedAddress.area}` : ""}
                  {selectedAddress.city ? `, ${selectedAddress.city}` : ""}
                  {selectedAddress.state ? `, ${selectedAddress.state}` : ""}
                  {selectedAddress.pincode ? ` – ${selectedAddress.pincode}` : ""}
                </Text>
                {(selectedAddress.phone || user.phone) && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="call-outline" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 font-poppins-medium ml-1.5">
                      {selectedAddress.phone || user.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="border-t border-primary/20 mt-3 pt-3">
              <Text className="text-xs text-gray-500 font-poppins-medium italic">
                To change the address, go back to your cart and update your delivery location.
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            className="mx-4 bg-white rounded-2xl border border-gray-200 p-4"
            onPress={() => setShowAddressModal(true)}
          >
            <Text className="text-sm text-orange-500 font-poppins-semibold">
              Tap to add or select a delivery address
            </Text>
          </TouchableOpacity>
        )}

        {/* ── 2. Delivery Slot ─────────────────────────────────────── */}
        <SectionHeader number="2" title="Delivery Slot" />

        {!deliveryMetadata.isStoreOpen && (
          <View className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Text className="text-sm font-poppins-bold text-amber-900">
              Shop is closed right now. Scheduled ordering is still available.
            </Text>
            <Text className="text-xs text-amber-700 font-poppins-medium mt-1 leading-5">
              Quick delivery is off. Please choose a morning or evening slot.
            </Text>
          </View>
        )}

        <View className="mx-4 gap-2.5">
          {slotOptions.map((opt) => {
            const selected = selectedSlot === opt.key && !opt.disabled;
            return (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={opt.disabled ? 1 : 0.8}
                disabled={opt.disabled}
                onPress={() => !opt.disabled && setSelectedSlot(opt.key)}
                className={`rounded-2xl px-4 py-3.5 flex-row items-center ${
                  selected
                    ? "bg-primary/5 border-2 border-primary"
                    : opt.disabled
                      ? "bg-gray-50 border border-gray-100"
                      : "bg-white border border-gray-200"
                }`}
              >
                <Text style={{ fontSize: 28, marginRight: 12 }}>{opt.emoji}</Text>
                <View className="flex-1 pr-2">
                  <Text
                    className={`text-[15px] font-poppins-bold leading-tight ${
                      opt.disabled ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {opt.title}
                  </Text>
                  <Text
                    className={`text-xs font-poppins-medium mt-0.5 leading-4 ${
                      opt.disabled ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {opt.subtitle}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={`text-xs font-poppins-semibold ${
                      opt.badgeKind === "disabled"
                        ? "text-gray-400"
                        : opt.key === "instant"
                          ? "text-primary"
                          : "text-green-600"
                    }`}
                  >
                    {opt.badge}
                  </Text>
                  {selected && (
                    <View className="mt-1">
                      <Ionicons name="checkmark-circle" size={22} color="#6C3CE1" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── 3. Payment Method ────────────────────────────────────── */}
        <SectionHeader number="3" title="Payment Method" />

        <View className="mx-4 bg-primary/5 rounded-2xl border-2 border-primary p-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="credit-card-outline" size={26} color="#6C3CE1" />
            <View className="flex-1 ml-3">
              <Text className="text-[15px] font-poppins-bold text-gray-900">
                Pay on Delivery
              </Text>
              <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                Cash, UPI or Card at your doorstep
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#6C3CE1" />
          </View>
        </View>

        <View className="mx-4 mt-2 flex-row items-center">
          <Text className="text-xs text-gray-500 font-poppins-medium italic flex-1">
            Online payment options (Credit Card, Wallets) coming soon.
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
        </View>

        {/* ── Bill Details + Place Order ────────────────────────────── */}
        <View className="mx-4 mt-5 bg-white rounded-2xl border border-gray-100 p-4">
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-lg text-gray-900 mb-3"
          >
            Bill Details
          </Text>

          <View className="flex-row justify-between mb-2.5">
            <Text className="text-sm text-gray-600 font-poppins-medium">Item Total</Text>
            <Text className="text-sm text-gray-900 font-poppins-semibold">
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2.5">
            <View className="flex-row items-center">
              <Ionicons name="car-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 font-poppins-medium ml-1.5">
                Delivery Charge
              </Text>
            </View>
            <Text className="text-sm text-gray-900 font-poppins-semibold">
              {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}.00`}
            </Text>
          </View>

          {slotExtraCharge > 0 && (
            <View className="flex-row justify-between mb-2.5">
              <Text className="text-sm text-gray-600 font-poppins-medium">
                Instant Delivery Fee
              </Text>
              <Text className="text-sm text-gray-900 font-poppins-semibold">
                ₹{slotExtraCharge}.00
              </Text>
            </View>
          )}

          {appliedCoupons.map((coupon) => {
            const amount = getDiscountForCoupon(coupon, subtotal);
            if (amount <= 0 && coupon.discountType !== "free_delivery") return null;
            return (
              <View key={coupon.code} className="flex-row justify-between mb-2.5">
                <Text className="text-sm text-gray-600 font-poppins-medium">
                  Coupon ({coupon.code})
                </Text>
                <Text className="text-sm text-green-600 font-poppins-semibold">
                  {coupon.discountType === "free_delivery"
                    ? "FREE Delivery"
                    : `-₹${amount.toFixed(0)}`}
                </Text>
              </View>
            );
          })}

          <View className="border-t border-gray-100 mt-2 pt-3 flex-row justify-between items-center mb-4">
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-lg text-gray-900"
            >
              Total Payable
            </Text>
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-xl text-gray-900"
            >
              ₹{grandTotal.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row items-start bg-gray-50 rounded-xl px-3 py-2.5 mb-4">
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text className="text-xs text-gray-600 font-poppins-medium ml-2 flex-1 leading-5">
              By placing the order, you agree to our terms and conditions. Estimated delivery time:{" "}
              {selectedSlot === "instant" ? "30-45 mins" : selectedSlot === "morning" ? "6 AM – 10 AM" : "5 PM – 9 PM"}.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder || !selectedAddress || !selectedLocation?.storeId}
            activeOpacity={0.85}
            className={`rounded-2xl py-4 items-center ${
              isPlacingOrder || !selectedAddress || !selectedLocation?.storeId
                ? "bg-gray-300"
                : "bg-primary"
            }`}
          >
            {isPlacingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
                className="text-white text-base tracking-widest uppercase"
              >
                Place Order
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Trust icons ──────────────────────────────────────────── */}
        <View className="flex-row items-start justify-around px-4 mt-6">
          <TrustBadge icon="shield-checkmark-outline" label="SAFE & SECURE" />
          <TrustBadge icon="cube-outline" label="CONTACTLESS" />
          <TrustBadge icon="leaf-outline" label="ECO FRIENDLY" />
        </View>
      </ScrollView>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        savedAddressesOnly
      />
    </SafeAreaView>
  );
}

// ── Helper components ─────────────────────────────────────────────────
function CheckoutHeader({ user }: { user: any }) {
  return (
    <View className="bg-white px-4 py-3.5 flex-row items-center justify-between border-b border-gray-100">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 bg-primary rounded-xl items-center justify-center"
      >
        <MaterialCommunityIcons name="fish" size={22} color="#fff" />
      </TouchableOpacity>
      <Text
        style={{
          fontFamily: "Poppins-Bold",
          fontWeight: Platform.OS === "android" ? "700" : "normal",
          letterSpacing: 2,
        }}
        className="text-base text-gray-600 uppercase"
      >
        Secure Checkout
      </Text>
      <View className="flex-row items-center">
        <View className="w-9 h-9 bg-primary rounded-full items-center justify-center">
          <Text className="text-white font-poppins-bold text-sm">
            {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" style={{ marginLeft: 4 }} />
      </View>
    </View>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <View className="flex-row items-center px-4 py-4 mt-2">
      <View className="w-7 h-7 bg-primary/10 rounded-full items-center justify-center mr-3">
        <Text className="text-primary text-sm font-poppins-bold">{number}</Text>
      </View>
      <Text
        style={{
          fontFamily: "Poppins-Bold",
          fontWeight: Platform.OS === "android" ? "700" : "normal",
        }}
        className="text-[22px] text-gray-900"
      >
        {title}
      </Text>
    </View>
  );
}

function TrustBadge({ icon, label }: { icon: any; label: string }) {
  return (
    <View className="items-center">
      <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1.5">
        <Ionicons name={icon} size={22} color="#6B7280" />
      </View>
      <Text className="text-[10px] font-poppins-bold text-gray-500 tracking-wider">
        {label}
      </Text>
    </View>
  );
}
