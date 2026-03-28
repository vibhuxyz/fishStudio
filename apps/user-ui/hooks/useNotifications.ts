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

  // WebSocket: instantly refresh bell on order/stock updates
  useEffect(() => {
    const wsBase = (
      process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006"
    ).replace(/\?.*$/, "");
    const wsUrl = userId ? `${wsBase}?userId=${userId}` : wsBase;

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;
    let attempt = 0;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        attempt = 0; // reset backoff on successful connect
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ORDER_STATUS_UPDATE") {
            // Single invalidate — no need for refetch + invalidate together
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }

          if (data.type === "STOCK_UPDATE") {
            const { productId, catalogProductId, stock } = data.payload ?? data;
            const isMatch = (p: any) =>
              p.id === productId || p.id === catalogProductId;

            // Patch products list cache in place
            queryClient.setQueriesData<any>(
              { queryKey: ["storefront", "products"] },
              (oldData: any) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.map((p) => (isMatch(p) ? { ...p, stock } : p));
              },
            );

            // Patch individual product detail cache in place
            queryClient.setQueriesData<any>(
              { queryKey: ["storefront", "product"] },
              (oldData: any) =>
                oldData && isMatch(oldData) ? { ...oldData, stock } : oldData,
            );

            // Only invalidate the product-listing cache, not all storefront data
            queryClient.invalidateQueries({
              queryKey: ["storefront", "product-listing"],
            });
          }
        } catch {}
      };

      ws.onclose = () => {
        if (destroyed) return;
        // Exponential backoff: 3s → 6s → 12s → 24s → 30s max
        const delay = Math.min(3000 * 2 ** attempt, 30000);
        attempt += 1;
        reconnectTimeout = setTimeout(connect, delay);
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
      const response = await fetch(
        `${frontendEnv.apiUrl}/notification/api/notifications`,
        {
          headers: {
            "x-auth-role": "user",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const result = await response.json();
      return result.notifications as Notification[];
    },
    refetchInterval: 300000, // 5 min — WebSocket handles real-time updates
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(
        `${frontendEnv.apiUrl}/notification/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: { "x-auth-role": "user" },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await fetch(
        `${frontendEnv.apiUrl}/notification/api/notifications/read-all`,
        {
          method: "PATCH",
          headers: { "x-auth-role": "user" },
        },
      );
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
