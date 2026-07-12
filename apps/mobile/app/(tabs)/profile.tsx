import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Colors from theme ────────────────────────────────────────────────────────
const PRIMARY = "#5A2C96";
const PRIMARY_DARK = "#300861";
const SCREEN_BG = "#F4F4F4";

export default function Profile() {
  const { user: cachedUser, updateUserData } = useUser();
  const { wishlist } = useStore();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([]);
  const [isApplyingAI, setIsApplyingAI] = useState(false);

  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ["logged-in-user"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/logged-in-user");
      return res.data.user;
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60 * 5,
  });

  const user = userData || cachedUser;
  const addresses: any[] = user?.addresses || [];
  const joinYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  // ── Photo upload ──────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { toast.error("Permission Required"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { toast.error("Camera permission required"); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setSelectedImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
      const response = await fetch(uri);
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
              headers: { Authorization: `Basic ${btoa(process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY! + ":")}` },
              body: formData,
            });
            const ikData = await ikRes.json();
            if (ikData.url) { setUploadedImageUrl(ikData.url); setUploadedImageId(ikData.fileId); toast.success("Photo uploaded!"); }
            else throw new Error("Upload failed");
            resolve(ikData);
          } catch (e) { toast.error("Failed to upload image"); reject(e); }
          finally { setIsUploading(false); }
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
      const trMap: Record<string, string> = { "bg-remove": "e-bgremove", relight: "e-relight", "quality-improve": "e-retouch" };
      const finalUrl = `${baseUrl}?tr=${trMap[feature]}&t=${Date.now()}`;
      await new Promise((r) => setTimeout(r, 4000));
      setUploadedImageUrl(finalUrl);
      setAppliedFeatures((prev) => prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]);
      toast.success(`${feature} applied!`);
    } catch { toast.error(`Failed to apply ${feature}`); }
    finally { setIsApplyingAI(false); }
  };

  const saveFinalImage = async () => {
    if (!uploadedImageUrl) return;
    try {
      const res = await axiosInstance.post("/auth/api/update-avatar", { avatar: { file_id: uploadedImageId, url: uploadedImageUrl } });
      if (res.data.success) {
        if (res.data.user) await updateUserData(res.data.user);
        toast.success("Profile photo updated!");
        setShowPhotoModal(false); setSelectedImage(null); setUploadedImageUrl(null); setAppliedFeatures([]);
        refetchUser();
      }
    } catch { toast.error("Failed to update photo"); }
  };

  const logOutHandler = async () => {
    try { await axiosInstance.post("/auth/api/logout-user"); } catch {}
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    router.replace("/(routes)/login");
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!cachedUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BG }}>
        <PageHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="person-outline" size={38} color={PRIMARY} />
          </View>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#1A1C1C", marginBottom: 8 }}>Not logged in</Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: "#898B8A", textAlign: "center", marginBottom: 24 }}>
            Login to view your profile, orders and more
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(routes)/login")}
            style={{ backgroundColor: PRIMARY, width: "100%", paddingVertical: 16, borderRadius: 50, alignItems: "center" }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#FFFFFF" }}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG} />
      <PageHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>

        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <Card style={{ alignItems: "center", paddingVertical: 28 }}>
          {userLoading ? (
            <ActivityIndicator color={PRIMARY} style={{ paddingVertical: 32 }} />
          ) : (
            <>
              {/* Avatar */}
              <View style={{ position: "relative", marginBottom: 14 }}>
                <Image
                  source={{
                    uri: user?.avatar?.url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6627F2&color=fff&size=200`,
                  }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(true)}
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: PRIMARY,
                    alignItems: "center", justifyContent: "center",
                    borderWidth: 2, borderColor: "#FFFFFF",
                  }}
                >
                  <Ionicons name="pencil" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontFamily: "Inter-Bold", fontSize: 22, color: "#1A1C1C", marginBottom: 4 }}>
                {user?.name || "User"}
              </Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#898B8A", marginBottom: 14 }}>
                FishStudio Member since {joinYear}
              </Text>

              {/* Premium badge */}
              <LinearGradient
                colors={["#0DB3D9", "#5A2C96"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 50, paddingHorizontal: 20, paddingVertical: 8 }}
              >
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 11, color: "#FFFFFF", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Premium Account
                </Text>
              </LinearGradient>
            </>
          )}
        </Card>

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <Card>
          <MenuRow
            icon={<MaterialCommunityIcons name="receipt-outline" size={20} color="#676968" />}
            label="Order History"
            onPress={() => router.push("/(routes)/my-orders")}
          />
          <View style={{ height: 1, backgroundColor: "#F3F3F3" }} />
          <MenuRow
            icon={<Ionicons name="heart-outline" size={20} color="#676968" />}
            label="Saved Selections"
            onPress={() => router.push("/(routes)/products")}
          />
          <View style={{ height: 1, backgroundColor: "#F3F3F3" }} />
          <TouchableOpacity
            onPress={logOutHandler}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 4 }}
          >
            <View style={{ width: 28, alignItems: "center", marginRight: 14 }}>
              <Ionicons name="log-out-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: PRIMARY }}>Logout</Text>
          </TouchableOpacity>
        </Card>

        {/* ── Contact Details ──────────────────────────────────────────── */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#1A1C1C" }}>Contact Details</Text>
            <TouchableOpacity onPress={() => router.push("/(routes)/settings")}>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#A1A1AA", letterSpacing: 0.5 }}>EDIT</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: "#A1A1AA", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
              Email Address
            </Text>
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 15, color: "#1A1C1C" }}>
              {user?.email || "—"}
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: "#A1A1AA", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
              Phone Number
            </Text>
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 15, color: "#1A1C1C" }}>
              {user?.phone ? `+91 ${user.phone}` : "—"}
            </Text>
          </View>
        </Card>

        {/* ── Payment ──────────────────────────────────────────────────── */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#1A1C1C" }}>Payment</Text>
            <TouchableOpacity>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#A1A1AA", letterSpacing: 0.5 }}>MANAGE</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F7F7F7", borderRadius: 12, padding: 14 }}>
            <View style={{ backgroundColor: "#E2E2E2", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, marginRight: 14 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 11, color: "#1A1C1C", letterSpacing: 0.5 }}>VISA</Text>
            </View>
            <View>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C" }}>•••• 4242</Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: "#898B8A", marginTop: 2 }}>Expires 12/26</Text>
            </View>
          </View>
        </Card>

        {/* ── Saved Addresses ──────────────────────────────────────────── */}
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 22, color: "#1A1C1C" }}>Saved Addresses</Text>
            <TouchableOpacity
              onPress={() => router.push("/(routes)/shipping")}
              style={{ backgroundColor: PRIMARY, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 50 }}
            >
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: "#FFFFFF" }}>Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <Card>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: "#898B8A", textAlign: "center", paddingVertical: 8 }}>
                No saved addresses yet.
              </Text>
            </Card>
          ) : (
            addresses.map((addr: any, i: number) => (
              <View
                key={addr.id || i}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {/* Left accent bar */}
                <View style={{ width: 4, backgroundColor: i === 0 ? PRIMARY : "#E2E2E2" }} />

                <View style={{ flex: 1, padding: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <View>
                      {/* Badge */}
                      <View style={{
                        alignSelf: "flex-start",
                        paddingHorizontal: 10, paddingVertical: 4,
                        borderRadius: 50,
                        backgroundColor: i === 0 ? "#EDE9FE" : "#F3F3F3",
                        marginBottom: 8,
                      }}>
                        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: i === 0 ? PRIMARY : "#898B8A" }}>
                          {i === 0 ? "Primary" : "Secondary"}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C", marginBottom: 4 }}>
                        {addr.label || addr.name || "Address"}
                      </Text>
                      <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#898B8A" }}>
                        {addr.street}{addr.area ? `, ${addr.area}` : ""}{addr.city ? `, ${addr.city}` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity style={{ padding: 4 }}>
                      <Ionicons name="ellipsis-vertical" size={18} color="#A1A1AA" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── Party Order CTA ──────────────────────────────────────────── */}
        <View style={{ marginTop: 8, borderRadius: 24, overflow: "hidden" }}>
          <LinearGradient
            colors={["#5B21F0", "#5A2C96"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ padding: 24, position: "relative", overflow: "hidden" }}
          >
            {/* Watermark fish icon */}
            <View style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.12 }}>
              <MaterialCommunityIcons name="fish" size={140} color="#FFFFFF" />
            </View>

            <Text style={{ fontFamily: "Inter-Bold", fontSize: 22, color: "#FFFFFF", marginBottom: 10, lineHeight: 28 }}>
              Have a party order?
            </Text>
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 20, lineHeight: 20 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://wa.me/919999999999")}
              activeOpacity={0.85}
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 28,
                paddingVertical: 13,
                borderRadius: 50,
              }}
            >
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: "#1A1C1C", letterSpacing: 1, textTransform: "uppercase" }}>
                Chat With Us
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Photo Modal ─────────────────────────────────────────────────────── */}
      <Modal visible={showPhotoModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F3F3" }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#1A1C1C" }}>Change Photo</Text>
            <TouchableOpacity onPress={() => { setShowPhotoModal(false); setSelectedImage(null); setUploadedImageUrl(null); setAppliedFeatures([]); }}>
              <Ionicons name="close" size={24} color="#676968" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {!selectedImage ? (
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", padding: 16, borderWidth: 1, borderColor: "#E2E2E2", borderRadius: 16 }}
                  onPress={takePhoto}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                    <Ionicons name="camera" size={24} color="#1D4ED8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: "#1A1C1C" }}>Take Photo</Text>
                    <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#898B8A" }}>Use camera</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", padding: 16, borderWidth: 1, borderColor: "#E2E2E2", borderRadius: 16 }}
                  onPress={pickImage}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                    <Ionicons name="images" size={24} color="#15803D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: "#1A1C1C" }}>Choose from Library</Text>
                    <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#898B8A" }}>From gallery</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 20 }}>
                <View style={{ alignItems: "center" }}>
                  {isApplyingAI ? (
                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "#F3F3F3", alignItems: "center", justifyContent: "center" }}>
                      <ActivityIndicator color={PRIMARY} />
                    </View>
                  ) : (
                    <Image source={{ uri: uploadedImageUrl || selectedImage }} style={{ width: 120, height: 120, borderRadius: 60 }} resizeMode="cover" />
                  )}
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#898B8A", marginTop: 8 }}>Preview</Text>
                </View>

                {!uploadedImageUrl ? (
                  <TouchableOpacity
                    onPress={() => selectedImage && uploadImage(selectedImage)}
                    disabled={isUploading}
                    style={{ backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 50, alignItems: "center" }}
                  >
                    <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#FFFFFF" }}>
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#1A1C1C" }}>Enhance with AI (optional)</Text>
                    {[
                      { key: "bg-remove", label: "Remove Background", icon: "cut", color: PRIMARY, bg: "#EDE9FE" },
                      { key: "relight", label: "Relight", icon: "sunny", color: "#D97706", bg: "#FEF3C7" },
                      { key: "quality-improve", label: "Improve Quality", icon: "sparkles", color: "#1D4ED8", bg: "#DBEAFE" },
                    ].map((f) => (
                      <TouchableOpacity
                        key={f.key}
                        onPress={() => applyAIFeature(f.key)}
                        disabled={isApplyingAI}
                        style={{ flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1.5, borderColor: appliedFeatures.includes(f.key) ? PRIMARY : "#E2E2E2", borderRadius: 14 }}
                      >
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: f.bg, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                          <Ionicons name={f.icon as any} size={20} color={f.color} />
                        </View>
                        <Text style={{ flex: 1, fontFamily: "Inter-SemiBold", fontSize: 14, color: "#1A1C1C" }}>{f.label}</Text>
                        {appliedFeatures.includes(f.key) && <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 12, paddingTop: 4 }}>
                  <TouchableOpacity
                    onPress={() => { setSelectedImage(null); setUploadedImageUrl(null); setAppliedFeatures([]); }}
                    style={{ flex: 1, paddingVertical: 14, borderWidth: 1.5, borderColor: "#E2E2E2", borderRadius: 50, alignItems: "center" }}
                  >
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#676968" }}>Retake</Text>
                  </TouchableOpacity>
                  {uploadedImageUrl && (
                    <TouchableOpacity
                      onPress={saveFinalImage}
                      style={{ flex: 1, paddingVertical: 14, backgroundColor: PRIMARY, borderRadius: 50, alignItems: "center" }}
                    >
                      <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#FFFFFF" }}>Save Photo</Text>
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
      <Ionicons name="location-outline" size={18} color={PRIMARY} style={{ marginRight: 6 }} />
      <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: PRIMARY_DARK, flex: 1, lineHeight: 26, letterSpacing: -0.3 }}>
        {"MEAT. FISH.\nREPEAT"}
      </Text>
      <TouchableOpacity onPress={() => router.push("/(routes)/products")} style={{ padding: 4 }}>
        <Ionicons name="search-outline" size={22} color="#1A1C1C" />
      </TouchableOpacity>
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      marginTop: 16,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    }, style]}>
      {children}
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 4 }}
    >
      <View style={{ width: 28, alignItems: "center", marginRight: 14 }}>{icon}</View>
      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: "#1A1C1C", flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
    </TouchableOpacity>
  );
}
