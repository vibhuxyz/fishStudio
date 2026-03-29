import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { frontendEnv } from "@/lib/env";
import { useWs } from "@/context/ws-context";

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
  // Shared persistent WS connection — no new socket created here.
  const { subscribe } = useWs();

  // Subscribe to ORDER_STATUS_UPDATE to refresh the notification bell instantly.
  useEffect(() => {
    if (!userId) return;
    return subscribe("ORDER_STATUS_UPDATE", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
  }, [userId, subscribe, queryClient]);

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
    refetchInterval: 300_000, // 5 min — WebSocket handles real-time updates
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
