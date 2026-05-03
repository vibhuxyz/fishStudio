"use client";
import React from "react";
import {
  ArrowLeft,
  CheckCircle,
  Phone,
  MapPin,
  User,
  CreditCard,
  Package,
  Fish,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import useRequireStaff from "@/hooks/useRequireStaff";
import Link from "next/link";

const CompletedOrdersPage = () => {
  const router = useRouter();
  const { staff } = useRequireStaff();
  const [timeFilter, setTimeFilter] = React.useState("all");

  const canFetch = !!staff && (staff.role === "seller" || staff.isActive);

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ["staff-orders", "completed"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-seller-orders");
      const mapped = (res.data.orders || []).map((o: any) => ({
        id: o.id,
        status:
          o.status === "DELIVERED"
            ? "Completed"
            : o.status === "SHIPPED"
              ? "Ready"
              : o.status === "REJECTED"
                ? "Rejected"
                : o.status === "ACCEPTED"
                  ? "Processing"
                  : "New",
        createdAt: o.createdAt,
        total: o.totalAmount ?? 0,
        user: {
          name: o.user?.name || "Customer",
          phone: o.user?.phone_number || "-",
        },
        shippingAddress: { city: o.deliveryCity || "-" },
      }));
      return mapped.filter((o: any) => o.status === "Completed");
    },
    enabled: canFetch,
  });

  const completedOrders = React.useMemo(() => {
    const now = new Date();
    return rawOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      if (timeFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      if (timeFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      if (timeFilter === "year") {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return orderDate >= yearAgo;
      }
      return true;
    });
  }, [rawOrders, timeFilter]);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <div className="w-full min-h-screen bg-[#080b12] p-6">
      {/* Back */}
      <button
        type="button"
        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition"
        onClick={() => router.back()}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Completed Orders</h1>
            <p className="text-gray-400 text-sm">
              {completedOrders.length} orders delivered
            </p>
          </div>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center bg-[#0f1117] border border-gray-800 rounded-lg p-1 self-start md:self-auto">
          {["all", "week", "month", "year"].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeFilter === f
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders grid */}
      {completedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-700">
          <Fish size={40} className="mb-4 opacity-30" />
          <p className="text-sm">No completed orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedOrders.map((order: any) => (
            <div
              key={order.id}
              className="bg-[#0f1117] border border-gray-800 rounded-xl p-5 hover:border-green-700/50 transition group cursor-pointer"
            >
              <Link href={`/staff/orders/${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-600/20 text-green-300 rounded-full text-xs font-medium border border-green-700/50">
                    Delivered
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">
                      {order.user?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">
                      {order.user?.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">
                      {order.shippingAddress?.city}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-white font-bold">
                    {formatINR(order.total)}
                  </span>
                </div>

                <div className="mt-3 text-center text-blue-400 text-xs font-medium group-hover:underline">
                  View Details
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedOrdersPage;
