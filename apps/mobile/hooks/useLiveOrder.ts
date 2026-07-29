import { useWebSocket } from "@/context/web-socket.context";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import axiosInstance from "@/utils/axiosInstance";
import useUser from "@/hooks/useUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { subscribe, isConnected } = useWebSocket();
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

  // Rides the app-wide WebSocketProvider connection (context/web-socket.context.tsx)
  // instead of opening a second one — both used to connect independently and
  // both listened for ORDER_STATUS_UPDATE on the same endpoint.
  useEffect(() => {
    if (!orderId || !user?.id || TERMINAL_STATUSES.has(currentStatus)) return;

    return subscribe((data) => {
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
    });
  }, [currentStatus, orderId, queryClient, user?.id, subscribe]);

  return {
    ...query,
    order: query.data,
    isRealtimeConnected: isConnected,
    lastLiveUpdateAt,
  };
}
