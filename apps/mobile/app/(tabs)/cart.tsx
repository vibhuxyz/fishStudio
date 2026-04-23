import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { useAddressStore } from "@/lib/address-store";
import AddressModal from "@/components/shared/address-modal";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
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

const DELIVERY_CHARGE = 40;
const HANDLING_CHARGE = 8;
const TIP_OPTIONS = [20, 30, 50];

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
  const { cart, removeFromCart, updateQuantity, checkAndIncrement, clearCart } = useStore();
  const { user } = useUser();
  const { selectedLocation, selectedAddressId, getSelectedAddress, addresses } = useAddressStore();

  const [couponCode, setCouponCode] = useState("");
  const [storedCouponCode, setStoredCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [donation, setDonation] = useState(false);
  const [tip, setTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [offersOpen, setOffersOpen] = useState(true);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [incrementingKey, setIncrementingKey] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [cartValidated, setCartValidated] = useState(false);
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
          setCartValidated(true);
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

  const tipAmount = showCustomTip ? Number(customTip) || 0 : tip ?? 0;

  const itemsTotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );
  const grandTotal =
    itemsTotal +
    DELIVERY_CHARGE +
    HANDLING_CHARGE +
    (donation ? 1 : 0) +
    tipAmount -
    discountAmount;

  const rowKeyFor = (p: any) =>
    `${p.id}__${p.cuttingType || "default"}__${p.pieceSize || "default"}`;

  const handleDecrement = (product: any) => {
    const newQty = (product.quantity || 1) - 1;
    updateQuantity(product.id, newQty);
  };

  const handleIncrement = async (product: any) => {
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
      const res = await axiosInstance.post("/product/api/validate-coupon", {
        code: code.trim().toUpperCase(),
        orderAmount: itemsTotal,
        storeId,
      });
      if (!res.data.success || !res.data.coupon) {
        toast.error(res.data.message || "Invalid coupon code");
        return;
      }
      const coupon = res.data.coupon;
      const nextDiscount =
        coupon.discountType === "percentage"
          ? Math.round((itemsTotal * coupon.discountValue) / 100)
          : coupon.discountType === "fixed"
            ? Math.min(coupon.discountValue, itemsTotal)
            : 0;
      setDiscountAmount(nextDiscount);
      setStoredCouponCode(coupon.code);
      setCouponCode("");
      toast.success(
        coupon.discountType === "free_delivery"
          ? `${coupon.code} will unlock free delivery`
          : `Coupon applied! Saving ₹${nextDiscount}`,
      );
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid coupon code");
    }
  };

  const handleCheckout = async () => {
    router.push("/(routes)/checkout");
  };

  // Determine CTA label — matches web: "Schedule Order" when store is closed.
  const ctaLabel = !user
    ? "Proceed to Checkout"
    : addresses.length === 0 || !selectedAddress
      ? "Add Address to Checkout"
      : !deliveryInfo.isStoreOpen
        ? "Schedule Order"
        : "Proceed to Checkout";

  // ── Empty state ───────────────────────────────────────────────────────────
  if (cart.length === 0 && !showSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-2xl text-gray-900"
          >
            My Cart
          </Text>
          <TouchableOpacity
            className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={18} color="#6B7280" />
          </TouchableOpacity>
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontWeight: Platform.OS === "android" ? "700" : "normal",
          }}
          className="text-2xl text-gray-900"
        >
          My Cart
        </Text>
        <TouchableOpacity
          className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* ── Delivery status + items card ─────────────────────────── */}
        <View className="bg-white mx-3 mt-3 rounded-2xl border border-gray-100 overflow-hidden">
          <View className="flex-row items-start px-4 py-3.5">
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
                    Scheduled order available{deliveryInfo.openingHours ? ` · Opens at ${deliveryInfo.openingHours}` : ""}
                    {deliveryInfo.storeName ? ` from ${deliveryInfo.storeName}` : ""}
                  </Text>
                  <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                    Quick delivery is off right now. You can place a scheduled order.
                  </Text>
                </>
              )}
            </View>
          </View>

          <View className="border-t border-gray-100">
            {cart.map((product, idx) => {
              const atStockLimit =
                product.stock !== undefined && (product.quantity ?? 1) >= product.stock;
              const rowKey = rowKeyFor(product);
              const isIncrementing = incrementingKey === rowKey;
              // Web cart options line: "Ring | Small (40gm-60gm) | 0.9"
              const weightKg = product.priceBreakdown?.weightGrams
                ? (product.priceBreakdown.weightGrams * (product.quantity || 1)) / 1000
                : null;
              const optionsLine = [
                product.cuttingType,
                product.pieceSize,
                weightKg ? `${weightKg.toFixed(1)}` : null,
              ]
                .filter(Boolean)
                .join(" | ");

              return (
                <View
                  key={rowKey}
                  className={`px-4 py-3.5 ${idx < cart.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={{
                        uri:
                          product.image ||
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120",
                      }}
                      className="w-14 h-14 rounded-xl bg-gray-100 mr-3"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text
                        className="text-sm font-poppins-semibold text-gray-900 leading-5"
                        numberOfLines={1}
                      >
                        {product.title}
                      </Text>
                      {optionsLine ? (
                        <Text
                          className="text-xs text-gray-400 font-poppins-medium mt-0.5"
                          numberOfLines={1}
                        >
                          {optionsLine}
                        </Text>
                      ) : null}
                      <Text className="text-sm font-poppins-bold text-gray-900 mt-1">
                        ₹{product.price}
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-green-500 rounded-xl overflow-hidden">
                      <TouchableOpacity
                        className="w-9 h-9 items-center justify-center"
                        disabled={isIncrementing}
                        onPress={() => handleDecrement(product)}
                      >
                        <Text className="text-white text-lg font-bold leading-none">−</Text>
                      </TouchableOpacity>
                      <Text className="text-white text-sm font-poppins-bold min-w-[22px] text-center">
                        {product.quantity || 1}
                      </Text>
                      <TouchableOpacity
                        className={`w-9 h-9 items-center justify-center ${
                          atStockLimit || isIncrementing ? "opacity-40" : ""
                        }`}
                        disabled={atStockLimit || isIncrementing}
                        onPress={() => handleIncrement(product)}
                      >
                        {isIncrementing ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white text-lg font-bold leading-none">+</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
                    <View className="mt-1.5 self-end bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Text className="text-amber-600 text-[10px] font-poppins-semibold">
                        Only {product.stock} left
                      </Text>
                    </View>
                  )}
                  {product.stock === 0 && (
                    <View className="mt-1.5 self-end bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      <Text className="text-red-500 text-[10px] font-poppins-semibold">
                        Out of stock
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Coupon card ───────────────────────────────────────────── */}
        <View className="bg-white mx-3 mt-3 rounded-2xl border border-gray-100">
          <View className="flex-row items-center px-4 py-3.5">
            <MaterialCommunityIcons name="tag-outline" size={20} color="#6C3CE1" />
            <TextInput
              className="flex-1 ml-3 text-sm font-poppins-medium text-gray-700"
              placeholder="Enter coupon code"
              placeholderTextColor="#9CA3AF"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity onPress={() => applyCouponCode(couponCode)}>
              <Text className="text-primary text-sm font-poppins-semibold">Apply</Text>
            </TouchableOpacity>
          </View>

          {storedCouponCode ? (
            <View className="px-4 pb-2 -mt-1">
              <Text className="text-green-600 text-xs font-poppins-medium">
                "{storedCouponCode}" applied — saving ₹{discountAmount}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="border-t border-gray-100 flex-row items-center justify-between px-4 py-3.5"
            onPress={() => setOffersOpen((v) => !v)}
            activeOpacity={0.7}
          >
            <Text className="text-sm text-gray-700 font-poppins-medium">View all offers</Text>
            <Ionicons
              name={offersOpen ? "chevron-down" : "chevron-forward"}
              size={18}
              color="#6B7280"
            />
          </TouchableOpacity>

          {offersOpen && availableOffers.length > 0 && (
            <View className="px-3 pb-3">
              {availableOffers.map((o) => {
                const meetsMin = itemsTotal >= o.minOrderValue;
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
                      disabled={!meetsMin}
                      className={`px-4 py-1.5 rounded-full border ${
                        meetsMin ? "border-primary" : "border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-poppins-semibold ${
                          meetsMin ? "text-primary" : "text-gray-400"
                        }`}
                      >
                        Apply
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
          {offersOpen && availableOffers.length === 0 && (
            <View className="px-4 pb-4">
              <Text className="text-xs text-gray-400 font-poppins-medium">
                No offers available right now.
              </Text>
            </View>
          )}
        </View>

        {/* ── Bill details ──────────────────────────────────────────── */}
        <View className="bg-white mx-3 mt-3 rounded-2xl border border-gray-100 px-4 py-4">
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-base text-gray-900 mb-3"
          >
            Bill details
          </Text>

          <BillRow label="Items total" value={`₹${itemsTotal.toFixed(0)}`} />
          <BillRow label="Delivery charge" value={`₹${DELIVERY_CHARGE}`} info />
          <BillRow label="Handling charge" value={`₹${HANDLING_CHARGE}`} info />
          {tipAmount > 0 && <BillRow label="Tip" value={`₹${tipAmount}`} />}
          {donation && <BillRow label="Donation" value="₹1" />}
          {discountAmount > 0 && (
            <BillRow label="Coupon discount" value={`−₹${discountAmount}`} green />
          )}

          <View className="border-t border-gray-100 mt-2 pt-3 flex-row justify-between">
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-base text-gray-900"
            >
              Grand total
            </Text>
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-base text-gray-900"
            >
              ₹{grandTotal.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* ── Donation ──────────────────────────────────────────────── */}
        <View className="bg-white mx-3 mt-3 rounded-2xl border border-gray-100 px-4 py-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mr-3">
              <Text style={{ fontSize: 20 }}>🍱</Text>
            </View>
            <View className="flex-1 mr-3">
              <Text className="text-sm font-poppins-semibold text-gray-900">
                Feeding India donation
              </Text>
              <Text className="text-xs text-gray-400 font-poppins-medium mt-0.5">
                Working towards a malnutrition free India.
              </Text>
            </View>
            <Text className="text-sm text-gray-700 font-poppins-medium mr-2">₹1</Text>
            <TouchableOpacity
              onPress={() => setDonation(!donation)}
              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                donation ? "bg-primary border-primary" : "bg-white border-gray-300"
              }`}
            >
              {donation && <Ionicons name="checkmark" size={12} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tip ──────────────────────────────────────────────────── */}
        <View className="bg-white mx-3 mt-3 rounded-2xl border border-gray-100 px-4 py-4">
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-base text-gray-900 mb-1"
          >
            Tip your delivery partner
          </Text>
          <Text className="text-xs text-gray-400 font-poppins-medium mb-4">
            100% of your tip goes directly to your delivery partner.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TIP_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setTip(tip === t ? null : t);
                  setShowCustomTip(false);
                  setCustomTip("");
                }}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  tip === t ? "bg-primary border-primary" : "bg-white border-gray-200"
                }`}
              >
                <Text style={{ fontSize: 14 }}>
                  {t === 20 ? "😊" : t === 30 ? "😍" : "🤩"}
                </Text>
                <Text
                  className={`text-sm ml-1.5 font-poppins-medium ${
                    tip === t ? "text-white" : "text-gray-700"
                  }`}
                >
                  ₹{t}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setShowCustomTip(!showCustomTip);
                setTip(null);
              }}
              className={`flex-row items-center px-4 py-2 rounded-full border ${
                showCustomTip ? "bg-primary border-primary" : "bg-white border-gray-200"
              }`}
            >
              <Text style={{ fontSize: 14 }}>👏</Text>
              <Text
                className={`text-sm ml-1.5 font-poppins-medium ${
                  showCustomTip ? "text-white" : "text-gray-700"
                }`}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {showCustomTip && (
            <View className="mt-3 flex-row items-center border border-gray-200 rounded-xl px-4 py-2.5">
              <Text className="text-gray-500 mr-2">₹</Text>
              <TextInput
                className="flex-1 text-sm font-poppins-medium text-gray-900"
                placeholder="Enter tip amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={customTip}
                onChangeText={setCustomTip}
              />
            </View>
          )}
        </View>

        {/* ── Cancellation policy ───────────────────────────────────── */}
        <View className="bg-white mx-3 mt-3 rounded-2xl border border-gray-100 px-4 py-4">
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-base text-gray-900 mb-1.5"
          >
            Cancellation Policy
          </Text>
          <Text className="text-xs text-gray-500 font-poppins-medium leading-5">
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays,
            a refund will be provided, if applicable.
          </Text>
        </View>
      </ScrollView>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────── */}
      <View className="bg-white border-t border-gray-100">
        {/* Address row */}
        <TouchableOpacity
          className="flex-row items-center justify-between px-4 py-2.5 border-b border-gray-100"
          onPress={() => {
            if (addresses.length === 0) {
              router.push("/(routes)/shipping");
            } else {
              setShowAddressModal(true);
            }
          }}
        >
          <View className="flex-row items-center gap-1.5 flex-1 mr-2">
            <Ionicons name="location-outline" size={16} color="#22c55e" />
            {selectedAddress ? (
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-poppins-medium" numberOfLines={1}>
                  Delivering to{" "}
                  <Text className="text-green-600 font-poppins-semibold">
                    {selectedAddress.label || "Home"}
                  </Text>
                </Text>
                <Text className="text-[10px] text-gray-400 font-poppins-medium" numberOfLines={1}>
                  {selectedAddress.street}
                  {selectedAddress.city ? `, ${selectedAddress.city}` : ""}
                </Text>
              </View>
            ) : (
              <Text className="text-xs text-orange-500 font-poppins-semibold">
                {addresses.length === 0 ? "Add delivery address" : "Select delivery address"}
              </Text>
            )}
          </View>
          <Text className="text-sm text-green-600 font-poppins-semibold">Change</Text>
        </TouchableOpacity>

        {/* CTA */}
        <View className="px-3 py-3">
          <TouchableOpacity
            onPress={handleCheckout}
            activeOpacity={0.9}
            disabled={isPlacingOrder}
            className="rounded-2xl flex-row items-center justify-between px-5 py-3.5 bg-green-500"
          >
            <View>
              <Text className="text-white text-lg font-poppins-bold leading-tight">
                ₹{grandTotal.toFixed(0)}
              </Text>
              <Text className="text-green-50 text-[10px] font-poppins-medium uppercase tracking-[2px]">
                TOTAL
              </Text>
            </View>
            {isPlacingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Text
                  style={{
                    fontFamily: "Poppins-Bold",
                    fontWeight: Platform.OS === "android" ? "700" : "normal",
                  }}
                  className="text-white text-base mr-1"
                >
                  {ctaLabel}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        savedAddressesOnly
      />

      <Modal visible={showSuccess} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-8 w-full items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-5">
              <Ionicons name="checkmark" size={40} color="#22c55e" />
            </View>
            <Text
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-2xl text-gray-900 mb-2 text-center"
            >
              Order Placed!
            </Text>
            <Text className="text-gray-500 font-poppins-medium text-center mb-1">
              Your order has been placed successfully.
            </Text>
            {placedOrderId ? (
              <Text className="text-xs text-gray-400 font-poppins-medium text-center mb-6">
                Order ID: #{placedOrderId.slice(-6).toUpperCase()}
              </Text>
            ) : (
              <View className="mb-6" />
            )}
            <Text className="text-sm text-green-600 font-poppins-semibold text-center mb-6">
              💰 Payment: Cash on Delivery
            </Text>
            <TouchableOpacity
              className="bg-primary w-full py-3.5 rounded-2xl items-center mb-3"
              onPress={() => {
                setShowSuccess(false);
                router.push("/(routes)/my-orders");
              }}
            >
              <Text className="text-white font-poppins-semibold">Track My Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.push("/(tabs)");
              }}
            >
              <Text className="text-gray-500 font-poppins-medium text-sm">Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BillRow({
  label,
  value,
  info = false,
  green = false,
}: {
  label: string;
  value: string;
  info?: boolean;
  green?: boolean;
}) {
  return (
    <View className="flex-row justify-between mb-2.5">
      <View className="flex-row items-center gap-1">
        <Text className="text-sm text-gray-600 font-poppins-medium">{label}</Text>
        {info && <Ionicons name="information-circle-outline" size={13} color="#9CA3AF" />}
      </View>
      <Text
        className={`text-sm font-poppins-medium ${green ? "text-green-600" : "text-gray-900"}`}
      >
        {value}
      </Text>
    </View>
  );
}
