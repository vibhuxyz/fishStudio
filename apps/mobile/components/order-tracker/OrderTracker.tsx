import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { STEP_KEYS, STEPS, StepKey } from "./constants";
import { DeliveredBanner } from "./DeliveredBanner";
import { DeliveryMap } from "./DeliveryMap";
import { HeadlineRow } from "./HeadlineRow";
import { RotatingQuote } from "./RotatingQuote";
import { ScheduledShipCard } from "./ScheduledShipCard";
import { StepTrack } from "./StepTrack";

export function OrderTracker({
  status,
  updatedAt,
  deliverySlot,
  deliveryMinutes,
  storeName,
}: {
  status: string;
  updatedAt?: string;
  deliverySlot?: string;
  deliveryMinutes?: number | null;
  storeName?: string;
}) {
  const upper = (status || "PENDING").toUpperCase();
  const isCancelled = upper === "CANCELLED" || upper === "REJECTED";
  const activeIdx = isCancelled ? -1 : STEP_KEYS.indexOf(upper as StepKey);
  const currentStep = isCancelled ? null : STEPS[activeIdx] ?? STEPS[0];

  const prevStatusRef = useRef<string>(upper);
  const [flash, setFlash] = useState(false);
  const [animIdx, setAnimIdx] = useState(activeIdx);

  useEffect(() => {
    if (prevStatusRef.current === upper) return;
    prevStatusRef.current = upper;
    if (isCancelled) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2800);
      return () => clearTimeout(t);
    }
    const newIdx = STEP_KEYS.indexOf(upper as StepKey);
    if (newIdx > animIdx) {
      setFlash(true);
      const t1 = setTimeout(() => setAnimIdx(newIdx), 650);
      const t2 = setTimeout(() => setFlash(false), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    setAnimIdx(newIdx);
  }, [upper, isCancelled, animIdx]);

  useEffect(() => { setAnimIdx(activeIdx); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancelled / rejected
  if (isCancelled) {
    return (
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "#FECDD3", backgroundColor: "#FFF1F2", padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FECDD3", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close-circle" size={32} color="#F43F5E" />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#BE123C" }}>
              Order {upper === "CANCELLED" ? "Cancelled" : "Rejected"}
            </Text>
            <Text style={{ fontSize: 13, color: "#FB7185", marginTop: 2, fontWeight: "500" }}>
              {upper === "CANCELLED" ? "This order was cancelled." : "This order was rejected by the store."}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const isDelivered = upper === "DELIVERED";
  const isShipped = upper === "SHIPPED";
  const showQuote = !isShipped && !isDelivered;
  const showStepTrack = !isShipped && !isDelivered;

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: currentStep?.ring ?? "#e5e7eb",
        backgroundColor: currentStep?.light ?? "#f9fafb",
        padding: 20,
      }}
    >
      {/* Headline */}
      <HeadlineRow step={currentStep} flash={flash} updatedAt={updatedAt} isDelivered={isDelivered} />

      {isShipped && deliverySlot === "instant" && (
        <DeliveryMap
          deliverySlot={deliverySlot}
          deliveryMinutes={deliveryMinutes}
          storeName={storeName}
          updatedAt={updatedAt}
        />
      )}

      {isShipped && deliverySlot !== "instant" && (
        <ScheduledShipCard deliverySlot={deliverySlot} storeName={storeName} />
      )}

      {isDelivered && (
        <DeliveredBanner deliverySlot={deliverySlot} deliveryMinutes={deliveryMinutes} />
      )}

      {showQuote && currentStep && (
        <RotatingQuote status={upper} slot={deliverySlot} color={currentStep.color} />
      )}

      {showStepTrack && <StepTrack animIdx={animIdx} flash={flash} />}
    </View>
  );
}
