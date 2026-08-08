import { getDeliveryEtaMinutes } from "@/components/order-tracker/simulation";
import { DeliverySlotKey, formatSlotLabel, SCHEDULED_SLOTS } from "@/constants/delivery-slots";
import { Order, STATUS_CONFIG } from "@/constants/order";
import { useAddressStore } from "@/lib/address-store";
import useUser from "@/hooks/useUser";
import { useActiveOrderWidgetStore } from "@/store/active-order-widget-store";
import { useBottomBarStore } from "@/store/bottom-bar-store";
import { useFloatingCartBarStore } from "@/store/floating-cart-bar-store";
import { useScrollDirectionStore } from "@/store/scroll-direction-store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELLED", "REJECTED"]);

// Reserves the vertical space ActiveOrderWidget currently occupies from the
// bottom of the screen, or 0 when it isn't showing — mirrors
// useFloatingCartBarSpace() so scrollable screens can add it to their
// content's bottom padding.
export function useActiveOrderWidgetSpace(): number {
  const insets = useSafeAreaInsets();
  const screenBottomBarHeight = useBottomBarStore((s) => s.height);
  const cartPillHeight = useFloatingCartBarStore((s) => s.height);
  const widgetHeight = useActiveOrderWidgetStore((s) => s.height);

  if (widgetHeight === 0) return 0;

  const bottomOffset =
    (insets.bottom > 0 ? insets.bottom + 8 : 16) +
    (screenBottomBarHeight > 0 ? screenBottomBarHeight + 8 : 0) +
    (cartPillHeight > 0 ? cartPillHeight + 8 : 0);

  return bottomOffset + widgetHeight;
}

export default function ActiveOrderWidget() {
  const { user } = useUser();
  const { selectedLocation } = useAddressStore();
  const [now, setNow] = useState(() => Date.now());
  const insets = useSafeAreaInsets();
  const screenBottomBarHeight = useBottomBarStore((s) => s.height);
  // The "View cart" pill sits closer to the tab bar — when it's also
  // showing, float above it instead of overlapping.
  const cartPillHeight = useFloatingCartBarStore((s) => s.height);
  const setWidgetHeight = useActiveOrderWidgetStore((s) => s.setHeight);
  const scrollingDown = useScrollDirectionStore((s) => s.scrollingDown);

  // 0 = shown, 1 = hidden (slid down and faded). Height stays untouched by
  // useLayout below since it drives a transform, not layout.
  const hiddenProgress = useSharedValue(0);
  useEffect(() => {
    hiddenProgress.value = withTiming(scrollingDown ? 1 : 0, { duration: 220 });
  }, [scrollingDown, hiddenProgress]);
  const hideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hiddenProgress.value * 80 }],
    opacity: 1 - hiddenProgress.value,
  }));

  const { data: orders } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/user-orders");
      return res.data.orders as Order[];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  // The remaining-minutes text only needs a fresh "now" to recompute against
  // — no network call — so it ticks independently of the order refetch above.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const activeOrder = (orders ?? []).find((o) => !TERMINAL_STATUSES.has(o.status));

  useEffect(() => {
    if (!activeOrder) setWidgetHeight(0);
  }, [activeOrder, setWidgetHeight]);

  if (!activeOrder) return null;

  const cfg = STATUS_CONFIG[activeOrder.status] ?? {
    bg: "#F3F4F6", text: "#6B7280", icon: "help-circle-outline", label: activeOrder.status, description: activeOrder.status,
  };

  // Only SHIPPED means a rider has actually picked up the order, so that's
  // the only state where a live "arriving in" countdown means anything —
  // before that there's no rider en route yet to be arriving.
  const isShipped = activeOrder.status === "SHIPPED";
  const isScheduled = SCHEDULED_SLOTS.includes(activeOrder.deliverySlot as DeliverySlotKey);

  let subtitle: string;
  if (isShipped) {
    const etaMinutes = getDeliveryEtaMinutes(activeOrder, selectedLocation?.deliveryTimeMinutes);
    const arrivalTime = new Date(activeOrder.createdAt).getTime() + etaMinutes * 60000;
    const remainingMinutes = Math.max(0, Math.round((arrivalTime - now) / 60000));
    subtitle = remainingMinutes > 0 ? `Arriving in ~${remainingMinutes} min` : "Arriving any moment";
  } else if (isScheduled) {
    subtitle = `Scheduled · ${formatSlotLabel(activeOrder.deliverySlot || null)}`;
  } else {
    subtitle = cfg.description ?? cfg.label;
  }

  const bottomOffset =
    (insets.bottom > 0 ? insets.bottom + 8 : 16) +
    (screenBottomBarHeight > 0 ? screenBottomBarHeight + 8 : 0) +
    (cartPillHeight > 0 ? cartPillHeight + 8 : 0);

  return (
    <Animated.View
      pointerEvents={scrollingDown ? "none" : "box-none"}
      onLayout={(e) => setWidgetHeight(e.nativeEvent.layout.height)}
      style={[
        {
          position: "absolute",
          bottom: bottomOffset,
          left: 16,
          right: 16,
          zIndex: 998,
        },
        hideStyle,
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(routes)/order-confirmation/[id]",
            params: { id: activeOrder.id },
          })
        }
        activeOpacity={0.85}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: 14,
          backgroundColor: "#EEE9FD",
          gap: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 14,
          elevation: 12,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: cfg.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={cfg.icon as any} size={17} color={cfg.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 12, color: "#1E293B" }}>
            {cfg.label}
          </Text>
          <Text style={{ fontFamily: "Inter-Medium", fontSize: 11, color: "#5A2C96", marginTop: 1 }} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#5A2C96" />
      </TouchableOpacity>
    </Animated.View>
  );
}
