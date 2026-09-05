import { SLOT_OPTIONS } from "@/constants/delivery-slots";
import { useDeliverySlotStore } from "@/lib/delivery-slot-store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  const {
    selectedSlot,
    selectedDeliveryDate,
    setSelectedSlot,
    availableSlots,
    deliverySlots,
    instantFee,
  } = useDeliverySlotStore();
  const insets = useSafeAreaInsets();

  const instantOption = SLOT_OPTIONS.find((slot) => slot.key === "instant")!;
  const instantOffered = availableSlots.includes("instant");

  // Flat list across the next few days -> one section per day. Insertion order
  // is already chronological, so a Map keeps it without sorting.
  const slotsByDate = React.useMemo(() => {
    const byDate = new Map<string, typeof deliverySlots>();
    for (const slot of deliverySlots) {
      const existing = byDate.get(slot.deliveryDate);
      if (existing) existing.push(slot);
      else byDate.set(slot.deliveryDate, [slot]);
    }
    return [...byDate.entries()];
  }, [deliverySlots]);

  const rowStyle = (selected: boolean, enabled: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderWidth: selected ? 2 : 1.5,
    borderColor: selected ? PRIMARY : "#E2E8F0",
    backgroundColor: selected ? "rgba(90,44,150,0.05)" : "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    opacity: enabled ? 1 : 0.5,
  });

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

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              disabled={!instantOffered}
              onPress={() => {
                // Instant is always today, so it carries no date.
                setSelectedSlot("instant", null);
                onClose();
              }}
              activeOpacity={0.8}
              style={rowStyle(selectedSlot === "instant", instantOffered)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C" }}>
                  {instantOption.name} · {instantOption.time}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter-Medium",
                    fontSize: 12,
                    color: instantOffered ? "#22C55E" : "#A1A1AA",
                    marginTop: 2,
                  }}
                >
                  {instantOffered
                    ? `${instantOption.badge} · +₹${instantFee} delivery`
                    : "Not available right now"}
                </Text>
              </View>
              {selectedSlot === "instant" ? (
                <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
              ) : (
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#D8D8DC" }} />
              )}
            </TouchableOpacity>

            {slotsByDate.map(([deliveryDate, slots]) => (
              <View key={deliveryDate}>
                <Text
                  style={{
                    fontFamily: "Inter-SemiBold",
                    fontSize: 12,
                    color: "#898B8A",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    marginTop: 4,
                  }}
                >
                  {slots[0]?.dateLabel ?? deliveryDate}
                </Text>
                {slots.map((slot) => {
                  const selected =
                    slot.key === selectedSlot && slot.deliveryDate === selectedDeliveryDate;
                  return (
                    <TouchableOpacity
                      key={`${slot.deliveryDate}-${slot.key}`}
                      disabled={!slot.isBookable}
                      onPress={() => {
                        setSelectedSlot(slot.key, slot.deliveryDate);
                        onClose();
                      }}
                      activeOpacity={0.8}
                      style={rowStyle(selected, slot.isBookable)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: "#1A1C1C" }}>
                          {slot.label}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Inter-Medium",
                            fontSize: 12,
                            color: slot.isBookable ? "#898B8A" : "#A1A1AA",
                            marginTop: 2,
                          }}
                        >
                          {slot.isFull
                            ? "Fully booked"
                            : slot.isPastCutoff
                              ? "Ordering has closed"
                              : slot.remaining <= 5
                                ? `Only ${slot.remaining} left`
                                : "No extra charge"}
                        </Text>
                      </View>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                      ) : (
                        <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#D8D8DC" }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {slotsByDate.length === 0 && (
              <Text
                style={{
                  fontFamily: "Inter-Medium",
                  fontSize: 13,
                  color: "#898B8A",
                  textAlign: "center",
                  paddingVertical: 16,
                }}
              >
                No scheduled slots are available right now.
              </Text>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
