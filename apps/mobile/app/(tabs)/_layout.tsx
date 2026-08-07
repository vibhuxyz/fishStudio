import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // No floating pill nav anymore — Home is reached via in-app
        // navigation/back buttons, Profile lives in the header, Cart via
        // the floating cart bar (mounted directly on the Home/product/
        // category screens that should show it — not here, so it never
        // appears on the splash/login screen or the Cart/Profile tabs).
        // Native tab bar stays hidden to match.
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
