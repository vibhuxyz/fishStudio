"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Package, User, Loader2, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { formatOrderId } from "@repo/shared/order-id";
import useStaffRequestConfig from "@/hooks/useStaffRequestConfig";
import { useWorkerWS } from "@/context/worker-ws-context";
import { ItemThumbnails, itemsSummary } from "@/shared/components/staff/item-thumbnails";

const CuttingOrdersPage = () => {
  const { config: staffConfig, isReady } = useStaffRequestConfig();
  const queryClient = useQueryClient();
  const { subscribe } = useWorkerWS();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["cutting-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/staff/my-cutting-orders", staffConfig);
      return res.data.orders || [];
    },
    enabled: isReady,
  });

  // Live refresh — a newly accepted order shouldn't need a manual reload to
  // show up here.
  useEffect(() => {
    const unsubStatus = subscribe("ORDER_STATUS_UPDATE", () => {
      queryClient.invalidateQueries({ queryKey: ["cutting-orders"] });
    });
    const unsubNew = subscribe("NEW_ORDER", () => {
      queryClient.invalidateQueries({ queryKey: ["cutting-orders"] });
    });
    return () => {
      unsubStatus();
      unsubNew();
    };
  }, [subscribe, queryClient]);

  return (
    <div className="px-4 pt-4">
      <h1 className="text-lg font-semibold mb-4">Orders Awaiting Preparation</h1>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-500">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <Package size={36} className="mb-3 opacity-40" />
          <p className="text-sm">No orders waiting for preparation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Link
              key={order.id}
              href={`/staff/cutting/order/${order.id}`}
              className="block bg-[#0f1117] border border-gray-800 rounded-xl p-4 active:border-emerald-700/60 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold text-sm">Order {formatOrderId(order.id)}</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300">
                  {order.status === "PREPARING" ? "Preparing" : "Accepted"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-1.5">
                <User size={13} className="text-gray-500 shrink-0" />
                {order.user?.name || order.deliveryName || "Customer"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Clock size={13} className="text-gray-500 shrink-0" />
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center gap-3 border-t border-gray-800 pt-3">
                <ItemThumbnails items={order.items} />
                <span className="line-clamp-2 flex-1 text-sm text-gray-400">{itemsSummary(order.items)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuttingOrdersPage;
