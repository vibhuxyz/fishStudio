import FloatingCartBar from "@/components/shared/floating-cart-bar";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // No floating pill nav anymore — Home is reached via in-app
          // navigation/back buttons, Profile lives in the header, Cart via
          // the floating cart bar below. Native tab bar stays hidden to match.
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="cart" options={{ title: "Cart" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>

      <FloatingCartBar />
    </View>
  );
}
