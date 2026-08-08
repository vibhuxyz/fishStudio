import AddressModal from "@/components/shared/address-modal";
import CouponSheet from "@/components/shared/coupon-sheet";
import SlotSheet from "@/components/shared/slot-sheet";
import { useAddress } from "@/hooks/useAddress";
import useUser from "@/hooks/useUser";
import { CartItem, useStore } from "@/store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { useDeliverySlotStore } from "@/lib/delivery-slot-store";
import { SCHEDULED_SLOTS, formatSlotLabel } from "@/constants/delivery-slots";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { bestCoupon } from "@repo/shared/pricing";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
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

export default function CartScreen() {
  const { cart, removeFromCart, removeComboGroup, updateQuantity, checkAndIncrement } = useStore();
  const { user } = useUser();
  const { selectedLocation, getSelectedAddress, addresses, selectAddress } = useAddressStore();
  const { fetchAddresses } = useAddress();
  const {
    selectedSlot, instantFee, setSlotAvailability,
    gstRate, packagingCharge, baseDeliveryCharge: sellerDeliveryCharge, freeDeliveryThreshold,
    setBillConfig,
  } = useDeliverySlotStore();
  const {
    appliedCoupons,
    availableCoupons,
    removeCoupon,
    getDiscountForCoupon,
    getTotalDiscount,
    fetchAvailableCoupons,
  } = useCouponStore();

  const [couponSheetOpen, setCouponSheetOpen] = useState(false);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [incrementingKey, setIncrementingKey] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    isStoreOpen: boolean;
    cartDeliveryTime: number | null;
    storeName: string | null;
    openingHours: string | null;
  }>({ isStoreOpen: true, cartDeliveryTime: null, storeName: null, openingHours: null });

  const selectedAddress = getSelectedAddress();

  // Saved addresses aren't persisted between launches, so the cart pulls them
  // back before deciding whether to show the address card or "Add Address".
  useEffect(() => {
    if (!user) return;
    fetchAddresses().catch(() => {
      toast.error("Couldn't load your saved addresses");
    });
  }, [user?.id]);

  // Nothing selected on a fresh install, or the persisted id points at an
  // address that has since been deleted — fall back to the default one so
  // checkout has somewhere to deliver without an extra tap.
  useEffect(() => {
    if (selectedAddress || addresses.length === 0) return;
    const fallback = addresses.find((a) => a.isDefault) || addresses[0];
    selectAddress(fallback.id);
  }, [selectedAddress?.id, addresses.length]);

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
            openingHours: data.store.opening_hours,
            closingHours: data.store.closing_hours,
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

    const validateCart = () => {
      const cartItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
        size: item.selectedSize || undefined,
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
            // Checkout also re-validates independently once it's open, but
            // starts from whatever this set most recently.
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

    // Cart contents don't change while someone lingers on this screen, so a
    // one-shot validation goes stale — e.g. instant delivery stays "offered"
    // here well past the store's closing time. Re-check on a timer.
    validateCart();
    const id = setInterval(validateCart, 60_000);
    return () => clearInterval(id);
  }, [cart.length, selectedLocation?.storeId, selectedLocation?.pincode]);

  // Offers for this store — the same list checkout shows, kept in the coupon store
  useEffect(() => {
    const storeId = selectedLocation?.storeId || cart[0]?.shopId;
    if (!storeId) return;
    fetchAvailableCoupons(storeId, user?.id);
  }, [selectedLocation?.storeId, cart[0]?.shopId, user?.id]);

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
  const baseDeliveryCharge = itemsTotal >= freeDeliveryThreshold ? 0 : sellerDeliveryCharge;
  const deliveryCharge = isFreeDeliveryCoupon ? 0 : baseDeliveryCharge;
  const gstAmount = Math.round(itemsTotal * gstRate);
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - itemsTotal);
  const slotExtraCharge = selectedSlot === "instant" ? instantFee : 0;
  const grandTotal = Math.max(
    0,
    itemsTotal + deliveryCharge + slotExtraCharge + packagingCharge + gstAmount - discountAmount,
  );

  // A quantity change can drop the cart below an already-applied coupon's
  // minimum — getDiscountForCoupon would then silently clamp its saving to 0
  // while the card still claimed it was applied.
  useEffect(() => {
    const applied = appliedCoupons[0];
    if (!applied || itemsTotal >= applied.minOrderValue) return;
    removeCoupon(applied.code);
    toast.info(`'${applied.code}' removed — order no longer meets its ₹${applied.minOrderValue} minimum`);
  }, [itemsTotal]);

  // Best unapplied offer, to tease in the collapsed coupon card
  const topOffer = useMemo(
    () =>
      appliedCoupons.length > 0
        ? null
        : bestCoupon(availableCoupons, {
            subtotal: itemsTotal,
            deliveryCharge: baseDeliveryCharge,
          }),
    [appliedCoupons.length, availableCoupons, itemsTotal, baseDeliveryCharge],
  );

  const rowKeyFor = (p: CartItem) =>
    `${p.id}__${p.cuttingType || "default"}__${p.pieceSize || "default"}__${p.selectedSize || "default"}__${p.comboId || "default"}`;

  const handleDecrement = (product: CartItem) => {
    const newQty = (product.quantity || 1) - 1;
    updateQuantity(product, newQty);
  };

  const handleIncrement = async (product: CartItem) => {
    const key = rowKeyFor(product);
    setIncrementingKey(key);
    const result = await checkAndIncrement(product, 1);
    setIncrementingKey(null);
    if (!result.ok && result.message) {
      toast.error(result.message);
    }
  };

  // Combo members can't be edited/removed individually — group them under
  // their comboId so the cart renders one card per bundle instead of one
  // row per product.
  const cartEntries = useMemo(() => {
    const entries: (
      | { type: "single"; product: CartItem }
      | { type: "combo"; comboId: string; members: CartItem[] }
    )[] = [];
    const seenCombos = new Set<string>();
    cart.forEach((product) => {
      if (product.comboId) {
        if (seenCombos.has(product.comboId)) return;
        seenCombos.add(product.comboId);
        entries.push({
          type: "combo",
          comboId: product.comboId,
          members: cart.filter((p) => p.comboId === product.comboId),
        });
      } else {
        entries.push({ type: "single", product });
      }
    });
    return entries;
  }, [cart]);

  const handleCheckout = () => {
    if (!user) {
      router.push({ pathname: "/(routes)/login", params: { redirect: "/(tabs)/cart" } });
      return;
    }
    if (!selectedAddress) {
      setAddressSheetOpen(true);
      return;
    }
    router.push("/(routes)/checkout");
  };

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
              ₹{Math.min(itemsTotal, freeDeliveryThreshold)} / ₹{freeDeliveryThreshold}
            </Text>
          </View>
          <View className="h-1.5 bg-white rounded-full overflow-hidden">
            <View
              className="h-1.5 bg-primary rounded-full"
              style={{
                width: `${Math.min(100, (itemsTotal / freeDeliveryThreshold) * 100)}%`,
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
        {cartEntries.map((entry) => {
          if (entry.type === "combo") {
            const comboTotal = entry.members.reduce(
              (sum, m) => sum + m.price * (m.quantity ?? 1),
              0,
            );
            return (
              <View
                key={`combo-${entry.comboId}`}
                className="bg-white rounded-2xl border border-primary/20 mb-3 px-3 py-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center bg-primary/5 px-2.5 py-1 rounded-full">
                    <Ionicons name="gift-outline" size={13} color="#5A2C96" />
                    <Text className="text-primary font-poppins-semibold text-[11px] ml-1">
                      Combo Deal
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      removeComboGroup(entry.comboId, user, selectedAddress, "Mobile App")
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={17} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {entry.members.map((member) => {
                  const optionsLine = [member.cuttingType, member.pieceSize]
                    .filter(Boolean)
                    .join(" • ");
                  return (
                    <View key={rowKeyFor(member)} className="flex-row items-center mb-2 last:mb-0">
                      <Image
                        source={{
                          uri:
                            cloudinaryThumbnail(member.image, 96) ||
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120",
                        }}
                        className="w-12 h-12 rounded-lg bg-gray-100 mr-3"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <Text
                          className="text-xs font-poppins-semibold text-gray-900"
                          numberOfLines={1}
                        >
                          {member.title}
                        </Text>
                        {optionsLine ? (
                          <Text className="text-[11px] text-gray-400 font-poppins-medium mt-0.5" numberOfLines={1}>
                            {optionsLine}
                          </Text>
                        ) : null}
                      </View>
                      <Text className="text-xs font-poppins-semibold text-gray-700">
                        × {member.quantity ?? 1}
                      </Text>
                    </View>
                  );
                })}

                <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-gray-100">
                  <Text className="text-[11px] text-gray-400 font-poppins-medium">
                    Combo price
                  </Text>
                  <Text className="text-sm font-poppins-bold text-gray-900">
                    ₹{comboTotal}
                  </Text>
                </View>
              </View>
            );
          }

          const { product } = entry;
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
                      cloudinaryThumbnail(product.image, 128) ||
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
                      onPress={() => removeFromCart(product, user, selectedAddress, "Mobile App")}
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

        {/* ── Coupons ───────────────────────────────────────────────── */}
        <View className="bg-white rounded-2xl border border-gray-100 px-4 py-4 mb-3">
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-base text-gray-900 mb-3"
          >
            Coupons
          </Text>

          {appliedCoupons.map((coupon) => {
            const saved = getDiscountForCoupon(coupon, itemsTotal);
            return (
              <View
                key={coupon.code}
                className="flex-row items-center rounded-2xl px-3.5 py-3 mb-2"
                style={{ backgroundColor: "#F3EEFB", borderWidth: 1, borderColor: "#E5D9F7" }}
              >
                <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center mr-3">
                  <MaterialCommunityIcons name="tag-outline" size={18} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-poppins-bold text-gray-900">{coupon.code}</Text>
                  <Text className="text-xs text-green-600 font-poppins-semibold mt-0.5">
                    Applied ✓ {saved > 0 ? `Saved ₹${saved}` : "Free delivery"}
                  </Text>
                </View>
              </View>
            );
          })}

          {topOffer && (
            <View
              className="flex-row items-center rounded-2xl px-3.5 py-3 mb-2"
              style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
            >
              <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#F3EEFB" }}
              >
                <MaterialCommunityIcons name="tag-outline" size={18} color="#5A2C96" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-poppins-bold text-gray-900">
                  {topOffer.coupon.code}
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                  {topOffer.coupon.discountType === "free_delivery"
                    ? "Free delivery on this order"
                    : `Save ₹${topOffer.saving} on this order`}
                </Text>
              </View>
            </View>
          )}

          {appliedCoupons.length === 0 && !topOffer && (
            <Text className="text-xs text-gray-400 font-poppins-medium mb-2">
              {availableCoupons.length > 0
                ? "Add more items to unlock the offers on this store"
                : "No offers available right now"}
            </Text>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-between pt-1"
            onPress={() => setCouponSheetOpen(true)}
            activeOpacity={0.7}
          >
            <Text className="text-primary font-poppins-semibold text-sm">View All Coupons</Text>
            <Ionicons name="chevron-forward" size={16} color="#5A2C96" />
          </TouchableOpacity>
        </View>
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

      </ScrollView>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────── */}
      <View className="bg-white border-t border-gray-100 px-3 pt-3 pb-4">
        {/* Address strip — the cart is where delivery is confirmed, checkout
            only shows what it's charging for. */}
        {!user ? (
          <TouchableOpacity
            className="flex-row items-center pb-3 mb-3 border-b border-gray-100"
            onPress={handleCheckout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={18} color="#9CA3AF" />
            <View className="flex-1 mx-2.5">
              <Text className="text-xs text-gray-900 font-poppins-semibold">
                Login to continue
              </Text>
              <Text className="text-[11px] text-gray-400 font-poppins-medium">
                Sign in to add a delivery address and place your order
              </Text>
            </View>
            <Text className="text-primary font-poppins-semibold text-xs">Login</Text>
          </TouchableOpacity>
        ) : selectedAddress ? (
          <TouchableOpacity
            className="flex-row items-center pb-3 mb-3 border-b border-gray-100"
            onPress={() => setAddressSheetOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={selectedAddress.label === "Work" ? "briefcase-outline" : "home-outline"}
              size={18}
              color="#5A2C96"
            />
            <View className="flex-1 mx-2.5">
              <Text className="text-[11px] text-gray-400 font-poppins-medium">
                Delivering to {selectedAddress.label}
              </Text>
              <Text className="text-xs text-gray-900 font-poppins-semibold" numberOfLines={1}>
                {selectedAddress.street}
                {selectedAddress.area ? `, ${selectedAddress.area}` : ""}
                {selectedAddress.city ? `, ${selectedAddress.city}` : ""}
              </Text>
            </View>
            <Text className="text-primary font-poppins-semibold text-xs">Change</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center pb-3 mb-3 border-b border-gray-100">
            <Ionicons name="location-outline" size={18} color="#9CA3AF" />
            <View className="flex-1 mx-2.5">
              <Text className="text-xs text-gray-900 font-poppins-semibold">
                No delivery address
              </Text>
              <Text className="text-[11px] text-gray-400 font-poppins-medium">
                Add one to place your order
              </Text>
            </View>
          </View>
        )}

        <View className="flex-row items-center">
          <View className="mr-3">
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-lg text-gray-900"
            >
              ₹{grandTotal.toFixed(0)}
            </Text>
            <Text className="text-[10px] text-gray-400 font-poppins-medium">Total</Text>
          </View>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-primary rounded-2xl py-3.5"
            onPress={handleCheckout}
            activeOpacity={0.9}
          >
            <Text className="text-white font-poppins-semibold text-sm mr-1.5">
              {!user ? "Login to Continue" : selectedAddress ? "Proceed to Checkout" : "Add Address"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <SlotSheet visible={slotModalOpen} onClose={() => setSlotModalOpen(false)} />

      {/* ── Coupon sheet ─────────────────────────────────────────────────── */}
      <CouponSheet
        visible={couponSheetOpen}
        onClose={() => setCouponSheetOpen(false)}
        subtotal={itemsTotal}
        deliveryCharge={baseDeliveryCharge}
        storeId={selectedLocation?.storeId || cart[0]?.shopId}
      />

      {/* ── Address sheet ────────────────────────────────────────────────── */}
      <AddressModal
        visible={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
        presentation="sheet"
        savedAddressesOnly
        requireAddressForm
      />

    </SafeAreaView>
  );
}
