import { SLOT_OPTIONS } from "@/constants/delivery-slots";
import { useDeliverySlotStore } from "@/lib/delivery-slot-store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#5A2C96";

interface SlotSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Delivery slot picker, shared by the cart strip and the checkout card.
 * Instant is offered only while the store's instant window is open — the same
 * check order-service runs at Place Order.
 */
export default function SlotSheet({ visible, onClose }: SlotSheetProps) {
  const { selectedSlot, setSelectedSlot, availableSlots, instantFee } = useDeliverySlotStore();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 28,
            flexShrink: 1,
          }}
        >
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 44, height: 5, borderRadius: 99, backgroundColor: "#D1D5DB" }} />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: "#1A1C1C" }}>
              Choose delivery slot
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {SLOT_OPTIONS.map((slot) => {
            const selected = slot.key === selectedSlot;
            const offered = availableSlots.includes(slot.key);
            return (
              <TouchableOpacity
                key={slot.key}
                disabled={!offered}
                onPress={() => {
                  setSelectedSlot(slot.key);
                  onClose();
                }}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: selected ? 2 : 1.5,
                  borderColor: selected ? PRIMARY : "#E2E8F0",
                  backgroundColor: selected ? "rgba(90,44,150,0.05)" : "#FFFFFF",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 12,
                  opacity: offered ? 1 : 0.5,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C" }}>
                    {slot.name} · {slot.time}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter-Medium",
                      fontSize: 12,
                      color: offered ? (slot.badge ? "#22C55E" : "#898B8A") : "#A1A1AA",
                      marginTop: 2,
                    }}
                  >
                    {!offered
                      ? "Not available right now"
                      : slot.key === "instant"
                        ? `${slot.badge} · +₹${instantFee} delivery`
                        : slot.badge || "No extra charge"}
                  </Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                ) : (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: "#D8D8DC",
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
