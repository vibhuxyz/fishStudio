import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import axiosInstance from "@/utils/axiosInstance";
import useUser from "@/hooks/useUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useRef, useState } from "react";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELLED", "REJECTED"]);

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  ACCEPTED: "Preparing",
  SHIPPED: "On the Way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

const getExpoHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    "";

  const host = String(hostUri).split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
};

const getWsBase = () => {
  const configured = process.env.EXPO_PUBLIC_CHATTING_WEBSOCKET_URI;
  if (configured) return configured.replace(/\?.*$/, "");

  // Release builds must never fall back to localhost — use the production
  // endpoint if env injection was missed (mirrors axiosInstance fallback).
  if (!__DEV__) return "wss://api.fishstudio.in";

  const expoHost = getExpoHost();
  if (expoHost) return `ws://${expoHost}:6006`;
  return "ws://localhost:6006";
};

const getPayloadOrderId = (payload: any) =>
  payload?.orderId || payload?.id || payload?.order?.id;

const getPayloadStatus = (payload: any) =>
  payload?.status || payload?.order?.status || payload?.deliveryStatus;

export function getOrderStatusLabel(status?: string) {
  const upper = (status || "PENDING").toUpperCase();
  return STATUS_LABELS[upper] || upper;
}

export function useLiveOrder(orderId?: string) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastLiveUpdateAt, setLastLiveUpdateAt] = useState<Date | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return res.data.order;
    },
    enabled: !!orderId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchInterval: (liveQuery) => {
      const status = String((liveQuery.state.data as any)?.status || "").toUpperCase();
      return TERMINAL_STATUSES.has(status) ? false : 12000;
    },
  });

  useEffect(() => {
    if (query.data?.status) {
      lastStatusRef.current = String(query.data.status).toUpperCase();
    }
  }, [query.data?.status]);

  const currentStatus = useMemo(
    () => String(query.data?.status || "").toUpperCase(),
    [query.data?.status],
  );

  useEffect(() => {
    if (!orderId || !user?.id || TERMINAL_STATUSES.has(currentStatus)) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let destroyed = false;
    let attempt = 0;

    const connect = async () => {
      const token = await SecureStore.getItemAsync("access_token").catch(() => null);
      if (destroyed || !token) return;

      const wsBase = getWsBase();
      const joiner = wsBase.includes("?") ? "&" : "?";
      const wsUrl = `${wsBase}${joiner}access_token=${encodeURIComponent(token)}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (destroyed) return;
        attempt = 0;
        setIsRealtimeConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "ORDER_STATUS_UPDATE") return;

          const payload = data.payload || {};
          if (getPayloadOrderId(payload) !== orderId) return;

          const nextStatus = String(getPayloadStatus(payload) || "").toUpperCase();
          if (!nextStatus) return;

          const previousStatus = lastStatusRef.current;
          lastStatusRef.current = nextStatus;
          setLastLiveUpdateAt(new Date());

          queryClient.setQueryData(["order", orderId], (old: any) =>
            old
              ? {
                  ...old,
                  ...payload.order,
                  status: nextStatus,
                  updatedAt: payload.updatedAt || payload.order?.updatedAt || new Date().toISOString(),
                }
              : old,
          );
          queryClient.invalidateQueries({ queryKey: ["order", orderId] });
          queryClient.invalidateQueries({ queryKey: ["user-orders"] });

          if (previousStatus && previousStatus !== nextStatus) {
            haptic.success();
            toast.info(`Order status: ${getOrderStatusLabel(nextStatus)}`);
          }
        } catch {
          // Ignore malformed websocket frames.
        }
      };

      ws.onclose = () => {
        if (destroyed) return;
        setIsRealtimeConnected(false);
        const delay = Math.min(3000 * 2 ** attempt, 30000);
        attempt += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      destroyed = true;
      setIsRealtimeConnected(false);
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [currentStatus, orderId, queryClient, user?.id]);

  return {
    ...query,
    order: query.data,
    isRealtimeConnected,
    lastLiveUpdateAt,
  };
}
