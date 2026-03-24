"use client";

import React, { useMemo } from "react";
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
  Clock
} from "lucide-react";

import { useAdminStats, useAdminSellers, useAdminProducts } from "@/hooks/useAdminQueries";

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
  const { data: statsData, isLoading: statsLoading } = useAdminStats("month");
  const { data: sellers = [] } = useAdminSellers();
  const { data: products = [] } = useAdminProducts();

  const stats = statsData?.stats;

  const deviceData = [
    { name: "Phone", value: 55 },
    { name: "Tablet", value: 20 },
    { name: "Computer", value: 25 },
  ];
  const COLORS = ["#10b981", "#f59e0b", "#3b82f6"];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-gray-400 mt-1">Real-time performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-sm text-gray-300">
          <Clock size={16} className="text-gray-500" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+12.5%" 
          color="bg-emerald-500"
        />
        <StatsCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="+8.2%" 
          color="bg-blue-500"
        />
        <StatsCard 
          title="Active Sellers" 
          value={sellers.length} 
          icon={Users} 
          color="bg-amber-500"
        />
        <StatsCard 
          title="Total Products" 
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
              <h2 className="text-white text-xl font-bold">Revenue Growth</h2>
              <p className="text-gray-400 text-sm">Monthly sales performance</p>
            </div>
            <select className="bg-gray-800 border-none rounded-lg text-sm text-white px-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div className="h-[400px]">
             <SalesChart />
          </div>
        </div>

        {/* Side Chart/Info */}
        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="mb-6 w-full text-left">
              <h2 className="text-white text-xl font-bold">Device Traffic</h2>
              <p className="text-gray-400 text-sm">Visitor distribution</p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-8 pt-8 border-t border-gray-800 w-full grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black">Success</p>
                  <p className="text-lg font-bold text-emerald-400">{stats?.totalDelivered || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black">Pending</p>
                  <p className="text-lg font-bold text-amber-400">{stats?.totalPending || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-black">Failed</p>
                  <p className="text-lg font-bold text-rose-400">{stats?.totalCancelled || 0}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
