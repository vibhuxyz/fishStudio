"use client";

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/utils";
import { useWs } from "@/context/ws-context";
import { useUserSession } from "@/hooks/useUserSession";
import { OrdersList } from "./orders-list";

interface OrdersRealtimeLayerProps {
  initialOrders: any[];
}

export function OrdersRealtimeLayer({ initialOrders }: OrdersRealtimeLayerProps) {
  // useUserSession reads from TanStack Query cache — no effect hop needed.
  const { user } = useUserSession();
  const queryClient = useQueryClient();
  const { subscribe } = useWs();

  // Subscribe to ORDER_STATUS_UPDATE to refresh the order list instantly.
  useEffect(() => {
    if (!user?.id) return;
    return subscribe("ORDER_STATUS_UPDATE", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    });
  }, [user?.id, subscribe, queryClient]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/order/api/user-orders");
      return data.orders as any[];
    },
    initialData: initialOrders.length > 0 ? initialOrders : undefined,
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  return <OrdersList orders={orders || []} isLoading={isLoading && !orders} />;
}
