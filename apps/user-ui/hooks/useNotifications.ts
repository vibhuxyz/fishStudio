import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useNotifications = () => {
  const queryClient = useQueryClient();

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
