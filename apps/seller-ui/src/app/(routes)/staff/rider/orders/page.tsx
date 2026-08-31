"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  User,
  Phone,
  MapPin,
  Loader2,
  Bike,
  Navigation,
  Clock,
  CheckCircle2,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { displayOrderNumber } from "@repo/shared/order-id";
import useStaffRequestConfig from "@/hooks/useStaffRequestConfig";
import useSeller from "@/hooks/useSeller";
import { useWorkerWS } from "@/context/worker-ws-context";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ItemThumbnails, itemsSummary } from "@/shared/components/staff/item-thumbnails";
import { buildMapsUrl } from "@/shared/utils/maps";

const STATUS_STYLES: Record<string, string> = {
  ASSIGNED_TO_RIDER: "bg-blue-900/50 text-blue-300",
  SHIPPED: "bg-amber-900/50 text-amber-300",
  DELIVERED: "bg-green-900/50 text-green-300",
};

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED_TO_RIDER: "Assigned",
  SHIPPED: "Out for Delivery",
  DELIVERED: "Delivered",
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const RiderOrdersPage = () => {
  const router = useRouter();
  const [scope, setScope] = useState<"assigned" | "completed">("assigned");
  const { config: staffConfig, isReady } = useStaffRequestConfig();
  const { seller } = useSeller();
  const isSellerViewing = seller?.role === "seller";
  const queryClient = useQueryClient();
  const { subscribe } = useWorkerWS();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["rider-orders", scope],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order/api/staff/my-rider-orders?scope=${scope}`,
        staffConfig,
      );
      return res.data.orders || [];
    },
    enabled: isReady,
  });

  // Live refresh — a new assignment or delivery elsewhere shouldn't need a
  // manual reload to show up here.
  useEffect(() => {
    const unsubStatus = subscribe("ORDER_STATUS_UPDATE", () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
    });
    const unsubNew = subscribe("NEW_ORDER", () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
    });
    return () => {
      unsubStatus();
      unsubNew();
    };
  }, [subscribe, queryClient]);

  const markPickedUpMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await axiosInstance.put(`/order/api/staff/mark-picked-up/${orderId}`, {}, staffConfig);
      return orderId;
    },
    onSuccess: (orderId) => {
      toast.success("Order marked as picked up!");
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      // Take the rider straight to the order's detail view — everything
      // they need for the delivery (address, products, proof upload) lives
      // there, not on this list.
      router.push(`/staff/rider/order/${orderId}`);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update order.");
    },
  });

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center bg-[#0f1117] border border-gray-800 rounded-lg p-1 mb-4">
        {(["assigned", "completed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              scope === s ? "bg-blue-600 text-white" : "text-gray-500"
            }`}
          >
            {s === "assigned" ? "Assigned Orders" : "Completed Orders"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-500">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <Package size={36} className="mb-3 opacity-40" />
          <p className="text-sm">
            {scope === "assigned" ? "No orders assigned right now." : "No completed deliveries yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            // Once delivered, the rider no longer needs the customer's contact
            // details or address to do their job — keep only the name visible.
            const isDelivered = order.status === "DELIVERED";
            const mapsUrl = !isDelivered ? buildMapsUrl(order) : null;
            const isMarkingThis =
              markPickedUpMutation.isPending && markPickedUpMutation.variables === order.id;

            return (
              <div key={order.id} className="bg-[#0f1117] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-sm">Order {displayOrderNumber(order)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-gray-700 text-gray-300"}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  {/* A seller sees every rider's orders in one list — show whose
                      delivery this is so it's unambiguous which account it belongs to. */}
                  {isSellerViewing && order.rider?.name && (
                    <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
                      <Bike size={13} className="shrink-0" />
                      {order.rider.name}
                    </div>
                  )}

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <User size={13} className="text-gray-500 shrink-0" />
                      {order.user?.name || order.deliveryName || "Customer"}
                    </div>
                    {!isDelivered && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone size={13} className="text-gray-500 shrink-0" />
                          {order.deliveryPhone || order.user?.phone_number || "-"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin size={13} className="text-gray-500 shrink-0" />
                          <span className="line-clamp-1">{order.deliveryAddress || "-"}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 border-t border-gray-800 pt-3">
                    <ItemThumbnails items={order.items} />
                    <span className="line-clamp-2 flex-1 text-sm text-gray-400">{itemsSummary(order.items)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Wallet size={13} className="shrink-0" />
                      {typeof order.total === "number" ? `₹${order.total.toFixed(0)}` : "-"}
                    </div>
                    {timeAgo(order.assignedAt || order.createdAt) && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={13} className="shrink-0" />
                        {timeAgo(order.assignedAt || order.createdAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-stretch border-t border-gray-800">
                  {!isDelivered && (
                    <a
                      href={`tel:${order.deliveryPhone || order.user?.phone_number || ""}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-green-400 hover:bg-gray-900 transition"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  )}
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-300 hover:bg-gray-900 transition border-l border-gray-800"
                    >
                      <Navigation size={14} />
                      Maps
                    </a>
                  )}
                  <Link
                    href={`/staff/rider/order/${order.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-sm text-gray-300 hover:bg-gray-900 transition border-l border-gray-800"
                  >
                    Details
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {order.status === "ASSIGNED_TO_RIDER" && (
                  <button
                    type="button"
                    disabled={isMarkingThis}
                    onClick={() => markPickedUpMutation.mutate(order.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition border-t border-blue-500/30"
                  >
                    {isMarkingThis ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Mark Picked Up
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderOrdersPage;
