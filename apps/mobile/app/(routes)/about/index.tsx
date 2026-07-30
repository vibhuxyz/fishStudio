import { colors } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import React from "react";
import { Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = colors.primary;

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F3F3" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: colors.textPrimary }}>About FishStudio</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <MaterialCommunityIcons name="fish" size={36} color={colors.white} />
          </View>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: colors.textPrimary }}>FishStudio</Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Version {version}</Text>
        </View>

        <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: colors.textMuted, lineHeight: 21, marginBottom: 24 }}>
          FishStudio delivers fresh fish, seafood, chicken and mutton straight from trusted local stores to your door — cut, cleaned and packed the way you like it.
        </Text>

        <View style={{ borderTopWidth: 1, borderTopColor: "#F3F3F3" }}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://fishstudio.app/privacy")}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F3F3" }}
          >
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 14, color: colors.textPrimary }}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://fishstudio.app/terms")}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 }}
          >
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 14, color: colors.textPrimary }}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
