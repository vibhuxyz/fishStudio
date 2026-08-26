import { useCouponStore } from "@/lib/coupon-store";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { rankCoupons } from "@repo/shared/pricing";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#5A2C96";

interface CouponSheetProps {
  visible: boolean;
  onClose: () => void;
  subtotal: number;
  /** What a free-delivery coupon is worth right now — feeds the ranking. */
  deliveryCharge: number;
  storeId?: string;
}

/**
 * Every offer for the current store in one bottom sheet, opened from the cart
 * and from checkout. Both surfaces rank with the same rankCoupons() the web
 * cart uses, so "best offer first" means the same thing everywhere.
 */
export default function CouponSheet({
  visible,
  onClose,
  subtotal,
  deliveryCharge,
  storeId,
}: CouponSheetProps) {
  const {
    appliedCoupons,
    availableCoupons,
    applyCoupon,
    removeCoupon,
    isCouponApplied,
    getDiscountForCoupon,
    validateCouponCode,
  } = useCouponStore();
  const insets = useSafeAreaInsets();

  const [couponInput, setCouponInput] = useState("");
  const [validating, setValidating] = useState(false);

  const ranked = useMemo(
    () => rankCoupons(availableCoupons, { subtotal, deliveryCharge }),
    [availableCoupons, subtotal, deliveryCharge],
  );

  const handleApply = async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    if (isCouponApplied(normalized)) {
      toast.info("Coupon already applied");
      setCouponInput("");
      return;
    }

    // Anything already in the store's offer list can be applied without a
    // round trip; order-service re-checks it at create time regardless.
    const known = availableCoupons.find((c) => c.code.toUpperCase() === normalized);
    if (known) {
      if (subtotal < known.minOrderValue) {
        toast.error(`Add ₹${known.minOrderValue - subtotal} more to use this coupon`);
        return;
      }
      applyCoupon(known);
      setCouponInput("");
      toast.success(
        known.discountType === "free_delivery"
          ? `${known.code} applied — free delivery`
          : `Coupon applied! Saving ₹${getDiscountForCoupon(known, subtotal)}`,
      );
      onClose();
      return;
    }

    if (!storeId) {
      toast.error("Select a delivery location first");
      return;
    }

    setValidating(true);
    const { coupon, error } = await validateCouponCode(normalized, subtotal, storeId);
    setValidating(false);

    if (!coupon) {
      toast.error(error || "Invalid coupon code");
      return;
    }
    applyCoupon(coupon);
    setCouponInput("");
    toast.success(
      coupon.discountType === "free_delivery"
        ? `${coupon.code} applied — free delivery`
        : `Coupon applied! Saving ₹${getDiscountForCoupon(coupon, subtotal)}`,
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Swallow taps inside the sheet so they don't dismiss it */}
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 28,
            maxHeight: "80%",
            flexShrink: 1,
          }}
        >
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 44, height: 5, borderRadius: 99, backgroundColor: "#D1D5DB" }} />
          </View>
          <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#1A1C1C" }}>
              Available Coupons
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Manual code entry */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
                borderRadius: 12,
                paddingHorizontal: 12,
              }}
            >
              <MaterialCommunityIcons name="ticket-percent-outline" size={18} color="#898B8A" />
              <TextInput
                value={couponInput}
                onChangeText={(t) => setCouponInput(t.toUpperCase())}
                placeholder="Enter coupon code"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="characters"
                onSubmitEditing={() => handleApply(couponInput)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  fontFamily: "Inter-SemiBold",
                  fontSize: 14,
                  color: "#1A1C1C",
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => handleApply(couponInput)}
              disabled={validating || !couponInput.trim()}
              activeOpacity={0.85}
              style={{
                backgroundColor: couponInput.trim() ? PRIMARY : "#E2E2E2",
                paddingHorizontal: 22,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {validating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    fontFamily: "Inter-SemiBold",
                    fontSize: 14,
                    color: couponInput.trim() ? "#FFFFFF" : "#898B8A",
                  }}
                >
                  Apply
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {appliedCoupons.map((coupon) => {
              const saved = getDiscountForCoupon(coupon, subtotal);
              return (
                <View
                  key={coupon.code}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor: PRIMARY,
                    backgroundColor: "rgba(90,44,150,0.06)",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: PRIMARY,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#300861" }}>
                      {coupon.code}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter-Medium",
                        fontSize: 12,
                        color: "#5A2C96",
                        marginTop: 1,
                      }}
                    >
                      {saved > 0 ? `Applied · You saved ₹${saved}` : "Applied · Free delivery"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeCoupon(coupon.code)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: "#DC2626" }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {ranked.length === 0 && appliedCoupons.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 36 }}>
                <MaterialCommunityIcons name="ticket-outline" size={44} color="#CBD5E1" />
                <Text
                  style={{
                    fontFamily: "Inter-Medium",
                    fontSize: 14,
                    color: "#94A3B8",
                    marginTop: 10,
                  }}
                >
                  No offers available right now
                </Text>
              </View>
            ) : null}

            {ranked.map(({ coupon, eligible, saving, amountToUnlock }) => {
              const applied = isCouponApplied(coupon.code);
              if (applied) return null;
              return (
                <View
                  key={coupon.code}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    opacity: eligible ? 1 : 0.7,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: "Inter-Bold",
                          fontSize: 15,
                          color: PRIMARY,
                          letterSpacing: 0.5,
                        }}
                      >
                        {coupon.code}
                      </Text>
                      {coupon.badge && (
                        <View
                          style={{
                            backgroundColor: "#FEF3C7",
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{ fontFamily: "Inter-SemiBold", fontSize: 9, color: "#92400E" }}
                          >
                            {coupon.badge.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter-Medium",
                        fontSize: 12,
                        color: "#676968",
                        marginTop: 3,
                        lineHeight: 17,
                      }}
                    >
                      {coupon.description}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter-SemiBold",
                        fontSize: 12,
                        color: eligible ? "#22C55E" : "#DC2626",
                        marginTop: 4,
                      }}
                    >
                      {eligible
                        ? coupon.discountType === "free_delivery"
                          ? "Free delivery on this order"
                          : `Save ₹${saving} on this order`
                        : `Add ₹${amountToUnlock} more to unlock`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleApply(coupon.code)}
                    disabled={!eligible}
                    activeOpacity={0.8}
                    style={{
                      borderWidth: 1.5,
                      borderColor: eligible ? PRIMARY : "#D8D8DC",
                      borderRadius: 50,
                      paddingHorizontal: 18,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter-SemiBold",
                        fontSize: 13,
                        color: eligible ? PRIMARY : "#A1A1AA",
                      }}
                    >
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
