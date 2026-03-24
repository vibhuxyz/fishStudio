"use client";
import React from "react";
import { ArrowLeft, XCircle, Phone, MapPin, User, CreditCard, Package, Fish, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import useRequireStaff from "@/hooks/useRequireStaff";
import Link from "next/link";

const RejectedOrdersPage = () => {
  const router = useRouter();
  const { staff } = useRequireStaff();
  
  const canFetch = !!staff && (staff.role === "seller" || staff.isActive);

  const { data: rejectedOrders = [], isLoading } = useQuery({
    queryKey: ["staff-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-seller-orders");
      const mapped = res.data.orders.map((o: any) => ({
        id: o.id,
        status: o.status === "ACCEPTED" ? "Processing" :
                o.status === "REJECTED" ? "Rejected" :
                o.deliveryStatus === "Packed" ? "Ready" :
                o.deliveryStatus === "Delivered" ? "Completed" : "New",
        createdAt: o.createdAt,
        total: o.totalAmount ?? 0,
        user: { name: o.user?.name || "Customer", phone: o.user?.phone_number || "-" },
        shippingAddress: { city: "-" },
        rejectionReason: o.rejectionReason,
        refundStatus: o.paymentStatus === "REFUNDED" ? "Refunded" : null
      }));
      return mapped.filter((o: any) => o.status === "Rejected");
    },
    enabled: canFetch,
  });

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
          <XCircle size={24} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Rejected Orders</h1>
          <p className="text-gray-400 text-sm">{rejectedOrders.length} orders cancelled with refund</p>
        </div>
      </div>

      {/* Orders grid */}
      {rejectedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-700">
          <Fish size={40} className="mb-4 opacity-30" />
          <p className="text-sm">No rejected orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rejectedOrders.map((order: any) => (
            <div key={order.id} className="bg-[#0f1117] border border-gray-800 rounded-xl p-5 hover:border-red-700/50 transition group cursor-pointer">
              <Link href={`/staff/orders/${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2.5 py-1 bg-red-600/20 text-red-300 rounded-full text-xs font-medium border border-red-700/50">
                      Rejected
                    </span>
                    <span className="px-2.5 py-1 bg-green-600/20 text-green-300 rounded-full text-xs font-medium border border-green-700/50">
                      Refunded
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{order.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{order.user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{order.shippingAddress?.city}</span>
                  </div>
                </div>

                {order.rejectionReason && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-2.5 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-200">{order.rejectionReason}</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Refunded</span>
                  <span className="text-green-400 font-bold">{formatINR(order.total)}</span>
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

export default RejectedOrdersPage;
