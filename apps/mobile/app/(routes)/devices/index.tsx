import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";

interface DeviceSession {
  id: string;
  sid: string;
  platform: string;
  deviceLabel: string;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}

const platformIcon = (platform: string): keyof typeof Ionicons.glyphMap => {
  if (platform === "ios" || platform === "android") return "phone-portrait-outline";
  if (platform === "web") return "laptop-outline";
  return "desktop-outline";
};

const formatLastActive = (iso: string) => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Active now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  return `Active ${Math.floor(hours / 24)}d ago`;
};

export default function DevicesScreen() {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [limit, setLimit] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/auth/api/sessions");
      setSessions(data.sessions || []);
      setLimit(data.limit || 3);
    } catch (error) {
      console.error("Error loading devices:", error);
      toast.error("Could not load your devices");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const handleSignOut = (session: DeviceSession) => {
    Alert.alert("Sign out device", `Sign out of ${session.deviceLabel}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await axiosInstance.delete(`/auth/api/sessions/${session.sid}`);
            toast.success(`Signed out of ${session.deviceLabel}`);
            loadSessions();
          } catch (error) {
            console.error("Error revoking session:", error);
            toast.error("Could not sign out that device");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">Login Devices</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text className="text-gray-500 font-poppins-medium text-sm mb-4 px-1">
          {isLoading ? "Loading your devices…" : `${sessions.length} of ${limit} devices signed in`}
        </Text>

        {sessions.map((session) => (
          <View
            key={session.sid}
            className="bg-white rounded-2xl shadow-[0_0_1px_rgba(0,0,0,0.1)] border border-gray-100 mb-4 p-4"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                <Ionicons name={platformIcon(session.platform)} size={24} color="#2563EB" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-gray-900 font-poppins-semibold text-lg">
                    {session.deviceLabel}
                  </Text>
                  {session.current && (
                    <View className="ml-2 bg-blue-100 rounded-full px-2 py-0.5">
                      <Text className="text-blue-700 font-poppins-semibold text-xs">
                        This device
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-500 font-poppins-medium text-sm mt-1">
                  {formatLastActive(session.lastUsedAt)}
                </Text>
              </View>
              {!session.current && (
                <TouchableOpacity
                  onPress={() => handleSignOut(session)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5"
                >
                  <Text className="text-gray-700 font-poppins-semibold text-xs">Sign out</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
