import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: { name: string; deliveryTime: string }) => void;
}

// Sample nearby areas data
const nearbyAreas = [
  { id: 1, name: "Kanti", deliveryTime: "~31 min delivery" },
  { id: 2, name: "Motipur", deliveryTime: "~58 min delivery" },
  { id: 3, name: "Paroo", deliveryTime: "~45 min delivery" },
  { id: 4, name: "Sakra", deliveryTime: "~62 min delivery" },
];

export default function LocationModal({
  visible,
  onClose,
  onSelectLocation,
}: LocationModalProps) {
  const [pincode, setPincode] = useState("");
  const [showAreas, setShowAreas] = useState(false);

  const handleCheckPincode = () => {
    if (pincode.length === 6) {
      setShowAreas(true);
    }
  };

  const handleSelectArea = (area: { name: string; deliveryTime: string }) => {
    onSelectLocation(area);
    onClose();
    setShowAreas(false);
    setPincode("");
  };

  const handleDetectLocation = () => {
    // In a real app, this would use expo-location
    onSelectLocation({ name: "Current Location", deliveryTime: "~45 min delivery" });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-foreground">
            Enter Pincode
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Description */}
            <Text className="text-muted-foreground font-poppins text-base mb-6">
              Enter your 6-digit pincode to find serviceable addresses in your
              area.
            </Text>

            {/* Pincode Input */}
            <View className="flex-row mb-6">
              <View
                className={`flex-1 bg-white rounded-xl border-2 px-4 py-4 mr-3 ${
                  pincode.length > 0 ? "border-primary" : "border-input"
                }`}
              >
                <TextInput
                  className="text-foreground font-poppins-semibold text-lg"
                  placeholder="e.g. 843111"
                  placeholderTextColor="#94A3B8"
                  value={pincode}
                  onChangeText={(text) => {
                    setPincode(text.replace(/[^0-9]/g, "").slice(0, 6));
                    setShowAreas(false);
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                className={`px-6 py-4 rounded-xl ${
                  pincode.length === 6 ? "bg-offer-green" : "bg-offer-green/50"
                }`}
                onPress={handleCheckPincode}
                disabled={pincode.length !== 6}
                activeOpacity={0.8}
              >
                <Text className="text-white font-poppins-semibold text-base">
                  Check
                </Text>
              </TouchableOpacity>
            </View>

            {/* Detect Location & Search */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                className="flex-1 bg-offer-green rounded-xl px-6 py-4 flex-row items-center justify-center mr-4"
                onPress={handleDetectLocation}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text className="text-white font-poppins-semibold text-base ml-2">
                  Detect my location
                </Text>
              </TouchableOpacity>
              <Text className="text-muted-foreground font-poppins mr-4">
                OR
              </Text>
              <TouchableOpacity className="flex-1 bg-white border border-border rounded-xl px-6 py-4 flex-row items-center justify-center">
                <Ionicons name="search" size={20} color="#64748B" />
                <Text className="text-muted-foreground font-poppins-medium ml-2">
                  Search location
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nearby Areas */}
            {showAreas && (
              <View>
                <Text className="text-base font-poppins-semibold text-foreground mb-4">
                  Nearby areas in {pincode}
                </Text>
                <View className="gap-3">
                  {nearbyAreas.map((area) => (
                    <TouchableOpacity
                      key={area.id}
                      className="bg-white border border-border rounded-xl px-4 py-4 flex-row items-center justify-between"
                      onPress={() => handleSelectArea(area)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                          <Ionicons name="location" size={20} color="#6C3CE1" />
                        </View>
                        <View>
                          <Text className="text-foreground font-poppins-semibold text-base">
                            {area.name}
                          </Text>
                          <Text className="text-offer-green font-poppins-medium text-sm">
                            {area.deliveryTime}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Enter Address Manually */}
                <TouchableOpacity
                  className="mt-4 border-2 border-dashed border-primary/50 rounded-xl px-6 py-4 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#6C3CE1" />
                  <Text className="text-primary font-poppins-semibold text-base ml-2">
                    Enter address manually
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
