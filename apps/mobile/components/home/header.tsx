import AddressModal from "@/components/shared/address-modal";
import { useAddressStore } from "@/lib/address-store";
import { useStore } from "@/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const { selectedLocation, getSelectedAddress, locationVersion } = useAddressStore();
  const { cart } = useStore();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tick, setTick] = useState(0);

  // Re-evaluate delivery label every 60 s so open/closed state stays current
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const selectedAddress = getSelectedAddress();

  const locationLine =
    selectedLocation?.city && selectedLocation?.pincode
      ? `${selectedLocation.city} · ${selectedLocation.pincode}`
      : selectedAddress
      ? `${selectedAddress.city} · ${selectedAddress.pincode}`
      : null;

  const deliveryLabel: { primary: string; secondary: string | null } = (() => {
    if (!selectedLocation && !selectedAddress) return { primary: "Set delivery location", secondary: null };

    if (selectedLocation?.isOpen === false) {
      return {
        primary: "Scheduled delivery available",
        secondary: `Opens at ${selectedLocation.openingHours || "9 AM"}`,
      };
    }
    if (selectedLocation?.deliveryTimeMinutes) {
      return {
        primary: `⚡ Instant · ${selectedLocation.deliveryTimeMinutes} min`,
        secondary: null,
      };
    }
    if (selectedLocation) {
      return { primary: "Scheduled delivery available", secondary: null };
    }
    return { primary: "Set delivery location", secondary: null };
  })();

  return (
    <View className="bg-white">
      {/* ── Main row: icon | delivery info | cart ── */}
      <View className="flex-row items-center px-4 pt-3 pb-2">
        {/* iOS-style squircle icon — no text */}
        <TouchableOpacity
          onPress={() => setShowAddressModal(true)}
          activeOpacity={0.85}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: "#6C3CE1",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#6C3CE1",
              shadowOpacity: 0.35,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <MaterialCommunityIcons name="fish" size={26} color="white" />
          </View>
        </TouchableOpacity>

        {/* Delivery details — tappable to open modal */}
        <TouchableOpacity
          className="flex-1 mx-3"
          onPress={() => setShowAddressModal(true)}
          activeOpacity={0.7}
        >
          {/* Primary delivery label */}
          <View className="flex-row items-center mb-0.5">
            <Text
              className="text-sm font-poppins-semibold text-offer-green"
              numberOfLines={1}
            >
              {deliveryLabel.primary}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color="#22C55E"
              style={{ marginLeft: 2 }}
            />
          </View>

          {/* Secondary line (opens at / slot window) */}
          {deliveryLabel.secondary ? (
            <View className="flex-row items-center mb-0.5">
              <Ionicons name="time-outline" size={12} color="#64748B" />
              <Text className="text-xs text-muted-foreground font-poppins ml-1">
                {deliveryLabel.secondary}
              </Text>
            </View>
          ) : null}

          {/* Location bold */}
          {locationLine ? (
            <View className="flex-row items-center mb-0.5">
              <Ionicons name="location-outline" size={12} color="#64748B" />
              <Text
                className="text-xs font-poppins-semibold text-foreground ml-1"
                numberOfLines={1}
              >
                {locationLine}
              </Text>
            </View>
          ) : null}

          {/* Fallback if no location set */}
          {!locationLine && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={12} color="#94A3B8" />
              <Text className="text-xs text-muted-foreground font-poppins ml-1">
                Tap to set delivery location
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cart pill */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/cart")}
          activeOpacity={0.85}
        >
          {cartCount > 0 ? (
            <View
              style={{ backgroundColor: "#22C55E", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="cart-outline" size={16} color="white" />
              <Text style={{ color: "white", fontSize: 11, fontFamily: "Poppins-SemiBold", marginLeft: 4 }}>
                {cartCount} item{cartCount !== 1 ? "s" : ""}{"\n"}
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 12 }}>₹{cartTotal}</Text>
              </Text>
            </View>
          ) : (
            <View className="w-9 h-9 bg-muted rounded-xl items-center justify-center">
              <Ionicons name="cart-outline" size={20} color="#64748B" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <View className="px-4 pb-4">
        <TouchableOpacity
          className="flex-row items-center bg-muted rounded-xl px-4 py-3"
          onPress={() => router.push("/(routes)/products")}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={18} color="#94A3B8" />
          <Text className="flex-1 ml-3 text-muted-foreground font-poppins text-sm">
            Search for fish, meat, cuts...
          </Text>
        </TouchableOpacity>
      </View>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />
    </View>
  );
}
