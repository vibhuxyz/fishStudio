import React from "react";
import { Text, View } from "react-native";

// Visual style per badge. Brand purple (#5A2C96) anchors premium/social-proof
// badges; urgency is warm, freshness is green, marketing attributes are a soft
// neutral so they never compete with the primary badge.
type BadgeStyle = { bg: string; fg: string };

const BADGE_STYLES: Record<string, BadgeStyle> = {
  "Best Seller": { bg: "#5A2C96", fg: "#FFFFFF" },
  Trending: { bg: "#7C3AED", fg: "#FFFFFF" },
  "Limited Stock": { bg: "#EF4444", fg: "#FFFFFF" },
  "New Arrival": { bg: "#16A34A", fg: "#FFFFFF" },
  "Fresh Today": { bg: "#0EA5E9", fg: "#FFFFFF" },
  "Packed Today": { bg: "#0EA5E9", fg: "#FFFFFF" },
  "Cut Fresh After Order": { bg: "#1C1C1C", fg: "#FFFFFF" },
  "Temperature Controlled": { bg: "#1C1C1C", fg: "#FFFFFF" },
  "Vacuum Packed": { bg: "#1C1C1C", fg: "#FFFFFF" },
};

const DEFAULT_STYLE: BadgeStyle = { bg: "#5A2C96", fg: "#FFFFFF" };

export function ProductBadge({
  label,
  small = false,
}: {
  label: string;
  small?: boolean;
}) {
  const style = BADGE_STYLES[label] ?? DEFAULT_STYLE;
  return (
    <View
      style={{
        backgroundColor: style.bg,
        paddingHorizontal: small ? 6 : 8,
        paddingVertical: small ? 2 : 3,
        borderRadius: 8,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: style.fg,
          fontFamily: "Inter-Bold",
          fontSize: small ? 8.5 : 10,
          letterSpacing: 0.2,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// Overlay rendered on top of the product image (top-left). Shows up to `max`
// badges, prioritising the order the backend returns them in.
export function ProductBadges({
  badges,
  max = 1,
  small = false,
}: {
  badges?: string[] | null;
  max?: number;
  small?: boolean;
}) {
  if (!badges || badges.length === 0) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        gap: 4,
        flexDirection: "column",
        alignItems: "flex-start",
      }}
      pointerEvents="none"
    >
      {badges.slice(0, max).map((b) => (
        <ProductBadge key={b} label={b} small={small} />
      ))}
    </View>
  );
}
