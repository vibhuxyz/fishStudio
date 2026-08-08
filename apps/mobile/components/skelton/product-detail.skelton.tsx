import React from "react";
import { Dimensions, View, ScrollView } from "react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery area */}
        <View style={{ width, height: width * 0.85 }} className="bg-gray-200 animate-pulse">
          <View className="absolute top-4 right-4 bg-gray-300 w-16 h-6 rounded-full" />
        </View>

        <View className="px-4 py-4">
          {/* Breadcrumb */}
          <View className="flex-row items-center mb-4">
            <View className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
            <View className="h-3 w-2 bg-gray-200 rounded mx-2 animate-pulse" />
            <View className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <View className="h-3 w-2 bg-gray-200 rounded mx-2 animate-pulse" />
            <View className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </View>

          {/* Category */}
          <View className="h-3 w-20 bg-gray-200 rounded mb-2 animate-pulse" />

          {/* Title */}
          <View className="h-8 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />

          {/* Source • Origin */}
          <View className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse" />

          {/* Description */}
          <View className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse" />
          <View className="h-3 w-full bg-gray-200 rounded mb-2 animate-pulse" />
          <View className="h-3 w-4/5 bg-gray-200 rounded mb-5 animate-pulse" />

          {/* Product Code */}
          <View className="h-4 w-1/3 bg-gray-200 rounded mb-4 animate-pulse" />

          {/* Star Rating */}
          <View className="flex-row items-center mb-5">
            <View className="h-5 w-8 bg-gray-200 rounded mr-1 animate-pulse" />
            <View className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </View>

          {/* Price */}
          <View className="flex-row items-baseline mb-6">
            <View className="h-9 w-28 bg-gray-200 rounded animate-pulse mr-2" />
            <View className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
          </View>

          {/* Info Banner */}
          <View className="h-12 w-full bg-[#F3EEFB] rounded-2xl mb-6 animate-pulse" />

          {/* Pill Selector (Cleaning Type) */}
          <View className="mb-6">
            <View className="h-5 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
            <View className="flex-row gap-2.5">
              <View className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
              <View className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
            </View>
          </View>

          {/* Pill Selector (Weight) */}
          <View className="mb-6">
            <View className="h-5 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
            <View className="flex-row gap-2.5">
              <View className="h-12 w-20 bg-gray-200 rounded-xl animate-pulse" />
              <View className="h-12 w-20 bg-gray-200 rounded-xl animate-pulse" />
              <View className="h-12 w-20 bg-gray-200 rounded-xl animate-pulse" />
            </View>
          </View>

          {/* Quantity and Total Payable */}
          <View className="h-5 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
          <View className="flex-row items-center justify-between mb-8">
            <View className="h-11 w-32 bg-gray-200 rounded-xl animate-pulse" />
            <View className="items-end">
              <View className="h-3 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
              <View className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Bar overlay */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex-row">
        <View className="h-14 w-14 bg-gray-200 rounded-2xl animate-pulse mr-3" />
        <View className="h-14 flex-1 bg-gray-200 rounded-2xl animate-pulse" />
      </View>
    </View>
  );
}
