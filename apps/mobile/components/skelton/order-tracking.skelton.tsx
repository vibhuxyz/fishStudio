import React from "react";
import { View, ScrollView } from "react-native";
import { colors } from "@/constants/theme";

export default function OrderTrackingSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {/* Status hero */}
      <View style={{ backgroundColor: colors.primarySurface, borderRadius: 20, padding: 18, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View className="h-6 bg-white/60 rounded-md w-3/4 mb-3 animate-pulse" />
          <View className="h-3.5 bg-white/50 rounded-md w-full mb-1.5 animate-pulse" />
          <View className="h-3.5 bg-white/50 rounded-md w-2/3 mb-4 animate-pulse" />
          <View className="h-4 bg-white/60 rounded-md w-1/2 animate-pulse" />
        </View>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center" }} className="animate-pulse" />
      </View>

      {/* Status timeline */}
      <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 16, marginTop: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} className="flex-row items-start mb-6 last:mb-0">
            <View className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-4" />
            <View className="flex-1 pt-1">
              <View className="h-4 rounded-md bg-gray-200 animate-pulse w-1/2 mb-2" />
              <View className="h-3 rounded-md bg-gray-200 animate-pulse w-3/4" />
            </View>
          </View>
        ))}
      </View>

      {/* Order items card */}
      <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 16, marginTop: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
        <View className="flex-row justify-between mb-5">
          <View className="h-5 rounded-md bg-gray-200 animate-pulse w-32" />
          <View className="h-6 rounded-full bg-gray-100 animate-pulse w-20" />
        </View>
        
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} className={`flex-row items-center ${i > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}`}>
            <View className="w-[52px] h-[52px] rounded-xl bg-gray-200 animate-pulse" />
            <View className="flex-1 ml-3">
              <View className="h-4 rounded-md bg-gray-200 animate-pulse w-2/3 mb-2" />
              <View className="h-3 rounded-md bg-gray-200 animate-pulse w-1/3" />
            </View>
            <View className="h-4 rounded-md bg-gray-200 animate-pulse w-12" />
          </View>
        ))}
      </View>

      {/* Info chips */}
      <View className="flex-row gap-2.5 mt-3">
        <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 12 }} className="animate-pulse">
          <View className="w-6 h-6 rounded-full bg-gray-200 mb-2" />
          <View className="h-3 bg-gray-200 rounded w-full mb-1" />
          <View className="h-3.5 bg-gray-200 rounded w-2/3" />
        </View>
        <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 12 }} className="animate-pulse">
          <View className="w-6 h-6 rounded-full bg-gray-200 mb-2" />
          <View className="h-3 bg-gray-200 rounded w-full mb-1" />
          <View className="h-3.5 bg-gray-200 rounded w-2/3" />
        </View>
        <View style={{ flex: 1, backgroundColor: colors.successSurface, borderRadius: 16, padding: 12 }} className="animate-pulse">
          <View className="w-6 h-6 rounded-full bg-white/60 mb-2" />
          <View className="h-3 bg-white/60 rounded w-full mb-1" />
          <View className="h-3.5 bg-white/60 rounded w-2/3" />
        </View>
      </View>
    </ScrollView>
  );
}
