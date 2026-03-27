import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { frontendEnv } from "@/lib/env";

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

export const useNotifications = (userId?: string) => {
  const queryClient = useQueryClient();

  // WebSocket: instantly refresh bell on order status updates
  useEffect(() => {
    const wsBase = (process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006").replace(/\?.*$/, "");
    const wsUrl = userId ? `${wsBase}?userId=${userId}` : wsBase;

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ORDER_STATUS_UPDATE") {
            queryClient.refetchQueries({ queryKey: ["notifications"], type: "active" });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }
          if (data.type === "STOCK_UPDATE") {
            // broadcastAll sends { type, payload } — unwrap payload
            const { productId, catalogProductId, stock } = data.payload ?? data;

            // Match by variant id OR catalog id
            const isMatch = (p: any) =>
              p.id === productId || p.id === catalogProductId;

            // 1. Instantly update the products list cache
            queryClient.setQueriesData<any>(
              { queryKey: ["storefront", "products"] },
              (oldData) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.map((p) => (isMatch(p) ? { ...p, stock } : p));
              }
            );

            // 2. Instantly update the individual product detail cache
            queryClient.setQueriesData<any>(
              { queryKey: ["storefront", "product"] },
              (oldData) => {
                if (oldData && isMatch(oldData)) {
                  return { ...oldData, stock };
                }
                return oldData;
              }
            );

            // 3. Trigger a background refetch to ensure long-term consistency
            queryClient.invalidateQueries({ queryKey: ["storefront"] });
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
  }, [userId, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch(`${frontendEnv.apiUrl}/notification/api/notifications`, {
        headers: {
            "x-auth-role": "user",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const result = await response.json();
      return result.notifications as Notification[];
    },
    refetchInterval: 60000, 
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${frontendEnv.apiUrl}/notification/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "x-auth-role": "user" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${frontendEnv.apiUrl}/notification/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "x-auth-role": "user" },
      });
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
