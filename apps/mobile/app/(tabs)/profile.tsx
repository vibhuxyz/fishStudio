import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user: cachedUser, updateUserData } = useUser();
  const { cart, wishlist } = useStore();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([]);
  const [isApplyingAI, setIsApplyingAI] = useState(false);

  // ── Fetch fresh user data ────────────────────────────────────────────────
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ["logged-in-user"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/logged-in-user");
      return res.data.user;
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60 * 5,
  });

  // ── Fetch orders ─────────────────────────────────────────────────────────
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/user-orders");
      return res.data.orders || [];
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60 * 2,
  });

  // Use fresh data when available, fall back to cached
  const user = userData || cachedUser;
  const ordersCount = ordersData?.length ?? 0;
  const addresses: any[] = user?.addresses || [];
  const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];

  // ── Photo upload helpers ──────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { toast.error("Permission Required"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { toast.error("Camera permission required"); return; }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0].uri);
  };

  const uploadImage = async (imageUri: string) => {
    setIsUploading(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(",")[1];
            const formData = new FormData();
            formData.append("file", base64);
            formData.append("fileName", `profile_${Date.now()}.jpg`);
            formData.append("useUniqueFileName", "true");
            formData.append("folder", "/profile-avatars");
            const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa(process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY! + ":")}`,
              },
              body: formData,
            });
            const ikData = await ikRes.json();
            if (ikData.url) {
              setUploadedImageUrl(ikData.url);
              setUploadedImageId(ikData.fileId);
              toast.success("Image uploaded! Apply AI features or save.");
            } else throw new Error("Upload failed");
            resolve(ikData);
          } catch (e) {
            toast.error("Failed to upload image");
            reject(e);
          } finally { setIsUploading(false); }
        };
        reader.onerror = () => { setIsUploading(false); reject(new Error("Read failed")); };
        reader.readAsDataURL(blob);
      });
    } catch { setIsUploading(false); toast.error("Failed to process image"); }
  };

  const applyAIFeature = async (feature: string) => {
    if (!uploadedImageUrl) return;
    setIsApplyingAI(true);
    try {
      const baseUrl = uploadedImageUrl.split("?")[0];
      const trMap: Record<string, string> = {
        "bg-remove": "e-bgremove", relight: "e-relight", "quality-improve": "e-retouch",
      };
      const finalUrl = `${baseUrl}?tr=${trMap[feature]}&t=${Date.now()}`;
      await new Promise((r) => setTimeout(r, 4000));
      setUploadedImageUrl(finalUrl);
      setAppliedFeatures((prev) =>
        prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
      );
      toast.success(`${feature} applied!`);
    } catch { toast.error(`Failed to apply ${feature}`); }
    finally { setIsApplyingAI(false); }
  };

  const saveFinalImage = async () => {
    if (!uploadedImageUrl) return;
    try {
      const res = await axiosInstance.post("/auth/api/update-avatar", {
        avatar: { file_id: uploadedImageId, url: uploadedImageUrl },
      });
      if (res.data.success) {
        if (res.data.user) await updateUserData(res.data.user);
        toast.success("Profile photo updated!");
        setShowPhotoModal(false);
        setSelectedImage(null);
        setUploadedImageUrl(null);
        setAppliedFeatures([]);
        refetchUser();
      }
    } catch { toast.error("Failed to update photo"); }
  };

  const logOutHandler = async () => {
    try { 
      await axiosInstance.post("/auth/api/logout-user"); 
    } catch (err) {
      console.log("Backend logout failed (non-critical):", err);
    }
    // Clear all auth data and redirect
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    router.replace("/(routes)/login");
  };

  // ── Menu items ────────────────────────────────────────────────────────────
  const menuItems = [
    {
      id: "orders", title: "My Orders", subtitle: `${ordersLoading ? "..." : ordersCount} order${ordersCount !== 1 ? "s" : ""} placed`,
      icon: "bag-outline", iconColor: "#2563EB", iconBg: "#DBEAFE",
      onPress: () => router.push("/(routes)/my-orders"),
    },
    {
      id: "inbox", title: "Inbox", subtitle: "View your messages",
      icon: "mail-outline", iconColor: "#059669", iconBg: "#D1FAE5",
      onPress: () => router.push("/(tabs)/messages"),
    },
    {
      id: "notifications", title: "Notifications", subtitle: "Manage your notifications",
      icon: "notifications-outline", iconColor: "#D97706", iconBg: "#FEF3C7",
      onPress: () => router.push("/(routes)/notifications"),
    },
    {
      id: "shipping", title: "Shipping Address",
      subtitle: addresses.length > 0 ? `${addresses.length} address${addresses.length !== 1 ? "es" : ""} saved` : "Add a delivery address",
      icon: "location-outline", iconColor: "#7C3AED", iconBg: "#EDE9FE",
      onPress: () => router.push("/(routes)/shipping"),
    },
    {
      id: "password", title: "Change Password", subtitle: "Update your account password",
      icon: "lock-closed-outline", iconColor: "#DC2626", iconBg: "#FEE2E2",
      onPress: () => router.push("/(routes)/change-password"),
    },
    {
      id: "settings", title: "Account Settings", subtitle: "Manage your preferences",
      icon: "settings-outline", iconColor: "#6B7280", iconBg: "#F3F4F6",
      onPress: () => router.push("/(routes)/settings"),
    },
  ];

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!cachedUser) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
            <Ionicons name="person-outline" size={44} color="#6C3CE1" />
          </View>
          <Text className="text-xl font-poppins-bold text-gray-900 mb-2">
            You're not logged in
          </Text>
          <Text className="text-gray-500 font-poppins-medium text-center mb-8">
            Login to view your profile, orders and more
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

  // ── Main profile ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text
          className="text-2xl text-gray-900"
          style={{ fontFamily: "Poppins-Bold", fontWeight: Platform.OS === "android" ? "700" : "normal" }}
        >
          My Profile
        </Text>
        <Text className="text-sm text-gray-500 font-poppins-medium mt-0.5">
          Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">

          {/* ── Profile card ─────────────────────────────────────────── */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            {userLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#6C3CE1" />
              </View>
            ) : (
              <>
                {/* Avatar + info */}
                <View className="flex-row items-center mb-5">
                  <View className="relative">
                    <Image
                      source={{
                        uri: user?.avatar?.url ||
                          "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "U") + "&background=6C3CE1&color=fff&size=150",
                      }}
                      className="w-20 h-20 rounded-full bg-gray-100"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full items-center justify-center border-2 border-white"
                      onPress={() => setShowPhotoModal(true)}
                    >
                      <Ionicons name="camera" size={13} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View className="ml-4 flex-1">
                    <Text
                      className="text-lg text-gray-900 leading-tight"
                      style={{ fontFamily: "Poppins-Bold", fontWeight: Platform.OS === "android" ? "700" : "normal" }}
                      numberOfLines={1}
                    >
                      {user?.name || "—"}
                    </Text>
                    {user?.email ? (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="mail-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-500 font-poppins-medium text-xs ml-1" numberOfLines={1}>
                          {user.email}
                        </Text>
                      </View>
                    ) : null}
                    {user?.phone ? (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="call-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-500 font-poppins-medium text-xs ml-1">
                          {user.phone}
                        </Text>
                      </View>
                    ) : null}
                    {defaultAddress ? (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-500 font-poppins-medium text-xs ml-1" numberOfLines={1}>
                          {defaultAddress.city}, {defaultAddress.state || defaultAddress.country}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Stats row */}
                <View className="flex-row gap-3">
                  {/* Orders */}
                  <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
                    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mb-1">
                      <Ionicons name="bag-outline" size={16} color="#2563EB" />
                    </View>
                    <Text className="text-lg font-poppins-bold text-gray-900">
                      {ordersLoading ? "—" : ordersCount}
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-poppins-medium">Orders</Text>
                  </View>

                  {/* Wishlist */}
                  <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                    <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mb-1">
                      <Ionicons name="heart-outline" size={16} color="#EF4444" />
                    </View>
                    <Text className="text-lg font-poppins-bold text-gray-900">
                      {wishlist.length}
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-poppins-medium">Wishlist</Text>
                  </View>

                  {/* Cart */}
                  <View className="flex-1 bg-green-50 rounded-xl p-3 items-center">
                    <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mb-1">
                      <Ionicons name="cart-outline" size={16} color="#16a34a" />
                    </View>
                    <Text className="text-lg font-poppins-bold text-gray-900">
                      {cart.length}
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-poppins-medium">Cart</Text>
                  </View>

                  {/* Addresses */}
                  <View className="flex-1 bg-purple-50 rounded-xl p-3 items-center">
                    <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mb-1">
                      <Ionicons name="location-outline" size={16} color="#7C3AED" />
                    </View>
                    <Text className="text-lg font-poppins-bold text-gray-900">
                      {addresses.length}
                    </Text>
                    <Text className="text-[10px] text-gray-500 font-poppins-medium">Address</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* ── Account info detail card ──────────────────────────────── */}
          {user && (
            <View className="bg-white rounded-2xl border border-gray-100 px-4 py-4 mb-4">
              <Text className="text-sm font-poppins-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account Info
              </Text>
              <InfoRow icon="person-outline" label="Full Name" value={user.name || "—"} />
              <InfoRow icon="mail-outline" label="Email" value={user.email || "—"} />
              <InfoRow icon="call-outline" label="Phone" value={user.phone || "Not added"} />
              <InfoRow
                icon="location-outline"
                label="Default Address"
                value={
                  defaultAddress
                    ? `${defaultAddress.street}, ${defaultAddress.city}`
                    : "No address saved"
                }
                last
              />
            </View>
          )}

          {/* ── Menu list ─────────────────────────────────────────────── */}
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-4 ${
                  idx < menuItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-poppins-semibold text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-400 font-poppins-medium mt-0.5">
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Logout ────────────────────────────────────────────────── */}
          <TouchableOpacity
            className="bg-red-50 rounded-2xl border border-red-100 py-4 items-center flex-row justify-center mb-4"
            onPress={logOutHandler}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 font-poppins-semibold text-red-500 text-base">
              Logout
            </Text>
          </TouchableOpacity>

          <View className="h-6" />
        </View>
      </ScrollView>

      {/* ── Photo modal ──────────────────────────────────────────────────── */}
      <Modal visible={showPhotoModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-lg font-poppins-semibold text-gray-900">
              Change Photo
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowPhotoModal(false);
                setSelectedImage(null);
                setUploadedImageUrl(null);
                setAppliedFeatures([]);
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {!selectedImage ? (
              <View className="gap-3">
                <TouchableOpacity
                  className="flex-row items-center p-4 border border-gray-200 rounded-2xl"
                  onPress={takePhoto}
                >
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="camera" size={24} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-gray-900">Take Photo</Text>
                    <Text className="text-gray-500 text-sm font-poppins-medium">Use camera</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center p-4 border border-gray-200 rounded-2xl"
                  onPress={pickImage}
                >
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="images" size={24} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-gray-900">Choose from Library</Text>
                    <Text className="text-gray-500 text-sm font-poppins-medium">From gallery</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-5">
                <View className="items-center">
                  {isApplyingAI ? (
                    <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center">
                      <ActivityIndicator color="#6C3CE1" />
                      <Text className="text-xs text-gray-500 mt-2">Applying AI...</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: uploadedImageUrl || selectedImage }}
                      className="w-32 h-32 rounded-full"
                      resizeMode="cover"
                    />
                  )}
                  <Text className="text-sm text-gray-500 font-poppins-medium mt-2">Preview</Text>
                </View>

                {!uploadedImageUrl ? (
                  <TouchableOpacity
                    className="py-3.5 bg-primary rounded-2xl items-center"
                    onPress={() => selectedImage && uploadImage(selectedImage)}
                    disabled={isUploading}
                  >
                    <Text className="text-white font-poppins-semibold">
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="gap-3">
                    <Text className="text-sm font-poppins-semibold text-gray-700">
                      Enhance with AI (optional)
                    </Text>
                    {[
                      { key: "bg-remove", label: "Remove Background", icon: "cut", color: "#7C3AED", bg: "#EDE9FE" },
                      { key: "relight", label: "Relight", icon: "sunny", color: "#F59E0B", bg: "#FEF3C7" },
                      { key: "quality-improve", label: "Improve Quality", icon: "sparkles", color: "#2563EB", bg: "#DBEAFE" },
                    ].map((f) => (
                      <TouchableOpacity
                        key={f.key}
                        className={`flex-row items-center p-3 border rounded-xl ${
                          appliedFeatures.includes(f.key) ? "border-primary bg-primary/5" : "border-gray-200"
                        }`}
                        onPress={() => applyAIFeature(f.key)}
                        disabled={isApplyingAI}
                      >
                        <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: f.bg }}>
                          <Ionicons name={f.icon as any} size={20} color={f.color} />
                        </View>
                        <Text className="flex-1 font-poppins-semibold text-gray-900">{f.label}</Text>
                        {appliedFeatures.includes(f.key) && (
                          <Ionicons name="checkmark-circle" size={20} color="#6C3CE1" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View className="flex-row gap-3 pt-2">
                  <TouchableOpacity
                    className="flex-1 py-3 border border-gray-200 rounded-2xl items-center"
                    onPress={() => { setSelectedImage(null); setUploadedImageUrl(null); setAppliedFeatures([]); }}
                  >
                    <Text className="font-poppins-semibold text-gray-700">Retake</Text>
                  </TouchableOpacity>
                  {uploadedImageUrl && (
                    <TouchableOpacity
                      className="flex-1 py-3 bg-primary rounded-2xl items-center"
                      onPress={saveFinalImage}
                    >
                      <Text className="font-poppins-semibold text-white">Save Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Reusable info row ──────────────────────────────────────────────────────
function InfoRow({
  icon, label, value, last = false,
}: {
  icon: string; label: string; value: string; last?: boolean;
}) {
  return (
    <View className={`flex-row items-center py-3 ${last ? "" : "border-b border-gray-100"}`}>
      <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon as any} size={16} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] text-gray-400 font-poppins-medium uppercase tracking-wider">
          {label}
        </Text>
        <Text className="text-sm text-gray-900 font-poppins-medium mt-0.5" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
