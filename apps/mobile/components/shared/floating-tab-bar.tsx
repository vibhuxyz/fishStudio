import { useStore } from "@/store";
import { useUIStore } from "@/store/ui-store";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { name: "Home", route: "/(tabs)/", icon: "home" as const },
  { name: "Cart", route: "/(tabs)/cart", icon: "shopping-bag" as const },
  { name: "Profile", route: "/(tabs)/profile", icon: "user" as const },
];

export default function FloatingTabBar() {
  const { cart } = useStore();
  const { tabBarHidden } = useUIStore();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const translateY = useRef(new Animated.Value(0)).current;

  // Only show on the home tab — all hooks must be called before this
  const isHome = pathname === "/" || pathname === "/index" || pathname === "(tabs)";

  useEffect(() => {
    if (!isHome) return;
    Animated.spring(translateY, {
      toValue: tabBarHidden ? 120 : 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 150,
    }).start();
  }, [tabBarHidden, isHome]);

  if (!isHome) return null;

  const isActive = (route: string) => {
    if (route === "/(tabs)/") return pathname === "/" || pathname === "/index";
    return pathname.includes(route.replace("/(tabs)", ""));
  };

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 16;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 48,
        right: 48,
        transform: [{ translateY }],
        zIndex: 999,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          height: 60,
          borderRadius: 30,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 18,
          elevation: 14,
          paddingHorizontal: 8,
        }}
      >
        {TABS.map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.route as any)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
              }}
              activeOpacity={0.7}
            >
              <View style={{ position: "relative" }}>
                <View
                  style={
                    active
                      ? {
                          backgroundColor: "#6C3CE115",
                          borderRadius: 12,
                          padding: 7,
                        }
                      : { padding: 7 }
                  }
                >
                  <Feather
                    name={tab.icon}
                    size={21}
                    color={active ? "#6C3CE1" : "#94A3B8"}
                  />
                </View>

                {/* Cart badge */}
                {tab.name === "Cart" && cart.length > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "#6C3CE1",
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 3,
                      borderWidth: 1.5,
                      borderColor: "#fff",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: "700",
                        lineHeight: Platform.OS === "android" ? 14 : 12,
                      }}
                    >
                      {cart.length > 9 ? "9+" : String(cart.length)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
