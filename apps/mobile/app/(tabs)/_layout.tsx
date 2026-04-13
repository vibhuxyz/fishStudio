import FloatingTabBar from "@/components/shared/floating-tab-bar";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // Hide the native tab bar — FloatingTabBar replaces it
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="cart" options={{ title: "Cart" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>

      {/* Custom floating pill tab bar — auto-hides on scroll */}
      <FloatingTabBar />
    </View>
  );
}
