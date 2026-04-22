import AddressModal from "@/components/shared/address-modal";
import { useAddress } from "@/hooks/useAddress";
import { useAddressStore } from "@/lib/address-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useUser from "@/hooks/useUser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/utils/toast";
import axiosInstance from "@/utils/axiosInstance";

export default function ShippingAddressScreen() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { addresses, fetchAddresses, selectAddress } = useAddress();
  const { selectedAddressId, setAddresses } = useAddressStore();

  const loadAddresses = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      await fetchAddresses();
    } catch {
      // fetchAddresses handles errors internally
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAddresses();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { data } = await axiosInstance.delete(`/auth/api/delete-address/${id}`);
      if (data.success) {
        setAddresses(data.addresses);
        toast.success("Address removed");
      }
    } catch {
      toast.error("Failed to remove address");
    }
  };

  const getIcon = (label: string) =>
    label === "Home" ? "home-outline" : label === "Work" ? "briefcase-outline" : "location-outline";

  const getIconBg = (label: string, selected: boolean) =>
    selected ? "#DCFCE7" : label === "Home" ? "#DBEAFE" : label === "Work" ? "#D1FAE5" : "#F3F4F6";

  const getIconColor = (label: string, selected: boolean) =>
    selected ? "#22C55E" : label === "Home" ? "#2563EB" : label === "Work" ? "#059669" : "#6B7280";

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={{ backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#111827" }}>Saved Addresses</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="location-outline" size={64} color="#CBD5E1" />
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#111827", marginTop: 16, marginBottom: 8 }}>
            You are not logged in
          </Text>
          <Text style={{ fontFamily: "Poppins-Medium", fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>
            Login to save and manage your delivery addresses.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(routes)/login")}
            style={{ backgroundColor: "#6C3CE1", paddingHorizontal: 24, paddingVertical: 13, borderRadius: 14, width: "100%", alignItems: "center" }}
          >
            <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 15, color: "#fff" }}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={{ backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#111827" }}>Saved Addresses</Text>
            <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13, color: "#6B7280" }}>
              {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#22C55E", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 13, color: "#fff" }}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && addresses.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#6C3CE1" />
          <Text style={{ fontFamily: "Poppins-Medium", fontSize: 14, color: "#6B7280", marginTop: 12 }}>
            Loading addresses...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadAddresses(true)}
              colors={["#6C3CE1"]}
              tintColor="#6C3CE1"
            />
          }
        >
          {addresses.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 80 }}>
              <Ionicons name="location-outline" size={72} color="#CBD5E1" />
              <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#111827", marginTop: 16, marginBottom: 6 }}>
                No saved addresses
              </Text>
              <Text style={{ fontFamily: "Poppins-Medium", fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>
                Add your home or work address for faster checkout.
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#22C55E", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 15, color: "#fff" }}>Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;
                return (
                  <TouchableOpacity
                    key={address.id}
                    onPress={() => {
                      selectAddress(address.id);
                      toast.success(`${address.label} set as primary address`);
                    }}
                    activeOpacity={0.75}
                    style={{
                      borderRadius: 18,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#22C55E" : "#E5E7EB",
                      backgroundColor: isSelected ? "#F0FDF4" : "#fff",
                    }}
                  >
                    {/* Card body */}
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: getIconBg(address.label, isSelected) }}>
                        <Ionicons name={getIcon(address.label) as any} size={22} color={getIconColor(address.label, isSelected)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 15, color: "#111827" }}>{address.label}</Text>
                          {isSelected && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#DCFCE7", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                              <Ionicons name="checkmark-circle" size={11} color="#22C55E" />
                              <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 10, color: "#22C55E" }}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13, color: "#6B7280", lineHeight: 20 }}>
                          {address.name}{(address as any).phone ? ` · ${(address as any).phone}` : ""}
                        </Text>
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13, color: "#6B7280" }}>
                          {address.street}
                          {(address as any).landmark ? `, ${(address as any).landmark}` : ""}
                          {address.area ? `, ${address.area}` : ""}
                        </Text>
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13, color: "#6B7280" }}>
                          {address.city}{address.state ? `, ${address.state}` : ""} - {address.pincode}
                        </Text>
                      </View>
                    </View>

                    {/* Action row */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 10 }}>
                      {!isSelected ? (
                        <TouchableOpacity onPress={() => { selectAddress(address.id); toast.success(`${address.label} set as primary address`); }}>
                          <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 13, color: "#6C3CE1" }}>Set as Default</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>
                          Primary delivery address
                        </Text>
                      )}
                      {!isSelected && (
                        <TouchableOpacity
                          onPress={() => handleDelete(address.id)}
                          style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }}
                        >
                          <Ionicons name="trash-outline" size={17} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* AddressModal — handles all add/pincode flow */}
      <AddressModal
        visible={showModal}
        onClose={() => { setShowModal(false); loadAddresses(); }}
      />
    </SafeAreaView>
  );
}
