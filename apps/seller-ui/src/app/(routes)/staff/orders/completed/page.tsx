"use client";
import React from "react";
import { ArrowLeft, CheckCircle, Phone, MapPin, User, CreditCard, Package, Fish } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_ORDERS } from "@/shared/mocks/staffMockData";
import Link from "next/link";

const CompletedOrdersPage = () => {
  const router = useRouter();
  const completedOrders = MOCK_ORDERS.filter((o) => o.status === "Completed");

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
        <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
          <CheckCircle size={24} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Completed Orders</h1>
          <p className="text-gray-400 text-sm">{completedOrders.length} orders delivered</p>
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
          {completedOrders.map((order) => (
            <div key={order.id} className="bg-[#0f1117] border border-gray-800 rounded-xl p-5 hover:border-green-700/50 transition group cursor-pointer">
              <Link href={`/staff/orders/${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-600/20 text-green-300 rounded-full text-xs font-medium border border-green-700/50">
                    Delivered
                  </span>
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

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-white font-bold">{formatINR(order.total)}</span>
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
