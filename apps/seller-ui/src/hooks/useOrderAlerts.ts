"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkerWS } from "@/context/worker-ws-context";
import {
  fireOrderAlert,
  primeOrderAlertAudio,
  requestOrderAlertPermission,
} from "@/utils/orderAlert";

type StaffRole = "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";

interface AlertRule {
  event: string;
  /** Only alert when the payload's status matches (omit to alert on any). */
  status?: string;
  title: string;
  body: string;
}

/**
 * What counts as "new work" differs per role, because each role receives work
 * differently:
 *  - ORDER_MANAGER triages every incoming order, so NEW_ORDER is their cue.
 *  - CUTTING_STAFF share one store-wide queue (getMyCuttingOrders filters by
 *    store + status, never by staff id), so their cue is an order reaching
 *    ACCEPTED — there is no per-person cutting assignment to listen for.
 *  - RIDER is the only role assigned individually, so they get the targeted
 *    ORDER_ASSIGNED_TO_ME event and stay silent for everyone else's orders.
 */
const ALERT_RULES: Record<StaffRole, AlertRule[]> = {
  ORDER_MANAGER: [
    {
      event: "NEW_ORDER",
      title: "New order received",
      body: "A new order is waiting to be accepted.",
    },
  ],
  CUTTING_STAFF: [
    {
      event: "ORDER_STATUS_UPDATE",
      status: "ACCEPTED",
      title: "New order to cut",
      body: "An order has been accepted and needs cutting.",
    },
  ],
  RIDER: [
    {
      event: "ORDER_ASSIGNED_TO_ME",
      title: "Delivery assigned to you",
      body: "You have a new delivery to pick up.",
    },
  ],
};

const readString = (payload: unknown, key: string): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
};

/**
 * Rings, vibrates and raises a system notification when work arrives for this
 * staff member, and refreshes their order list so the new card is on screen by
 * the time they pick the phone up. Pass `undefined` to disable (e.g. a layout
 * that is currently rendering a different role's subtree).
 */
const useOrderAlerts = (staffRole: StaffRole | undefined) => {
  const { subscribe } = useWorkerWS();
  const queryClient = useQueryClient();

  // Mobile browsers keep the AudioContext suspended until a user gesture, so
  // unlock it on interaction — otherwise the first order of a shift rings
  // silently. Deliberately not `once`: a staff portal sits open all shift and
  // browsers re-suspend the context on a backgrounded tab, so every gesture
  // (and every return to the foreground) gets a chance to unlock it again.
  useEffect(() => {
    if (!staffRole) return;

    const prime = () => primeOrderAlertAudio();
    window.addEventListener("pointerdown", prime);
    window.addEventListener("keydown", prime);
    document.addEventListener("visibilitychange", prime);

    void requestOrderAlertPermission();

    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
      document.removeEventListener("visibilitychange", prime);
    };
  }, [staffRole]);

  useEffect(() => {
    if (!staffRole) return;

    const unsubscribes = (ALERT_RULES[staffRole] ?? []).map((rule) =>
      subscribe(rule.event, (payload) => {
        if (rule.status && readString(payload, "status") !== rule.status) return;

        const orderId = readString(payload, "orderId") ?? readString(payload, "id");
        const orderCode = readString(payload, "orderCode");
        const body = orderCode ? `Order ${orderCode} — ${rule.body}` : rule.body;

        fireOrderAlert({ title: rule.title, body, tag: orderId ?? rule.event });
        toast.success(rule.title, { description: body });

        // Pull the new order into whichever list this screen is showing.
        void queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
        void queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
        void queryClient.invalidateQueries({ queryKey: ["cutting-orders"] });
      }),
    );

    return () => unsubscribes.forEach((off) => off());
  }, [staffRole, subscribe, queryClient]);
};

export default useOrderAlerts;
