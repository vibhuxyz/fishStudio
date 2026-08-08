import { useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import {
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Matches CUSTOMER_CANCEL_REASONS in @repo/zod-schema's order.schema.ts.
const CANCEL_REASONS = [
  "Ordered by mistake",
  "Delivery taking too long",
  "Wrong address",
  "Changed my mind",
  "Other",
] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason?: string, note?: string) => void;
  isSubmitting?: boolean;
}

/**
 * Combines the spec's "why are you cancelling" quick-pick with the actual
 * cancel confirmation into one sheet, rather than two separate dialogs.
 */
export default function CancelOrderModal({ visible, onClose, onConfirm, isSubmitting }: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setNote("");
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(
      selectedReason ?? undefined,
      selectedReason === "Other" ? note.trim() : undefined,
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurView style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} intensity={50} tint="dark" />
<TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            maxHeight: SCREEN_HEIGHT * 0.8,
          }}
        >
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 44, height: 5, borderRadius: 99, backgroundColor: "#D1D5DB" }} />
          </View>

          <View className="px-5 py-3 border-b border-border">
            <Text className="text-base font-poppins-semibold text-foreground">Cancel Order?</Text>
            <Text className="text-xs text-muted-foreground font-poppins mt-1">
              Are you sure you want to cancel this order? This action cannot be undone.
            </Text>
          </View>

          <View className="px-5 py-4">
            <Text className="text-xs text-muted-foreground font-poppins mb-2">
              Why are you cancelling? (optional)
            </Text>
            <View className="gap-1">
              {CANCEL_REASONS.map((reason) => {
                const selected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => setSelectedReason(reason)}
                    className="flex-row items-center py-1.5"
                  >
                    <View
                      className={`w-4 h-4 rounded-full border-2 mr-2.5 items-center justify-center ${
                        selected ? "border-primary" : "border-gray-300"
                      }`}
                    >
                      {selected && <View className="w-2 h-2 rounded-full bg-primary" />}
                    </View>
                    <Text
                      className={`text-sm font-poppins-medium ${
                        selected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedReason === "Other" && (
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Tell us more..."
                placeholderTextColor="#A1A1AA"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{
                  borderWidth: 1.5,
                  borderColor: "#E2E8F0",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 70,
                  marginTop: 10,
                  fontFamily: "Inter-Regular",
                  fontSize: 13,
                  color: "#1A1C1C",
                }}
              />
            )}
          </View>

          <View className="px-5 pt-1 pb-6 border-t border-border flex-row gap-3">
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={onClose}
              className="flex-1 rounded-2xl py-4 items-center border border-border"
            >
              <Text className="text-foreground font-poppins-semibold text-sm">Keep Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={handleConfirm}
              className="flex-1 rounded-2xl py-4 items-center"
              style={{ backgroundColor: isSubmitting ? "#FCA5A5" : colors.danger }}
            >
              <Text className="text-white font-poppins-semibold text-sm">
                {isSubmitting ? "Cancelling…" : "Yes, Cancel Order"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
