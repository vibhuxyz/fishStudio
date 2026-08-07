import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { colors } from "@/constants/theme";

const PRIMARY = colors.primary;

const TIMELINE_STEPS: {
  key: "PENDING" | "ACCEPTED" | "SHIPPED" | "DELIVERED";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "PENDING", label: "Order Confirmed", icon: "checkmark" },
  { key: "ACCEPTED", label: "Packed", icon: "cube-outline" },
  { key: "SHIPPED", label: "Out for Delivery", icon: "car-outline" },
  { key: "DELIVERED", label: "Delivered", icon: "home-outline" },
];
const STEP_KEYS = TIMELINE_STEPS.map((s) => s.key);

// PREPARING/READY_FOR_PICKUP/ASSIGNED_TO_RIDER are real order statuses but
// this timeline stays 4 visual steps — each maps onto the "Packed" step
// rather than getting its own, so the bar doesn't regress to step 0 for a
// status it doesn't otherwise recognize.
const STATUS_TO_STEP: Record<string, (typeof STEP_KEYS)[number]> = {
  PREPARING: "ACCEPTED",
  READY_FOR_PICKUP: "ACCEPTED",
  ASSIGNED_TO_RIDER: "ACCEPTED",
};

const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    : null;

/**
 * The four-stage order timeline shared by the confirmation and tracking
 * screens. Only `createdAt` (step 1) and the current step's `updatedAt` are
 * real timestamps the order table actually has — intermediate steps that
 * have already passed don't get a fabricated clock time because the exact
 * moment they happened was overwritten by the next status change.
 */
export function StatusTimeline({
  status,
  createdAt,
  updatedAt,
}: {
  status: string;
  createdAt: string;
  updatedAt?: string;
}) {
  const normalizedStatus = (status || "PENDING").toUpperCase();
  const mappedStatus = STATUS_TO_STEP[normalizedStatus] ?? normalizedStatus;
  const currentIdx = Math.max(0, STEP_KEYS.indexOf(mappedStatus as any));

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      {TIMELINE_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const reached = done || active;
        const time = idx === 0 ? formatTime(createdAt) : active ? formatTime(updatedAt) : null;

        return (
          <View key={step.key} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: idx > 0 && reached ? PRIMARY : "#E5E7EB",
                  opacity: idx === 0 ? 0 : 1,
                }}
              />
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: reached ? PRIMARY : "#F3F4F6",
                }}
              >
                <Ionicons
                  name={done ? "checkmark" : step.icon}
                  size={16}
                  color={reached ? colors.white : colors.textMuted}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: idx < STEP_KEYS.length - 1 && done ? PRIMARY : "#E5E7EB",
                  opacity: idx === STEP_KEYS.length - 1 ? 0 : 1,
                }}
              />
            </View>
            <Text
              style={{
                marginTop: 8,
                fontFamily: "Inter-SemiBold",
                fontSize: 11,
                color: reached ? colors.textPrimary : colors.textMuted,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {step.label}
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontFamily: "Inter-Regular",
                fontSize: 10,
                color: colors.textMuted,
                textAlign: "center",
              }}
            >
              {time || (active ? "Now" : reached ? " " : "Soon")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
