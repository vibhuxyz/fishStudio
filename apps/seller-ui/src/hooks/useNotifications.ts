import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useWorkerWS } from "../context/worker-ws-context";

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
  // Single shared WS connection from WorkerWSProvider — no new socket created here.
  const { subscribe } = useWorkerWS();

  // Subscribe to NEW_ORDER events to refresh the notification bell instantly.
  // subscribe() returns its own cleanup, so returning it directly satisfies useEffect.
  useEffect(() => {
    if (!sellerId) return;
    return subscribe("NEW_ORDER", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
  }, [sellerId, subscribe, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axiosInstance.get("/notification/api/notifications");
      return response.data.notifications as Notification[];
    },
    refetchInterval: 300_000, // 5 min — WebSocket handles real-time updates
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
