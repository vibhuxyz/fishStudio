import AddressModal from "@/components/shared/address-modal";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
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
    isLoadingCoupons,
    autoApplied,
    applyCoupon,
    removeCoupon,
    clearAllCoupons,
    setAutoApplied,
    isCouponApplied,
    getDiscountForCoupon,
    getTotalDiscount,
    fetchAvailableCoupons,
    validateCouponCode,
  } = useCouponStore();

  const [couponInput, setCouponInput] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("morning");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryMetadata, setDeliveryMetadata] = useState({
    availableSlots: ["morning", "evening"],
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
          nextSlots.includes(current) ? current : (nextSlots[0] || "morning"),
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

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">Checkout</Text>
        </View>
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

  if (cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">Checkout</Text>
        </View>
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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const storeId = selectedLocation?.storeId || cart[0]?.shopId;
    if (!storeId) {
      toast.error("Select a delivery address first to unlock coupons.");
      return;
    }

    const { coupon, error } = await validateCouponCode(
      couponInput.trim(),
      subtotal,
      storeId,
    );

    if (error || !coupon) {
      toast.error(error || "Invalid coupon code");
      return;
    }

    if (isCouponApplied(coupon.code)) {
      toast.info("Coupon already applied");
      return;
    }

    applyCoupon(coupon);
    setCouponInput("");
    toast.success(`Coupon ${coupon.code} applied!`);
  };

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
        pathname: "/(routes)/order-details/[id]",
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-poppins-bold text-gray-900">Checkout</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <Text className="text-base font-poppins-bold text-gray-900 mb-3">
            Order Summary
          </Text>
          {cart.map((item) => (
            <View
              key={`${item.id}-${item.cuttingType || ""}-${item.pieceSize || ""}`}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <Image
                source={{ uri: item.image || "https://via.placeholder.com/80" }}
                className="w-14 h-14 rounded-xl bg-gray-100"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-poppins-semibold text-gray-900" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                  Qty: {item.quantity || 1}
                  {item.cuttingType ? ` · ${item.cuttingType}` : ""}
                  {item.pieceSize ? ` · ${item.pieceSize}` : ""}
                </Text>
                {item.priceBreakdown?.cuttingCharge != null && item.priceBreakdown.cuttingCharge > 0 && (
                  <Text className="text-[11px] text-amber-500 font-poppins-medium mt-0.5">
                    ₹{item.priceBreakdown.baseRatePerKg}/kg + ₹{item.priceBreakdown.cuttingCharge} cut
                    {item.priceBreakdown.sizeMultiplier && item.priceBreakdown.sizeMultiplier !== 1
                      ? ` ×${item.priceBreakdown.sizeMultiplier}` : ""}
                    {" = "}₹{item.priceBreakdown.effectiveRatePerKg}/kg
                  </Text>
                )}
              </View>
              <Text className="text-sm font-poppins-bold text-gray-900">
                ₹{(item.price * (item.quantity || 1)).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
          onPress={() => setShowAddressModal(true)}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-poppins-bold text-gray-900 mb-1">
                Delivery Address
              </Text>
              {selectedAddress ? (
                <>
                  <Text className="text-sm font-poppins-semibold text-gray-900">
                    {selectedAddress.name}
                  </Text>
                  <Text className="text-sm text-gray-500 font-poppins-medium mt-0.5">
                    {selectedAddress.street}
                    {selectedAddress.area ? `, ${selectedAddress.area}` : ""}
                  </Text>
                  <Text className="text-sm text-gray-500 font-poppins-medium">
                    {selectedAddress.city}, {selectedAddress.pincode}
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-orange-500 font-poppins-medium">
                  Add or select your delivery address
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <Text className="text-base font-poppins-bold text-gray-900 mb-3">
            Delivery Slot
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {deliveryMetadata.availableSlots.map((slot) => {
              const selected = selectedSlot === slot;
              const label =
                slot === "instant"
                  ? "Instant"
                  : slot === "morning"
                    ? "Morning"
                    : "Evening";
              return (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedSlot(slot)}
                  className={`px-4 py-2.5 rounded-full border ${
                    selected ? "bg-primary border-primary" : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-poppins-medium ${
                      selected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {label}
                    {slot === "instant" ? ` (+₹${deliveryMetadata.instantFee})` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {deliveryMetadata.openingHours && !deliveryMetadata.isStoreOpen && (
            <Text className="text-xs text-orange-500 font-poppins-medium mt-3">
              Store opens at {deliveryMetadata.openingHours}
            </Text>
          )}
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <Text className="text-base font-poppins-bold text-gray-900 mb-3">
            Coupons & Offers
          </Text>

          {appliedCoupons.length > 0 && (
            <View className="mb-3 gap-2">
              {appliedCoupons.map((coupon) => (
                <View
                  key={coupon.code}
                  className="flex-row items-center justify-between rounded-xl bg-green-50 px-3 py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-poppins-semibold text-green-700">
                      {coupon.code} applied
                    </Text>
                    <Text className="text-xs text-green-600 font-poppins-medium">
                      {coupon.discountType === "free_delivery"
                        ? "Free delivery unlocked"
                        : `Save ₹${getDiscountForCoupon(coupon, subtotal)}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCoupon(coupon.code)}>
                    <Ionicons name="close-circle-outline" size={20} color="#16A34A" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row items-center rounded-xl border border-gray-200 px-3">
            <TextInput
              className="flex-1 py-3 text-sm font-poppins-medium text-gray-900"
              placeholder="Enter coupon code"
              placeholderTextColor="#9CA3AF"
              value={couponInput}
              onChangeText={(value) => setCouponInput(value.toUpperCase())}
              autoCapitalize="characters"
            />
            <TouchableOpacity onPress={handleApplyCoupon}>
              <Text className="text-primary text-sm font-poppins-semibold">Apply</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-poppins-semibold text-gray-900 mb-2">
              Available offers
            </Text>
            {isLoadingCoupons ? (
              <View className="py-3 items-center">
                <ActivityIndicator color="#6C3CE1" />
              </View>
            ) : availableCoupons.length === 0 ? (
              <Text className="text-sm text-gray-500 font-poppins-medium">
                No coupons available for this order yet.
              </Text>
            ) : (
              <View className="gap-2">
                {availableCoupons.map((coupon) => {
                  const eligible = subtotal >= coupon.minOrderValue;
                  const applied = isCouponApplied(coupon.code);
                  return (
                    <View
                      key={coupon.code}
                      className={`rounded-xl border px-3 py-3 ${
                        applied
                          ? "border-green-200 bg-green-50"
                          : eligible
                            ? "border-gray-200 bg-white"
                            : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="text-sm font-poppins-bold text-gray-900">
                            {coupon.code}
                          </Text>
                          <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                            {coupon.description}
                          </Text>
                          {!eligible && (
                            <Text className="text-xs text-orange-500 font-poppins-medium mt-1">
                              Add ₹{coupon.minOrderValue - subtotal} more to unlock
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          disabled={!eligible || applied}
                          onPress={() => applyCoupon(coupon)}
                          className={`px-3 py-2 rounded-lg ${
                            applied
                              ? "bg-green-100"
                              : eligible
                                ? "bg-primary"
                                : "bg-gray-200"
                          }`}
                        >
                          <Text
                            className={`text-xs font-poppins-semibold ${
                              applied
                                ? "text-green-700"
                                : eligible
                                  ? "text-white"
                                  : "text-gray-500"
                            }`}
                          >
                            {applied ? "Applied" : "Apply"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 p-4">
          <Text className="text-base font-poppins-bold text-gray-900 mb-3">
            Bill Details
          </Text>
          <BillRow label="Items total" value={`₹${subtotal.toFixed(0)}`} />
          <BillRow label="Delivery charge" value={deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`} />
          {slotExtraCharge > 0 && (
            <BillRow label="Instant delivery fee" value={`₹${slotExtraCharge}`} />
          )}
          {appliedCoupons.map((coupon) => {
            const amount = getDiscountForCoupon(coupon, subtotal);
            if (amount <= 0 && coupon.discountType !== "free_delivery") return null;
            return (
              <BillRow
                key={coupon.code}
                label={`Coupon (${coupon.code})`}
                value={
                  coupon.discountType === "free_delivery"
                    ? "FREE Delivery"
                    : `-₹${amount.toFixed(0)}`
                }
                green
              />
            );
          })}
          <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between">
            <Text className="text-base font-poppins-bold text-gray-900">Grand total</Text>
            <Text className="text-base font-poppins-bold text-gray-900">
              ₹{grandTotal.toFixed(0)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-100 px-4 py-3">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || !selectedAddress || !selectedLocation?.storeId}
          className={`rounded-2xl px-5 py-4 flex-row items-center justify-between ${
            isPlacingOrder || !selectedAddress || !selectedLocation?.storeId
              ? "bg-gray-400"
              : "bg-green-500"
          }`}
        >
          <View>
            <Text className="text-white text-lg font-poppins-bold">
              ₹{grandTotal.toFixed(0)}
            </Text>
            <Text className="text-green-100 text-[10px] font-poppins-medium uppercase">
              Total
            </Text>
          </View>
          {isPlacingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                fontFamily: "Poppins-SemiBold",
                fontWeight: Platform.OS === "android" ? "600" : "normal",
              }}
              className="text-white text-base"
            >
              Place Order (COD)
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        savedAddressesOnly
      />
    </SafeAreaView>
  );
}

function BillRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <View className="flex-row justify-between mb-2.5">
      <Text className="text-sm text-gray-600 font-poppins-medium">{label}</Text>
      <Text
        className={`text-sm font-poppins-medium ${green ? "text-green-600" : "text-gray-900"}`}
      >
        {value}
      </Text>
    </View>
  );
}
