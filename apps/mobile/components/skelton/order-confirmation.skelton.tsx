import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrderConfirmationSkeleton() {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Purple Hero Section Skeleton */}
        <View 
          className="bg-[#5A2C96] rounded-b-[32px] px-5 pb-14 overflow-hidden"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="h-8 bg-white/20 rounded-md w-3/4 mb-2 animate-pulse" />
              <View className="h-8 bg-white/20 rounded-md w-1/2 mb-4 animate-pulse" />
              <View className="h-3 bg-white/20 rounded-md w-2/3 mb-1.5 animate-pulse" />
              <View className="h-3 bg-white/20 rounded-md w-1/2 mb-4 animate-pulse" />
              <View className="h-6 bg-white/20 rounded-full w-48 animate-pulse" />
            </View>
            <View className="flex-row gap-2">
              <View className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
              <View className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
            </View>
          </View>
          <View className="items-center mt-6">
            <View className="w-[130px] h-[130px] rounded-full bg-white/20 animate-pulse" />
          </View>
        </View>

        {/* Content Section */}
        <View className="px-4 -mt-8">
          {/* Order ID / ETA Card */}
          <View className="bg-white rounded-[20px] p-4 shadow-sm mb-3 flex-row elevation-1">
            <View className="flex-1 pr-4">
              <View className="h-3 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
              <View className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
              <View className="h-2.5 bg-gray-200 rounded w-32 animate-pulse" />
            </View>
            <View className="w-[120px]">
              <View className="h-5 bg-purple-100/50 rounded-full w-24 mb-2 animate-pulse" />
              <View className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
            </View>
          </View>

          {/* Order Status Timeline Card */}
          <View className="bg-white rounded-[20px] p-4 shadow-sm mb-3 elevation-1">
            <View className="flex-row justify-between mb-4">
              <View className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
              <View className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </View>
            <View className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          </View>

          {/* Order Items Card */}
          <View className="bg-white rounded-[20px] p-4 shadow-sm mb-3 elevation-1">
            <View className="flex-row justify-between mb-4">
              <View className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <View className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            </View>
            <View className="flex-row items-center border-t border-gray-100 pt-3">
              <View className="w-[52px] h-[52px] rounded-[14px] bg-gray-200 animate-pulse" />
              <View className="flex-1 ml-3">
                <View className="h-3.5 bg-gray-200 rounded w-2/3 mb-1.5 animate-pulse" />
                <View className="h-3 bg-gray-200 rounded w-1/3 mb-1 animate-pulse" />
                <View className="h-2.5 bg-gray-200 rounded w-1/2 animate-pulse" />
              </View>
              <View className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
            </View>
          </View>

          {/* Delivery Details Card */}
          <View className="bg-white rounded-[20px] p-4 shadow-sm mb-3 elevation-1">
            <View className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <View className="flex-row gap-3">
              <View className="flex-1 flex-row">
                <View className="w-[34px] h-[34px] rounded-full bg-purple-50 mr-2 animate-pulse" />
                <View className="flex-1">
                  <View className="h-3 bg-gray-200 rounded w-2/3 mb-1 animate-pulse" />
                  <View className="h-2.5 bg-gray-200 rounded w-full animate-pulse" />
                </View>
              </View>
              <View className="flex-1 flex-row">
                <View className="w-[34px] h-[34px] rounded-full bg-purple-50 mr-2 animate-pulse" />
                <View className="flex-1">
                  <View className="h-3 bg-gray-200 rounded w-2/3 mb-1 animate-pulse" />
                  <View className="h-2.5 bg-gray-200 rounded w-3/4 animate-pulse" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
