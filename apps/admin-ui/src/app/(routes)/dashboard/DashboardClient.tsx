"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { useAdminStats, useAdminSellers, useAdminProducts } from "@/hooks/useAdminQueries";
import {
  calculateAdminOrderTraffic,
  getAdminDeviceTrafficData,
  ADMIN_CHART_COLORS,
} from "@/utils/stats.utils";

/* ===========================
   Dynamic imports (NO SSR)
 =========================== */

// One lazy boundary per chart, not per recharts primitive: recharts inspects
// its children's component types to assemble a chart, and a next/dynamic
// wrapper is opaque to that.
const DeviceTrafficChart = dynamic(
  () =>
    import("@/shared/components/charts/device-traffic.chart").then(
      (m) => m.DeviceTrafficChart,
    ),
  { ssr: false },
);
const CategoryBreakdownChart = dynamic(
  () =>
    import("@/shared/components/charts/category-breakdown.chart").then(
      (m) => m.CategoryBreakdownChart,
    ),
  { ssr: false },
);

const SalesChart = dynamic(
  () =>
    import("@/shared/components/charts/sales.chart").then((m) => m.SalesChart),
  { ssr: false },
);

/* ===========================
   Stats Card Component
 =========================== */

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
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
};

/* ===========================
   Dashboard Page
 =========================== */

export default function DashboardClient() {
  const { data: statsData, isLoading: statsLoading } = useAdminStats("month");
  const { data: sellers = [] } = useAdminSellers();
  const { data: products = [] } = useAdminProducts();

  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const stats = statsData?.stats;
  const orderTraffic = calculateAdminOrderTraffic(stats);
  const deviceData = getAdminDeviceTrafficData();

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-[#050505]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10 mb-2 relative overflow-hidden">
        {/* Background Accent orbs */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border border-blue-500/20 backdrop-blur-md">
              Administrative Control
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Global Node Bios: Standard
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.85] mb-2">
            Master <span className="text-blue-500/80">Control</span>
          </h1>
          <p className="text-slate-500 font-medium italic text-base opacity-70">
            System-wide orchestration & global liquidity metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-[2rem] text-[10px] text-slate-400 backdrop-blur-2xl shadow-2xl transition-all">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="font-black uppercase tracking-[0.2em] text-white/80">Live System Feed</span>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Clock size={18} className="text-slate-600" />
            <span className="font-black text-white tracking-widest font-mono text-base italic">
              {lastUpdated || "00:00:00"}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total GMV" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+12.5%" 
          color="bg-emerald-500"
        />
        <StatsCard 
          title="Global Orders" 
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
              <h2 className="text-white text-xl font-bold italic uppercase tracking-tight">Revenue Growth</h2>
              <p className="text-slate-500 text-sm font-medium italic">Monthly sales performance & system liquidity</p>
            </div>
            <select className="bg-black/40 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 py-2 hover:border-blue-500/30 transition-all outline-none">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div className="h-[400px]">
             <SalesChart />
          </div>
        </div>

        {/* Side Chart/Info (HD Device Traffic) */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />
            
            <div className="mb-6 w-full text-left relative z-10">
              <h2 className="text-white text-xl font-black italic uppercase tracking-tighter">Device Traffic</h2>
              <p className="text-slate-500 text-sm font-medium italic tracking-tight">Global visitor distribution</p>
            </div>
            
            <div className="w-full h-[300px] relative z-10">
              <DeviceTrafficChart data={deviceData} />
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 w-full relative z-10">
               <h3 className="text-white text-[10px] font-black mb-6 uppercase tracking-[0.3em] italic text-center opacity-50">Global Order Intelligence</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
                  {orderTraffic.map((item) => {
                    const Icon = item.label === "Total" ? ShoppingBag : 
                                item.label === "Fulfilled" ? CheckCircle2 :
                                item.label === "Pending" ? Clock : AlertCircle;
                    return (
                      <div key={item.label} className="text-center group/item hover:scale-105 transition-all duration-500 bg-white/[0.02] border border-white/[0.05] p-4 rounded-3xl hover:bg-white/[0.05] hover:border-white/10">
                        <div className={`w-8 h-8 mx-auto mb-3 rounded-xl flex items-center justify-center ${item.bg}/10 ${item.color} border border-current/20 shadow-lg shadow-black/20`}>
                          <Icon size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5 opacity-60">{item.label}</p>
                        <p className={`text-2xl font-black ${item.color} tracking-tighter tabular-nums`}>{item.value}</p>
                      </div>
                    );
                  })}
               </div>
            </div>
        </div>
      </div>

      {/* Category Breakdown & Seller Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl">
          <h2 className="text-white text-xl font-bold mb-6">Category Sales Breakdown</h2>
          <div className="h-[350px]">
            <CategoryBreakdownChart data={statsData?.categoryBreakdown || []} />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl overflow-hidden">
          <h2 className="text-white text-xl font-bold mb-6">Seller Performance Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-4 font-medium text-gray-400">Seller</th>
                  <th className="pb-4 font-medium text-gray-400">Revenue</th>
                  <th className="pb-4 font-medium text-gray-400">Orders</th>
                  <th className="pb-4 font-medium text-gray-400">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {(statsData?.perSellerBreakdown || []).slice(0, 5).map((seller: any) => (
                  <tr key={seller.sellerId} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{seller.name}</div>
                      <div className="text-xs text-gray-500">{seller.email}</div>
                    </td>
                    <td className="py-4 text-white font-medium">₹{(seller.totalRevenue || 0).toLocaleString()}</td>
                    <td className="py-4 text-gray-300">{seller.totalOrders}</td>
                    <td className="py-4">
                      <span className="text-emerald-400 font-medium">
                        {seller.totalOrders > 0 
                          ? ((seller.totalDelivered / seller.totalOrders) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
