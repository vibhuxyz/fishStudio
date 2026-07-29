import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#5A2C96";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="compass-outline" size={38} color={PRIMARY} />
          </View>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#1A1C1C", marginBottom: 8, textAlign: "center" }}>
            This screen does not exist
          </Text>
          <Link href="/" style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: PRIMARY }}>Go to home screen</Text>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
