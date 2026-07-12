import { haptic } from "@/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const QR_SIZE = Math.min(width * 0.52, 200);

export default function OnboardingScreen() {
  const handleLoginSignup = () => {
    haptic.press();
    router.replace("/(routes)/login");
  };

  const handleGuestContinue = () => {
    haptic.press();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#5B2ECC", "#5A2C96"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <View style={styles.flex1} />
            <Pressable
              onPress={handleGuestContinue}
              style={styles.closeButton}
              hitSlop={14}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView edges={["bottom"]} style={styles.body}>
        <View style={styles.content}>
          <Text style={styles.title}>Scan to Download or Login</Text>

          <View style={styles.qrWrapper}>
            <QRCode
              value="https://fishstudio.app/download"
              size={QR_SIZE}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          <Pressable
            onPress={handleLoginSignup}
            style={styles.loginButton}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <LinearGradient
              colors={["#4FC3F7", "#5A2C96"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              <Text style={styles.loginText}>Login/Signup</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleGuestContinue} style={styles.guestButton}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </Pressable>

          <Text style={styles.tagline}>Live-Cut. Fresh. Packed For You.</Text>

          <Pressable style={styles.termsRow}>
            <Text style={styles.termsText}>Terms </Text>
            <Ionicons name="arrow-forward" size={14} color="#1F2937" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  flex1: {
    flex: 1,
  },
  header: {
    width: "100%",
  },
  headerSafe: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 18,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginButton: {
    width: "100%",
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#5A2C96",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  loginGradient: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    fontSize: 16,
  },
  guestButton: {
    width: "100%",
    height: 54,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#5A2C96",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 36,
  },
  guestText: {
    color: "#5A2C96",
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  termsText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#111827",
    textDecorationLine: "underline",
  },
});
