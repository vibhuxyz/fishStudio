import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  category?: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const useNotifications = (sellerId?: string) => {
  const queryClient = useQueryClient();

  // WebSocket: when a NEW_ORDER event arrives the bell refreshes instantly.
  // This works for both seller (pass store's sellerId) and staff (pass sellerId).
  useEffect(() => {
    if (!sellerId) return;

    const wsBase = process.env.NEXT_PUBLIC_WORKER_WS_URL?.replace(/\?.*$/, "") || "ws://localhost:6006";
    const wsUrl = `${wsBase}?sellerId=${sellerId}`;

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Any new order event means new in-app notification — refresh bell
          if (data.type === "NEW_ORDER") {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!destroyed) reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      destroyed = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [sellerId, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axiosInstance.get("/notification/api/notifications");
      return response.data.notifications as Notification[];
    },
    refetchInterval: 30000, // fallback poll every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/notification/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch("/notification/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = data?.filter((n) => !n.isRead).length || 0;

  return {
    notifications: data || [],
    isLoading,
    error,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};
