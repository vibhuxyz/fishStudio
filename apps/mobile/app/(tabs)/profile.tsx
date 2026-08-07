import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { fetchRecentlyViewed } from "@/actions/activity";
import axiosInstance from "@/utils/axiosInstance";
import { clearStoredAuth } from "@/utils/auth";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { toast } from "@/utils/toast";
import { colors } from "@/constants/theme";
import { Order, STATUS_CONFIG } from "@/constants/order";
import { formatOrderId } from "@repo/shared/order-id";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CouponSheet from "@/components/shared/coupon-sheet";
import SectionCarousel from "@/components/home/section-carousel";

const PRIMARY = colors.primary;
const SUPPORT_WHATSAPP_URL = "https://wa.me/919999999999";

// The three stages a customer actually looks up from here — everything
// in-between (confirmed/packed/out for delivery) is covered by "All Orders"
// and the in-page status chips on the orders list itself.
const ORDER_QUICK_FILTERS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "All Orders", icon: "cube-outline" },
  { key: "DELIVERED", label: "Delivered", icon: "home-outline" },
  { key: "CANCELLED", label: "Cancelled", icon: "close-outline" },
];

// Mirrors my-orders/index.tsx: a RAZORPAY order still PENDING never got a
// completed payment, so it reads as cancelled rather than "in progress".
function getDisplayStatus(order: Order): string {
  const isUnpaidOnline =
    order.paymentMethod === "RAZORPAY" &&
    order.status === "PENDING" &&
    order.paymentStatus !== "COMPLETED";
  return isUnpaidOnline ? "CANCELLED" : order.status;
}

export default function Profile() {
  const { user: cachedUser, updateUserData, clearUserData } = useUser();
  const { selectedLocation } = useAddressStore();
  const { fetchAvailableCoupons } = useCouponStore();

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([]);
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [couponSheetOpen, setCouponSheetOpen] = useState(false);

  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ["logged-in-user"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/logged-in-user");
      return res.data.user;
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60 * 5,
  });

  const { data: orderStats } = useQuery({
    queryKey: ["user-order-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/user-order-stats");
      return res.data as { totalOrders: number; totalSavings: number };
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60,
  });

  // Shares the "user-orders" cache key with the my-orders screen so the two
  // don't double-fetch when a shopper opens one after the other.
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/user-orders");
      return res.data.orders as Order[];
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60,
  });
  const recentOrders = (ordersData || [])
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-user-notifications");
      const notifications = res.data?.notifications ?? [];
      return notifications.filter((n: { status: string }) => n.status === "Unread").length;
    },
    enabled: !!cachedUser,
    staleTime: 1000 * 60,
  });

  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ["recently-viewed", selectedLocation?.storeId, selectedLocation?.pincode],
    queryFn: () =>
      fetchRecentlyViewed({
        storeId: selectedLocation?.storeId,
        pincode: selectedLocation?.pincode,
        city: selectedLocation?.city,
      }),
    enabled: !!cachedUser,
    staleTime: 1000 * 60 * 2,
  });

  const user = userData || cachedUser;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";
  const totalSavings = orderStats?.totalSavings ?? 0;
  const totalOrders = orderStats?.totalOrders ?? 0;

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
            // Full data: URI — the backend validates the data:image/...;base64,
            // prefix itself, so we don't strip it before sending.
            const dataUri = reader.result as string;
            const { data } = await axiosInstance.post("/auth/api/upload-avatar-image", { fileName: dataUri });
            if (data.success) {
              setOriginalImageUrl(data.file_url);
              setUploadedImageUrl(data.file_url);
              setUploadedImageId(data.file_id);
              toast.success("Photo uploaded!");
            } else throw new Error("Upload failed");
            resolve(data);
          } catch (e) { toast.error("Failed to upload image"); reject(e); }
          finally { setIsUploading(false); }
        };
        reader.onerror = () => { setIsUploading(false); reject(new Error("Read failed")); };
        reader.readAsDataURL(blob);
      });
    } catch { setIsUploading(false); toast.error("Failed to process image"); }
  };

  // Cloudinary transforms are URL path segments (not query params like
  // ImageKit's `?tr=`), so each toggle recomputes from the clean upload URL
  // rather than layering onto whatever's currently displayed.
  const applyAIFeature = async (feature: string) => {
    if (!originalImageUrl) return;
    setIsApplyingAI(true);
    try {
      const trMap: Record<string, string> = {
        "bg-remove": "e_background_removal", // requires Cloudinary's Background Removal add-on
        relight: "e_improve:outdoor",
        "quality-improve": "e_improve",
      };
      const nextFeatures = appliedFeatures.includes(feature)
        ? appliedFeatures.filter((f) => f !== feature)
        : [...appliedFeatures, feature];
      const transformSegment = nextFeatures.map((f) => trMap[f]).join(",");
      const finalUrl = transformSegment
        ? originalImageUrl.replace("/upload/", `/upload/${transformSegment}/`)
        : originalImageUrl;
      await new Promise((r) => setTimeout(r, 4000));
      setUploadedImageUrl(finalUrl);
      setAppliedFeatures(nextFeatures);
      toast.success(`${feature} applied!`);
    } catch { toast.error(`Failed to apply ${feature}`); }
    finally { setIsApplyingAI(false); }
  };

  const saveFinalImage = async () => {
    if (!uploadedImageUrl) return;
    try {
      const res = await axiosInstance.put("/auth/api/update-avatar", { avatar: { file_id: uploadedImageId, url: uploadedImageUrl } });
      if (res.data.success) {
        if (res.data.user) await updateUserData(res.data.user);
        toast.success("Profile photo updated!");
        setShowPhotoModal(false); setSelectedImage(null); setOriginalImageUrl(null); setUploadedImageUrl(null); setAppliedFeatures([]);
        refetchUser();
      }
    } catch { toast.error("Failed to update photo"); }
  };

  const logOutHandler = async () => {
    try { await axiosInstance.post("/auth/api/logout-user"); } catch {}
    await clearUserData();
    await clearStoredAuth();
    router.replace("/(routes)/login");
  };

  const handleShareReferral = async () => {
    if (!user?.referralCode) return;
    try {
      await Share.share({
        message: `Join me on FishStudio for fresh fish & meat delivered fast! Use my code ${user.referralCode} when you sign up — https://fishstudio.app`,
      });
    } catch {
      // user dismissed the sheet — ignore
    }
  };

  // Coupons aren't persisted between launches, so refetch them here too —
  // cart/checkout already do this, but Offers can be opened without ever
  // visiting either.
  useEffect(() => {
    if (selectedLocation?.storeId) {
      fetchAvailableCoupons(selectedLocation.storeId, cachedUser?.id);
    }
  }, [selectedLocation?.storeId, cachedUser?.id, fetchAvailableCoupons]);

  const handleOffersPress = () => {
    if (!selectedLocation?.storeId) {
      toast.info("Set your delivery location first to see store offers");
      return;
    }
    setCouponSheetOpen(true);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!cachedUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="person-outline" size={38} color={PRIMARY} />
          </View>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: colors.textPrimary, marginBottom: 8 }}>Not logged in</Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 24 }}>
            Login to view your profile, orders and more
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(routes)/login")}
            style={{ backgroundColor: PRIMARY, width: "100%", paddingVertical: 16, borderRadius: 50, alignItems: "center" }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: colors.white }}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ── Purple header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <SafeAreaView edges={["top"]}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
                {userLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <View style={{ position: "relative", marginRight: 14 }}>
                      <Image
                        source={{
                          uri: cloudinaryThumbnail(user?.avatar?.url, 128) ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=FFFFFF&color=5A2C96&size=200`,
                        }}
                        style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPhotoModal(true)}
                        style={{
                          position: "absolute", bottom: -2, right: -2,
                          width: 22, height: 22, borderRadius: 11,
                          backgroundColor: colors.white,
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Ionicons name="pencil" size={11} color={PRIMARY} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: colors.white }} numberOfLines={1}>
                        {user?.name || "User"}
                      </Text>
                      {/* API responses use phone_number (raw Mongo field); the
                          cached local user object normalizes it to phone —
                          fall back across both so it doesn't blink out
                          between the two sources. */}
                      {(user?.phone_number || user?.phone) ? (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                          <Text style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                            {user.phone_number || user.phone}
                          </Text>
                          <Ionicons name="checkmark-circle" size={13} color="#4ADE80" style={{ marginLeft: 6 }} />
                        </View>
                      ) : null}
                    </View>
                  </>
                )}
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => router.push("/(routes)/notifications")} style={{ padding: 2 }}>
                  <View>
                    <Ionicons name="notifications-outline" size={22} color={colors.white} />
                    {unreadCount > 0 && (
                      <View style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: "#F87171" }} />
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/(routes)/settings")} style={{ padding: 2 }}>
                  <Ionicons name="settings-outline" size={22} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, marginTop: -24 }}>
          {/* ── Savings banner + stats ──────────────────────────────────── */}
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <MaterialCommunityIcons name="sale-outline" size={16} color={PRIMARY} />
              </View>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: colors.textPrimary, flex: 1 }}>
                {totalSavings > 0 ? "You are saving more with FishStudio!" : "Apply offers at checkout to start saving!"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
              <StatItem icon="pricetag-outline" iconColor={colors.offerGreen} label="Total Savings" value={`₹${totalSavings}`} />
              <StatItem icon="bag-handle-outline" iconColor={PRIMARY} label="Orders" value={String(totalOrders)} />
              <StatItem icon="calendar-outline" iconColor="#2563EB" label="Member Since" value={memberSince} />
            </View>
          </View>

          {/* ── My Orders quick-nav ─────────────────────────────────────── */}
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 16, marginTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: colors.textPrimary }}>My Orders</Text>
              <TouchableOpacity onPress={() => router.push("/(routes)/my-orders")} style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY }}>View All Orders</Text>
                <Ionicons name="chevron-forward" size={14} color={PRIMARY} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {ORDER_QUICK_FILTERS.map((f) => {
                const active = f.key === "all";
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => router.push({ pathname: "/(routes)/my-orders", params: { status: f.key } })}
                    style={{ width: "33.33%", alignItems: "center", marginBottom: 12 }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 44, height: 44, borderRadius: 14,
                        backgroundColor: active ? PRIMARY : colors.secondaryBg,
                        alignItems: "center", justifyContent: "center", marginBottom: 6,
                      }}
                    >
                      <Ionicons name={f.icon} size={19} color={active ? colors.white : "#6B7280"} />
                    </View>
                    <Text style={{ fontFamily: "Inter-Medium", fontSize: 10.5, color: colors.textMuted, textAlign: "center" }} numberOfLines={1}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {recentOrders.length > 0 && (
              <View style={{ marginTop: 4, borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12, gap: 8 }}>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12.5, color: colors.textMuted, marginBottom: 2 }}>
                  Recent Orders
                </Text>
                {recentOrders.map((order) => {
                  const displayStatus = getDisplayStatus(order);
                  const cfg = STATUS_CONFIG[displayStatus] ?? {
                    bg: "#F3F4F6", text: "#6B7280", icon: "help-circle-outline", label: displayStatus,
                  };
                  const orderNumber = formatOrderId(order.id);
                  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  });
                  const amount = order.totalAmount ?? order.total ?? 0;
                  const firstItem = order.items?.[0];
                  const image =
                    cloudinaryThumbnail(firstItem?.product?.images?.[0]?.url, 112) ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120";
                  const title = firstItem?.product?.title || `Order ${orderNumber}`;
                  const itemCount = order.items?.length ?? 0;

                  return (
                    <TouchableOpacity
                      key={order.id}
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: "/(routes)/order-details/[id]", params: { id: order.id } })}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.white,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#F0F0F0",
                        padding: 8,
                        shadowColor: "#000",
                        shadowOpacity: 0.03,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 1,
                      }}
                    >
                      <Image
                        source={{ uri: image }}
                        style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.secondaryBg }}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12.5, color: colors.textPrimary }} numberOfLines={1}>
                          {title}
                        </Text>
                        <Text style={{ fontFamily: "Inter-Regular", fontSize: 10.5, color: colors.textMuted, marginTop: 1 }}>
                          {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{amount.toFixed(0)} · {orderDate}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row", alignItems: "center",
                          backgroundColor: cfg.bg, borderRadius: 50,
                          paddingHorizontal: 7, paddingVertical: 3, marginLeft: 6,
                        }}
                      >
                        <Ionicons name={cfg.icon as any} size={10} color={cfg.text} />
                        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 9.5, color: cfg.text, marginLeft: 3 }}>
                          {cfg.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Refer & Earn ─────────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.primarySurface, borderRadius: 20, padding: 16, marginTop: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <MaterialCommunityIcons name="gift-outline" size={22} color={colors.white} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: colors.textPrimary }}>Refer & Earn</Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 11.5, color: colors.textMuted, marginTop: 2, lineHeight: 15 }}>
                {user?.referralCode
                  ? `Share code ${user.referralCode} — you earn ₹100 when a friend places their first order.`
                  : "Invite your friends and earn rewards on every referral!"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleShareReferral}
              disabled={!user?.referralCode}
              style={{ backgroundColor: PRIMARY, borderRadius: 50, paddingHorizontal: 16, paddingVertical: 10, opacity: user?.referralCode ? 1 : 0.5 }}
            >
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: colors.white }}>Refer Now</Text>
            </TouchableOpacity>
          </View>

          {/* ── Menu grid ────────────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12, marginHorizontal: -6 }}>
            <MenuGridItem
              icon="location-outline" iconBg="#EDE9FE" iconColor={PRIMARY}
              label="My Addresses" sub="Manage your saved addresses"
              onPress={() => router.push("/(routes)/shipping")}
            />
            <MenuGridItem
              icon="card-outline" iconBg="#DBEAFE" iconColor="#2563EB"
              label="Payment Methods" sub="Cards, UPI & Wallets"
              onPress={() => toast.info("No cards saved — pay via UPI, card, or net banking at checkout")}
            />
            <MenuGridItem
              icon="heart-outline" iconBg="#FCE7F3" iconColor="#DB2777"
              label="Saved Selections" sub="Your wishlist"
              onPress={() => router.push("/(tabs)/wishlist")}
            />
            <MenuGridItem
              icon="pricetags-outline" iconBg="#FEE2E2" iconColor="#DC2626"
              label="Offers & Coupons" sub="View all offers & coupons"
              onPress={handleOffersPress}
            />
            <MenuGridItem
              icon="star-outline" iconBg="#DBEAFE" iconColor="#2563EB"
              label="My Reviews" sub="Reviews for your orders"
              onPress={() => router.push("/(routes)/my-reviews")}
            />
            <MenuGridItem
              icon="headset-outline" iconBg="#D1FAE5" iconColor={colors.success}
              label="Help & Support" sub="FAQs, chat & more"
              onPress={() => Linking.openURL(SUPPORT_WHATSAPP_URL)}
            />
            <MenuGridItem
              icon="notifications-outline" iconBg="#FEF3C7" iconColor="#D97706"
              label="Notifications" sub="Order & offers updates"
              onPress={() => router.push("/(routes)/notifications")}
            />
            <MenuGridItem
              icon="information-circle-outline" iconBg="#EDE9FE" iconColor={PRIMARY}
              label="About FishStudio" sub="Learn more about us"
              onPress={() => router.push("/(routes)/about")}
            />
          </View>

          {/* ── Logout ───────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={logOutHandler}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderRadius: 16, paddingVertical: 15, marginTop: 12 }}
          >
            <Ionicons name="log-out-outline" size={18} color={PRIMARY} style={{ marginRight: 8 }} />
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: PRIMARY }}>Logout</Text>
          </TouchableOpacity>

          {/* ── Recently Viewed ──────────────────────────────────────────── */}
          {recentlyViewed.length > 0 && (
            <View style={{ marginTop: 20, marginHorizontal: -16 }}>
              <View style={{ paddingHorizontal: 16 }}>
                <SectionCarousel title="Recently Viewed" products={recentlyViewed} />
              </View>
            </View>
          )}

          {/* ── Party Order CTA ──────────────────────────────────────────── */}
          <View style={{ marginTop: 4, borderRadius: 24, overflow: "hidden" }}>
            <LinearGradient
              colors={["#5B21F0", PRIMARY]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ padding: 24, position: "relative", overflow: "hidden" }}
            >
              <View style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.12 }}>
                <MaterialCommunityIcons name="fish" size={140} color={colors.white} />
              </View>

              <Text style={{ fontFamily: "Inter-Bold", fontSize: 22, color: colors.white, marginBottom: 10, lineHeight: 28 }}>
                Have a party order?
              </Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 20, lineHeight: 20 }}>
                Bulk orders of fresh fish and meat for weddings, parties, and events — chat with us for custom cuts, quantities, and delivery scheduling.
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(SUPPORT_WHATSAPP_URL)}
                activeOpacity={0.85}
                style={{ alignSelf: "flex-start", backgroundColor: colors.white, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 50 }}
              >
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: colors.textPrimary, letterSpacing: 1, textTransform: "uppercase" }}>
                  Chat With Us
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <CouponSheet
        visible={couponSheetOpen}
        onClose={() => setCouponSheetOpen(false)}
        subtotal={0}
        deliveryCharge={0}
        storeId={selectedLocation?.storeId}
      />

      {/* ── Photo Modal ─────────────────────────────────────────────────────── */}
      <Modal visible={showPhotoModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F3F3" }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: colors.textPrimary }}>Change Photo</Text>
            <TouchableOpacity onPress={() => { setShowPhotoModal(false); setSelectedImage(null); setOriginalImageUrl(null); setUploadedImageUrl(null); setAppliedFeatures([]); }}>
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
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: colors.textPrimary }}>Take Photo</Text>
                    <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: colors.textMuted }}>Use camera</Text>
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
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: colors.textPrimary }}>Choose from Library</Text>
                    <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: colors.textMuted }}>From gallery</Text>
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
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: colors.textMuted, marginTop: 8 }}>Preview</Text>
                </View>

                {!uploadedImageUrl ? (
                  <TouchableOpacity
                    onPress={() => selectedImage && uploadImage(selectedImage)}
                    disabled={isUploading}
                    style={{ backgroundColor: PRIMARY, paddingVertical: 16, borderRadius: 50, alignItems: "center" }}
                  >
                    <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: colors.white }}>
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ gap: 12 }}>
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: colors.textPrimary }}>Enhance with AI (optional)</Text>
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
                        <Text style={{ flex: 1, fontFamily: "Inter-SemiBold", fontSize: 14, color: colors.textPrimary }}>{f.label}</Text>
                        {appliedFeatures.includes(f.key) && <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 12, paddingTop: 4 }}>
                  <TouchableOpacity
                    onPress={() => { setSelectedImage(null); setOriginalImageUrl(null); setUploadedImageUrl(null); setAppliedFeatures([]); }}
                    style={{ flex: 1, paddingVertical: 14, borderWidth: 1.5, borderColor: "#E2E2E2", borderRadius: 50, alignItems: "center" }}
                  >
                    <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#676968" }}>Retake</Text>
                  </TouchableOpacity>
                  {uploadedImageUrl && (
                    <TouchableOpacity
                      onPress={saveFinalImage}
                      style={{ flex: 1, paddingVertical: 14, backgroundColor: PRIMARY, borderRadius: 50, alignItems: "center" }}
                    >
                      <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: colors.white }}>Save Photo</Text>
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

function StatItem({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: colors.textPrimary, marginTop: 6 }}>{value}</Text>
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 10.5, color: colors.textMuted, marginTop: 1 }}>{label}</Text>
    </View>
  );
}

function MenuGridItem({
  icon,
  iconBg,
  iconColor,
  label,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <View style={{ width: "50%", padding: 6 }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{ backgroundColor: colors.white, borderRadius: 16, padding: 14 }}
      >
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: iconBg, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: colors.textPrimary }} numberOfLines={1}>{label}</Text>
        <Text style={{ fontFamily: "Inter-Regular", fontSize: 10.5, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>{sub}</Text>
      </TouchableOpacity>
    </View>
  );
}
