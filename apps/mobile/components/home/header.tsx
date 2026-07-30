import AddressModal from "@/components/shared/address-modal";
import { colors } from "@/constants/theme";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// Store hours come from the DB as 24h "HH:mm" strings (e.g. "09:00") — drop
// ":00" minutes to match the "6 AM" style already used for delivery slots.
const formatHour = (time?: string) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")} ${period}` : `${hour12} ${period}`;
};

export default function Header() {
  const { selectedLocation, getSelectedAddress } = useAddressStore();
  const { user } = useUser();
  const [showAddressModal, setShowAddressModal] = useState(false);

  const selectedAddress = getSelectedAddress();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-user-notifications");
      const notifications = res.data?.notifications ?? [];
      return notifications.filter((n: { status: string }) => n.status === "Unread").length;
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const locationLine =
    selectedLocation?.city
      ? selectedLocation.pincode
        ? `${selectedLocation.city}, ${selectedLocation.pincode}`
        : selectedLocation.city
      : selectedAddress
      ? `${selectedAddress.city}, ${selectedAddress.pincode}`
      : "Set location";

  return (
    <View className="bg-white px-4 pt-4 pb-2">
      {/* ── Top row: Logo | Delivery | Profile ── */}
      <View className="flex-row items-center">

        {/* Logo group */}
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowAddressModal(true)}
          activeOpacity={0.85}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#5A2C96",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#5A2C96",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 5,
            }}
          >
            <MaterialCommunityIcons name="fish" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* Delivery location */}
        <TouchableOpacity
          className="items-start mx-2"
          style={{ flex: 1 }}
          onPress={() => setShowAddressModal(true)}
          activeOpacity={0.7}
        >
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 10, color: "#898B8A" }}>
            Delivering to
          </Text>
          <View className="flex-row items-center" style={{ maxWidth: "100%" }}>
            <Ionicons name="location-outline" size={12} color="#5A2C96" />
            <Text
              style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#1A1C1C", flexShrink: 1, marginLeft: 2 }}
              numberOfLines={1}
            >
              {locationLine}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#676968" style={{ marginLeft: 1 }} />
          </View>
          {selectedLocation?.isOpen === false ? (
            <View className="flex-row items-center" style={{ marginTop: 2 }}>
              <Ionicons name="calendar-outline" size={11} color={colors.primary} />
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: colors.primary, marginLeft: 3 }}>
                {formatHour(selectedLocation.openingHours) && formatHour(selectedLocation.closingHours)
                  ? `Scheduled · ${formatHour(selectedLocation.openingHours)} - ${formatHour(selectedLocation.closingHours)}`
                  : "Store closed · Scheduled delivery only"}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center" style={{ marginTop: 2 }}>
              <Ionicons name="flash" size={11} color={colors.primary} />
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: colors.primary, marginLeft: 3 }}>
                {selectedLocation?.deliveryTimeMinutes
                  ? `Instant · ${selectedLocation.deliveryTimeMinutes} min`
                  : "30-45 mins delivery"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          onPress={() => router.push("/(routes)/notifications")}
          activeOpacity={0.8}
          style={{ marginLeft: 8 }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F3F3F3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#1A1C1C" />
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  paddingHorizontal: 3,
                  backgroundColor: "#EF4444",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1.5,
                  borderColor: "#FFFFFF",
                }}
              >
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 9, color: "#FFFFFF" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Profile icon — cart moved to the floating "View cart" bar */}
        <TouchableOpacity
          onPress={() => router.push(user ? "/(tabs)/profile" : "/(routes)/login")}
          activeOpacity={0.8}
          style={{ marginLeft: 8 }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F3F3F3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={20} color="#1A1C1C" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <TouchableOpacity
        className="flex-row items-center mt-4 mb-1"
        style={{
          backgroundColor: "#EFEFEF",
          borderRadius: 50,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        onPress={() => router.push("/(routes)/products")}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={18} color="#A1A1AA" />
        <Text
          style={{ fontFamily: "Inter-Regular", fontSize: 14, color: "#A1A1AA", marginLeft: 10, flex: 1 }}
          numberOfLines={1}
        >
          Search for fish, seafood, chicken, mutton...
        </Text>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "#5A2C96",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="mic-outline" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />
    </View>
  );
}
