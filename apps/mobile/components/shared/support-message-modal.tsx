import { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PRIMARY = colors.primary;

const REASONS = [
  "Order not received",
  "Wrong or missing item",
  "Item quality issue",
  "Payment or refund issue",
  "Delivery delay",
  "Other",
];

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called with the composed message once the customer taps send. */
  onSend: (message: string) => void;
}

/**
 * Collects why the customer needs help before handing off to WhatsApp —
 * tapping a reason chip fills the input (still editable) rather than
 * silently prefilling nothing, so the seller always gets real context
 * instead of a bare "Please help me with this order."
 */
export default function SupportMessageModal({ visible, onClose, onSend }: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!visible) {
      setSelectedReason(null);
      setMessage("");
    }
  }, [visible]);

  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
    setMessage(reason === "Other" ? "" : reason);
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}>
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
            <Text className="text-base font-poppins-semibold text-foreground">Need Help?</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="px-5 py-4">
            <Text className="text-xs text-muted-foreground font-poppins mb-2">
              What's this about?
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {REASONS.map((reason) => {
                const selected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => handleSelectReason(reason)}
                    className={`rounded-full border px-3 py-1.5 ${
                      selected ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-poppins-semibold ${
                        selected ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-xs text-muted-foreground font-poppins mb-2">
              Tell us more <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue..."
              placeholderTextColor="#A1A1AA"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
                borderRadius: 12,
                padding: 12,
                minHeight: 90,
                fontFamily: "Inter-Regular",
                fontSize: 13,
                color: "#1A1C1C",
              }}
            />
          </View>

          <View className="px-5 pt-1 pb-6 border-t border-border">
            <TouchableOpacity
              disabled={!message.trim()}
              className={`rounded-2xl py-4 items-center mt-4 ${
                message.trim() ? "bg-offer-green" : "bg-gray-300"
              }`}
              onPress={handleSend}
              activeOpacity={0.85}
            >
              <Text className="text-white font-poppins-semibold text-base">
                Continue on WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
