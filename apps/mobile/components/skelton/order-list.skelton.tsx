import React from "react";
import { View } from "react-native";

function OrderRowSkeleton() {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 mb-3 shadow-sm elevation-1">
      <View className="p-3.5 flex-row items-center">
        <View className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse" />
        <View className="flex-1 ml-3">
          <View className="h-4 rounded-md bg-gray-200 animate-pulse w-3/4 mb-2" />
          <View className="h-3 rounded-md bg-gray-200 animate-pulse w-1/2 mb-2" />
          <View className="h-3 rounded-md bg-gray-200 animate-pulse w-1/3 mb-2" />
          <View className="h-2.5 rounded-md bg-gray-200 animate-pulse w-1/4" />
        </View>
        <View className="items-end ml-2 h-14 justify-between py-0.5">
          <View className="w-16 h-5 rounded-full bg-gray-200 animate-pulse" />
          <View className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
        </View>
      </View>
      
      <View className="px-3.5 pb-3.5">
        <View className="h-11 rounded-xl bg-gray-50 border border-gray-100 animate-pulse w-full" />
      </View>
    </View>
  );
}

export default function OrderListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View className="py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </View>
  );
}
