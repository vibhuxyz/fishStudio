import LocationModal from "@/components/shared/location-modal";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const [location, setLocation] = useState({ name: "Motipur", deliveryTime: "~58 min delivery" });
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <View className="bg-white">
      {/* Top Header Row */}
      <View
        className="flex-row items-center justify-between px-4 pt-2 pb-3"
        style={{
          paddingTop: 10,
        }}
      >
        {/* Logo */}
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-primary rounded-xl items-center justify-center">
            <MaterialCommunityIcons name="fish" size={24} color="white" />
          </View>
          <View className="ml-3">
            <Text className="text-sm font-poppins-semibold text-foreground">
              Fish Studio
            </Text>
            <Text className="text-xs text-muted-foreground font-poppins">
              Fresh Fish & Meat
            </Text>
          </View>
        </View>

        {/* Right Icons */}
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="p-2">
            <Ionicons name="grid-outline" size={24} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2"
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person-outline" size={24} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-muted rounded-xl"
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons name="cart-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location & Status Bar */}
      <View className="px-4 pb-3">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowLocationModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={16} color="#22C55E" />
          <Text className="text-sm font-poppins-semibold text-offer-green ml-1">
            {location.name ? `📍 ${location.name} • ${location.deliveryTime}` : "Set Location"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="#22C55E"
            className="ml-1"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-4">
        <TouchableOpacity
          className="flex-row items-center bg-muted rounded-xl px-4 py-3"
          onPress={() => router.push("/(routes)/products")}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#94A3B8" />
          <Text className="flex-1 ml-3 text-muted-foreground font-poppins">
            Search for fish, meat, cuts...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={(loc) => setLocation(loc)}
      />
    </View>
  );
}
