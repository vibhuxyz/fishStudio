import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#5A2C96";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

// Class component is required here — hooks can't catch render-time errors.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    router.replace("/(tabs)");
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="alert-circle-outline" size={38} color={PRIMARY} />
          </View>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, color: "#1A1C1C", marginBottom: 8, textAlign: "center" }}>
            Something went wrong
          </Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 14, color: "#898B8A", textAlign: "center", marginBottom: 24 }}>
            The app hit an unexpected error. Try again, and if it keeps happening, restart the app.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{ backgroundColor: PRIMARY, width: "100%", paddingVertical: 16, borderRadius: 50, alignItems: "center" }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#FFFFFF" }}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
