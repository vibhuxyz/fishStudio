import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  NOTIFICATION_ONBOARDING_SEEN_KEY,
  syncNotificationPreferences,
} from "@/utils/notification-preferences";

const USER_SETTINGS_KEY = "user_settings";
const DEFAULT_SETTINGS = { email_notifications: true, dark_mode: false };

export default function NotificationPermissionsScreen() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);

  const persistAndProceed = async (emailNotifications: boolean) => {
    const storedSettings = await AsyncStorage.getItem(USER_SETTINGS_KEY);
    const currentSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
    await AsyncStorage.setItem(
      USER_SETTINGS_KEY,
      JSON.stringify({ ...currentSettings, email_notifications: emailNotifications }),
    );
    await AsyncStorage.setItem(NOTIFICATION_ONBOARDING_SEEN_KEY, "true");
    router.replace("/(tabs)");
  };

  const handleContinue = async () => {
    setIsContinuing(true);
    try {
      await syncNotificationPreferences({ emailNotificationsEnabled: emailEnabled });
      await persistAndProceed(emailEnabled);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleSkip = async () => {
    await syncNotificationPreferences({ emailNotificationsEnabled: false });
    await persistAndProceed(false);
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="flex-1 px-6 pt-10">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="notifications" size={36} color="#2563EB" />
          </View>
          <Text className="text-gray-900 font-poppins-bold text-2xl text-center">
            Stay in the loop
          </Text>
          <Text className="text-gray-500 font-poppins-medium text-sm text-center mt-2">
            Choose how you&apos;d like to hear about your orders and offers. You can change this
            anytime in Settings.
          </Text>
        </View>

        <View className="bg-white rounded-2xl shadow-[0_0_1px_rgba(0,0,0,0.1)] border border-gray-100 p-4 mb-8">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
              <Ionicons name="mail-outline" size={24} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-poppins-semibold text-lg">
                Email Notifications
              </Text>
              <Text className="text-gray-500 font-poppins-medium text-sm mt-1">
                Order receipts and account updates
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: "#E5E7EB", true: "#2563EB" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4 mb-3"
          onPress={handleContinue}
          disabled={isContinuing}
          activeOpacity={0.8}
        >
          <Text className="text-white font-poppins-semibold text-center text-base">
            {isContinuing ? "Setting up..." : "Continue"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} disabled={isContinuing}>
          <Text className="text-gray-500 font-poppins-medium text-center text-sm py-2">
            Not now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
