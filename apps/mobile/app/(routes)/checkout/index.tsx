import AddressModal from "@/components/shared/address-modal";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { useDeliverySlotStore } from "@/lib/delivery-slot-store";
import { useStore } from "@/store";
import { SLOT_OPTIONS } from "@/constants/delivery-slots";
import { BASE_DELIVERY_CHARGE, FREE_DELIVERY_THRESHOLD, GST_RATE, PACKAGING_CHARGE } from "@/constants/pricing";
import axiosInstance from "@/utils/axiosInstance";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = "upi" | "card" | "cod";

// ─── Main screen ─────────────────────────────────────────────────────────────
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
    removeCoupon,
    clearAllCoupons,
    setAutoApplied,
    isCouponApplied,
    getDiscountForCoupon,
    getTotalDiscount,
    fetchAvailableCoupons,
  } = useCouponStore();

  const { selectedSlot, setSelectedSlot } = useDeliverySlotStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const couponInputRef = useRef<TextInput>(null);

  const selectedAddress = getSelectedAddress();

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
            openingHours: data.store.openingHours,
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId, selectedAddress?.pincode]);

  // Auto-apply eligible coupon once
  useEffect(() => {
    if (appliedCoupons.length > 0 || autoApplied) return;
    const eligible = availableCoupons.find(
      (c) => c.autoApply && subtotal >= c.minOrderValue && !isCouponApplied(c.code),
    );
    if (eligible) {
      applyCoupon(eligible);
      setAutoApplied(true);
    }
  }, [availableCoupons, subtotal, appliedCoupons.length, autoApplied]);

  // ── Pricing ────────────────────────────────────────────────────────────────
  const isFreeDelivery = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && subtotal >= c.minOrderValue,
  );
  const baseDelivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_CHARGE;
  const deliveryCharge = isFreeDelivery ? 0 : baseDelivery;
  const packagingCharge = PACKAGING_CHARGE;
  const discount = Math.min(getTotalDiscount(subtotal), subtotal);
  const gstAmount = Math.round(subtotal * GST_RATE);
  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge + packagingCharge + gstAmount);

  // ── Apply coupon handler ────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (isCouponApplied(code)) {
      toast.error("Coupon already applied");
      return;
    }
    // First check if it's in available list
    const found = availableCoupons.find((c) => c.code.toUpperCase() === code);
    if (found) {
      if (subtotal < found.minOrderValue) {
        toast.error(`Minimum order ₹${found.minOrderValue} required for this coupon`);
        return;
      }
      applyCoupon(found);
      setCouponInput("");
      toast.success(`Coupon ${found.code} applied!`);
      return;
    }
    // Validate from server
    setCouponLoading(true);
    try {
      const { data } = await axiosInstance.post("/product/api/validate-coupon", {
        code,
        storeId: selectedLocation?.storeId,
        userId: user?.id,
        orderTotal: subtotal,
      });
      if (data.valid && data.coupon) {
        applyCoupon(data.coupon);
        setCouponInput("");
        toast.success(`Coupon ${data.coupon.code} applied!`);
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch {
      toast.error("Coupon not found or expired");
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!selectedLocation?.storeId) {
      toast.error("Please set your delivery location");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const { data } = await axiosInstance.post("/order/api/create", {
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
          phone: selectedAddress.phone || user?.phone || "",
          address: `${selectedAddress.street}${selectedAddress.area ? `, ${selectedAddress.area}` : ""}`,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        billDetails: {
          itemTotal: subtotal,
          deliveryCharge,
          packagingCharge,
          gstAmount,
          discount,
          discountBreakdown: appliedCoupons.map((c) => ({
            code: c.code,
            amount: getDiscountForCoupon(c, subtotal),
          })),
        },
        totalAmount: grandTotal,
        paymentMethod,
        deliverySlot: selectedSlot,
        couponCode: appliedCoupons.length > 0 ? appliedCoupons.map((c) => c.code).join(",") : undefined,
        discountAmount: discount,
      });
      clearCart();
      clearAllCoupons();
      haptic.orderPlaced();
      toast.success("Order placed successfully!", { haptic: false });
      router.replace({
        pathname: "/(routes)/order-confirmation/[id]" as any,
        params: { id: data.orderId },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      <PageHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Delivery Address ─────────────────────────────────────── */}
        <SectionTitle title="Delivery Address" right={
          <TouchableOpacity onPress={() => setShowAddressModal(true)}>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#5A2C96" }}>Add New</Text>
          </TouchableOpacity>
        } />

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {addresses && addresses.length > 0 ? (
            addresses.map((addr: any, i: number) => {
              const isSelected =
                selectedAddress?.id === addr.id ||
                (i === 0 && !selectedAddress);
              return (
                <AddressCard
                  key={addr.id || i}
                  address={addr}
                  isSelected={isSelected}
                  isDefault={i === 0}
                  onPress={() => {/* address selection handled by store */}}
                />
              );
            })
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddressModal(true)}
              style={{
                borderWidth: 1.5,
                borderColor: "#E2E2E2",
                borderRadius: 16,
                padding: 16,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text style={{ fontFamily: "Inter-Medium", fontSize: 14, color: "#5A2C96" }}>
                + Add delivery address
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Delivery Slot ────────────────────────────────────────── */}
        <SectionTitle title="Delivery Slot" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {SLOT_OPTIONS.map((slot) => {
            const selected = selectedSlot === slot.key;
            return (
              <TouchableOpacity
                key={slot.key}
                onPress={() => setSelectedSlot(slot.key)}
                activeOpacity={0.8}
                style={{
                  width: 110,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: selected ? 2 : 1.5,
                  borderColor: selected ? "#5A2C96" : "#E2E2E2",
                  backgroundColor: "#FFFFFF",
                  alignItems: "flex-start",
                }}
              >
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: "#898B8A", letterSpacing: 0.5, marginBottom: 4 }}>
                  {slot.day}
                </Text>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", lineHeight: 20 }}>
                  {slot.time}
                </Text>
                {slot.badge && (
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: "#5A2C96", marginTop: 4 }}>
                    {slot.badge}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Payment Method ───────────────────────────────────────── */}
        <SectionTitle title="Payment Method" />
        <View style={{ paddingHorizontal: 16, gap: 0 }}>
          <PaymentOption
            id="upi"
            selected={paymentMethod === "upi"}
            onPress={() => setPaymentMethod("upi")}
            icon={<MaterialCommunityIcons name="bank-transfer" size={22} color="#5A2C96" />}
            label="UPI (GPay / PhonePe)"
          />
          <PaymentOption
            id="card"
            selected={paymentMethod === "card"}
            onPress={() => setPaymentMethod("card")}
            icon={<MaterialCommunityIcons name="credit-card-outline" size={22} color="#676968" />}
            label="Credit / Debit Card"
            subtitle="Visa, Mastercard, Amex"
            rightChevron
          />
          <PaymentOption
            id="cod"
            selected={paymentMethod === "cod"}
            onPress={() => setPaymentMethod("cod")}
            icon={<MaterialCommunityIcons name="cash" size={22} color="#676968" />}
            label="Cash on Delivery"
            badge="AVAILABLE"
          />
        </View>

        {/* ── Apply Coupon ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: "#898B8A", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
            Apply Coupon
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#EFEFEF",
              borderRadius: 12,
              paddingHorizontal: 12,
            }}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={18} color="#898B8A" />
              <TextInput
                ref={couponInputRef}
                value={couponInput}
                onChangeText={(t) => setCouponInput(t.toUpperCase())}
                placeholder="Enter coupon code"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="characters"
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  fontFamily: "Inter-SemiBold",
                  fontSize: 14,
                  color: "#1A1C1C",
                }}
              />
            </View>
            <TouchableOpacity
              onPress={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              style={{
                backgroundColor: "#E2E2E2",
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {couponLoading ? (
                <ActivityIndicator size="small" color="#5A2C96" />
              ) : (
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#1A1C1C" }}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Applied coupon success banners */}
          {appliedCoupons.map((coupon) => {
            const saved = getDiscountForCoupon(coupon, subtotal);
            return (
              <View
                key={coupon.code}
                style={{
                  marginTop: 10,
                  backgroundColor: "rgba(90, 44, 150,0.1)",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#5A2C96", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                </View>
                <Text style={{ flex: 1, fontFamily: "Inter-SemiBold", fontSize: 13, color: "#300861" }}>
                  Coupon '{coupon.code}' applied!{saved > 0 ? ` You saved ₹${saved.toFixed(2)}` : " Free delivery!"}
                </Text>
                <TouchableOpacity onPress={() => removeCoupon?.(coupon.code)}>
                  <Ionicons name="close-circle" size={18} color="#5A2C96" />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Available coupon chips (from backend) */}
          {availableCoupons.length > 0 && appliedCoupons.length === 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {availableCoupons.slice(0, 5).map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => { setCouponInput(c.code); couponInputRef.current?.focus(); }}
                  style={{
                    borderWidth: 1.5,
                    borderColor: "#5A2C96",
                    borderRadius: 50,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#5A2C96" }}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Order Summary ────────────────────────────────────────── */}
        <SectionTitle title="Order Summary" />
        <View style={{ paddingHorizontal: 16 }}>
          {/* Cart items */}
          {cart.map((item, idx) => (
            <View
              key={`${item.id}-${idx}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Image
                source={{ uri: item.image || "https://via.placeholder.com/56" }}
                style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: "#E2E2E2" }}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#1A1C1C" }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: "#898B8A", marginTop: 2 }}>
                  Qty: {item.quantity || 1}
                </Text>
              </View>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C" }}>
                ₹{(item.price * (item.quantity || 1)).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#EFEFEF", marginVertical: 8 }} />

          {/* Bill rows */}
          <BillRow label="Item Total (MRP)" value={`₹${subtotal.toFixed(2)}`} />
          {discount > 0 && <BillRow label="Product Discount" value={`-₹${discount.toFixed(2)}`} valueColor="#22C55E" />}
          <BillRow
            label="Delivery Fee"
            value={deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}.00`}
            strikeValue={deliveryCharge === 0 ? `₹${baseDelivery}.00` : undefined}
            valueColor={deliveryCharge === 0 ? "#22C55E" : undefined}
          />
          <BillRow label="Packaging Charges" value={`₹${packagingCharge}.00`} />
          <BillRow label="Taxes (incl. GST)" value={`₹${gstAmount}.00`} />

          {/* Total */}
          <View style={{ height: 1, backgroundColor: "#EFEFEF", marginVertical: 12 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#1A1C1C" }}>Total Amount</Text>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#5A2C96" }}>
              ₹{grandTotal.toFixed(2)}
            </Text>
          </View>

          {/* Place Order button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder || !selectedAddress || !selectedLocation?.storeId}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#0DB3D9", "#5A2C96"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 50,
                paddingVertical: 18,
                alignItems: "center",
                opacity: isPlacingOrder || !selectedAddress || !selectedLocation?.storeId ? 0.5 : 1,
              }}
            >
              {isPlacingOrder ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 17, color: "#FFFFFF", letterSpacing: 0.3 }}>
                  Place Order
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={{
            fontFamily: "Inter-Regular",
            fontSize: 9,
            color: "#A1A1AA",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginTop: 12,
            lineHeight: 14,
          }}>
            By placing an order, you agree to our{"\n"}Terms of Service and Freshness Guarantee.
          </Text>
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

function AddressCard({ address, isSelected, isDefault, onPress }: any) {
  const isHome = (address.label || "").toLowerCase() === "home";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        borderWidth: isSelected ? 2 : 1.5,
        borderColor: isSelected ? "#5A2C96" : "#E2E2E2",
        borderRadius: 16,
        padding: 16,
        backgroundColor: "#FFFFFF",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F3F3", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <Ionicons name={isHome ? "home-outline" : "briefcase-outline"} size={18} color="#676968" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C", marginRight: 8 }}>
              {address.label || address.name || "Address"} {isHome ? "(Primary)" : ""}
            </Text>
            {isDefault && (
              <View style={{ backgroundColor: "#EFEFEF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: "#676968", letterSpacing: 0.5 }}>DEFAULT</Text>
              </View>
            )}
          </View>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#676968", lineHeight: 18 }}>
            {address.street}{address.area ? `, ${address.area}` : ""}{address.city ? `, ${address.city}` : ""}
          </Text>
          {address.phone && (
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#1A1C1C", marginTop: 4 }}>
              +91 {address.phone}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PaymentOption({ id, selected, onPress, icon, label, subtitle, rightChevron, badge }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F3F3",
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
      {rightChevron && (
        <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
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
