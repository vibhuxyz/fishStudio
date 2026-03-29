"use client";

import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useWs } from "@/context/ws-context";
import { OrdersList } from "./orders-list";

interface OrdersRealtimeLayerProps {
  initialOrders: any[];
}

export function OrdersRealtimeLayer({ initialOrders }: OrdersRealtimeLayerProps) {
  const { isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();
  const { subscribe } = useWs();

  // Subscribe to ORDER_STATUS_UPDATE to refresh the order list instantly.
  useEffect(() => {
    if (!user?.id) return;
    return subscribe("ORDER_STATUS_UPDATE", (data: any) => {
      // We can also check if the update is for one of the user's orders
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    });
  }, [user?.id, subscribe, queryClient]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/order/api/user-orders");
      return data.orders as any[];
    },
    initialData: initialOrders,
    enabled: isLoggedIn,
    staleTime: 1000 * 60, // 1 minute
  });

  return <OrdersList orders={orders || []} isLoading={isLoading && !orders} />;
}
