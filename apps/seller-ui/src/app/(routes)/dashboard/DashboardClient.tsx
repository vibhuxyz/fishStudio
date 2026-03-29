"use client";

import React from "react";
import Link from "next/link";
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
  AlertCircle,
  Volume2,
  VolumeX
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

import { 
  calculateOrderTraffic, 
  getDeviceTrafficData, 
  CHART_COLORS,
  HD_CHART_COLORS 
} from "@/utils/stats.utils";

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2 group cursor-pointer">
          <div 
            className="w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-125 shadow-lg shadow-black/20" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ===========================
   Dashboard Page
 =========================== */

export default function DashboardClient() {
  const [mounted, setMounted] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [isMuted, setIsMuted] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("staff-order-mute");
    if (saved !== null) setIsMuted(saved === "true");
  }, []);

  const { data: statsData } = useQuery({
    queryKey: ["seller", "stats", "month"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/seller-stats?period=month`, isProtected);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["seller-staffs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/seller/staffs", isProtected);
      return res.data.staffs || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: productsData } = useQuery({
    queryKey: ["seller", "products", "count"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-owned-products?page=1&limit=1", isProtected);
      return res.data.pagination?.total ?? 0;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const stats = statsData?.stats;
  const orderTraffic = calculateOrderTraffic(stats);
  const deviceData = getDeviceTrafficData();

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-[#050505]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10 mb-2 relative overflow-hidden">
        {/* Background Accent orbs */}
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-600/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border border-emerald-500/20 backdrop-blur-md">
              Merchant Operations
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Central Node: {mounted ? (statsData?.storeName || "Primary") : "..."}
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.85] mb-2">
            Business <span className="text-emerald-500/80">Console</span>
          </h1>
          <p className="text-slate-500 font-medium italic text-base opacity-70">
            Orchestrating commercial flow & real-time analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <Link 
            href="/staff" 
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 group"
          >
            <Users size={18} className="transition-transform group-hover:scale-110" />
            Synchronize Team
          </Link>
          
          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              localStorage.setItem("staff-order-mute", String(next));
            }}
            className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
              !isMuted
                ? "bg-emerald-400/15 border-emerald-400/30 shadow-emerald-400/10 hover:bg-emerald-400/20"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
            style={{ opacity: mounted ? 1 : 0 }}
          >
            {!isMuted ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <Volume2 size={16} className="text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX size={16} className="text-slate-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Sound Off</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-[2rem] text-sm text-slate-400 backdrop-blur-2xl shadow-2xl transition-opacity duration-300" style={{ opacity: mounted ? 1 : 0 }}>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <Clock size={18} className="text-slate-600" />
            <span className="font-black text-white tracking-widest font-mono text-base italic">
               {mounted ? new Date().toLocaleTimeString('en-US', { hour12: false }) : "00:00:00"}
            </span>
          </div>
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
          value={productsData ?? 0}
          icon={Package} 
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-white text-xl font-bold italic uppercase tracking-tight">Sales Volume</h2>
              <p className="text-gray-500 text-sm font-medium italic">Real-time revenue tracking & market flow</p>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl">
              <Calendar size={14} className="text-gray-600" />
              <span className="text-xs text-gray-400 font-black uppercase tracking-widest">March 2026</span>
            </div>
          </div>
          <div className="h-[400px]">
             <SalesChart />
          </div>
        </div>

        {/* Side Chart/Info (HD Device Traffic) */}
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors duration-700" />
            
            <div className="mb-6 w-full text-left relative z-10">
              <h2 className="text-white text-xl font-black italic uppercase tracking-tighter">Device Traffic</h2>
              <p className="text-slate-500 text-sm font-medium italic tracking-tight">Digital distribution & presence</p>
            </div>
            
            <div className="w-full h-[240px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={HD_CHART_COLORS.emerald[0]} stopOpacity={1}/>
                      <stop offset="100%" stopColor={HD_CHART_COLORS.emerald[1]} stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={HD_CHART_COLORS.amber[0]} stopOpacity={1}/>
                      <stop offset="100%" stopColor={HD_CHART_COLORS.amber[1]} stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={HD_CHART_COLORS.sky[0]} stopOpacity={1}/>
                      <stop offset="100%" stopColor={HD_CHART_COLORS.sky[1]} stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={deviceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={8}
                    stroke="none"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {deviceData.map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={entry.fill} 
                        style={{
                          filter: activeIndex === i ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))' : 'none',
                          transform: activeIndex === i ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                          transformOrigin: 'center'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)', 
                      borderRadius: '16px', 
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 w-full relative z-10">
               <h3 className="text-white text-[10px] font-black mb-6 uppercase tracking-[0.3em] italic text-center opacity-50">Order Intelligence Stream</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
                  {orderTraffic.map((item) => {
                    const Icon = item.label === "Total" ? ShoppingBag : 
                                item.label === "Success" ? CheckCircle2 :
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

            <div className="mt-8 pt-8 border-t border-white/5 w-full relative z-10">
              <div className="flex justify-between text-[11px] mb-3">
                <span className="text-slate-500 font-black uppercase tracking-[0.15em]">Execution Flow</span>
                <span className="text-emerald-400 font-black italic">{stats?.totalOrders > 0 ? ((stats?.totalDelivered / stats?.totalOrders) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                  style={{ width: `${stats?.totalOrders > 0 ? (stats?.totalDelivered / stats?.totalOrders) * 100 : 0}%` }}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
