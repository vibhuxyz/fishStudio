"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingBag, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

/* ===========================
   Dynamic imports (NO SSR)
=========================== */

const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});

const SalesChart = dynamic(
  () =>
    import("@/shared/components/charts/sales.chart").then((m) => m.SalesChart),
  { ssr: false },
);

/* ===========================
   Stats Card Component
=========================== */

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

/* ===========================
   Dashboard Page
=========================== */

export default function DashboardClient() {
  const { data: statsData } = useQuery({
    queryKey: ["seller", "stats", "month"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/seller-stats?period=month`, isProtected);
      return res.data;
    },
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["seller-staffs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/seller/staffs", isProtected);
      return res.data.staffs || [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ["seller", "products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-owned-products", isProtected);
      return res.data.products || [];
    }
  });

  const stats = statsData?.stats;

  const deviceData = [
    { name: "Phone", value: 45 },
    { name: "Tablet", value: 25 },
    { name: "Computer", value: 30 },
  ];
  const COLORS = ["#10b981", "#f59e0b", "#3b82f6"];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Shop Insights</h1>
          <p className="text-gray-400 mt-1">Performance overview for your fish studio</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-sm text-gray-300">
          <Clock size={16} className="text-gray-500" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Monthly Revenue" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+15.2%" 
          color="bg-emerald-500"
        />
        <StatsCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="+5.4%" 
          color="bg-blue-500"
        />
        <StatsCard 
          title="Team Members" 
          value={staffList.length} 
          icon={Users} 
          color="bg-amber-500"
        />
        <StatsCard 
          title="Shop Products" 
          value={products.length} 
          icon={Package} 
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-white text-xl font-bold">Sales Volume</h2>
              <p className="text-gray-400 text-sm">Real-time revenue tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm text-gray-300 font-medium whitespace-nowrap">March 2026</span>
            </div>
          </div>
          <div className="h-[400px]">
             <SalesChart />
          </div>
        </div>

        {/* Side Progress */}
        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl flex flex-col">
            <h2 className="text-white text-xl font-bold mb-1">Order Fulfillment</h2>
            <p className="text-gray-400 text-sm mb-8">Performance breakdown</p>
            
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">Successful Delivery</span>
                  <span className="text-emerald-400 font-bold">{stats?.totalDelivered || 0}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats?.totalOrders > 0 ? (stats?.totalDelivered / stats?.totalOrders) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">Pending Processing</span>
                  <span className="text-amber-400 font-bold">{stats?.totalPending || 0}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats?.totalOrders > 0 ? (stats?.totalPending / stats?.totalOrders) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">Cancelled/Rejected</span>
                  <span className="text-rose-400 font-bold">{stats?.totalCancelled || 0}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats?.totalOrders > 0 ? (stats?.totalCancelled / stats?.totalOrders) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 w-full">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                <span>Customer Satisfaction</span>
                <span className="text-white">94%</span>
              </div>
              <div className="flex gap-1 mt-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-sky-500' : 'bg-gray-800'}`}></div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
