"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, MapPin, Package, TrendingDown, Trophy, AlertTriangle, IndianRupee, RefreshCw, ShoppingCart, CheckCircle2, Search, Filter, ChevronDown, Download } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

type StatsPeriod = "week" | "month" | "year";
type PincodeRow = {
  pincode: string;
  orders: number;
  revenue: number;
  products?: Record<string, { title: string; qty: number; revenue: number }>;
};
type ProductRow = { id: string; title: string; orders: number; revenue: number; image?: string };
type DetailedProductRow = ProductRow & {
  deliveredQty: number;
  cancelledQty: number;
  pendingQty: number;
  refundedQty: number;
  refundedAmount: number;
  couponSpend: number;
  quantaSale: number;
  repeatCustomers: number;
  avgPrice: number;
  orderIds: string[];
  pincodeBreakdown: Record<string, number>;
};
type StatsPayload = {
  totalOrders: number;
  totalDelivered: number;
  totalCancelled: number;
  totalRefunded: number;
  totalPending: number;
  totalAccepted: number;
  totalRevenue: number;
  totalRefundedAmount: number;
  totalCouponSpend: number;
  pincodeBreakdown: PincodeRow[];
  heroProducts: ProductRow[];
  needsImprovement: ProductRow[];
  toRemove: ProductRow[];
  allProductsBreakdown?: DetailedProductRow[];
};

import ProductDetailModal from "@/shared/components/analytics/ProductDetailModal";

const PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

function StatCard({
  label,
  value,
  sub,
  colorClass = "bg-blue-900/50 text-blue-400",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-[#111827] p-5 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-bold text-white">{value}</h4>
        <p className="text-sm font-medium text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
      </div>
    </div>
  );
}

function ProductListCard({ title, icon, products, rankMode = false, isWarning = false, onClick }: { title: string; icon: React.ReactNode; products: (ProductRow | DetailedProductRow)[]; rankMode?: boolean; isWarning?: boolean; onClick?: (p: any) => void }) {
  return (
    <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="p-2 bg-gray-800/50 rounded-full">{icon}</div>
      </div>
      
      {products.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">No data available</div>
      ) : (
        <div className="space-y-4 flex-1">
          {products.map((p, i) => (
            <div 
              key={p.id} 
              onClick={() => onClick?.(p)}
              className="flex items-center gap-4 bg-gray-800/30 rounded-xl p-3 border border-gray-800/50 transition-all hover:bg-gray-800/50 hover:border-gray-700 cursor-pointer group"
            >
              {rankMode && (
                <span className={`text-sm font-bold w-5 shrink-0 ${i < 3 ? 'text-amber-400' : 'text-gray-500'}`}>#{i + 1}</span>
              )}
              <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 shadow-sm flex items-center justify-center">
                {p.image ? (
                  <Image src={p.image} alt={p.title} fill sizes="48px" className="object-cover group-hover:scale-110 transition-transform" />
                ) : (
                  <Package size={20} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">{p.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${isWarning ? 'bg-red-900/30 text-red-500' : 'bg-blue-900/30 text-blue-500'}`}>
                      {p.orders} orders
                    </span>
                    <span className="text-xs font-medium text-gray-400">₹{p.revenue.toLocaleString()}</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SellerAnalyticsPage = () => {
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [selectedProduct, setSelectedProduct] = useState<DetailedProductRow | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["seller", "stats", period],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/seller-stats?period=${period}`, isProtected);
      return res.data as { period: string; stats: StatsPayload };
    },
  });
  const stats = data?.stats;

  const totalCompleted = stats?.totalDelivered || 0;
  const completionRate = stats && stats.totalOrders > 0 
    ? Math.round((totalCompleted / stats.totalOrders) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 font-sans text-gray-200 selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto">
        {selectedProduct && (
          <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 size={28} className="text-blue-500" />
              My Analytics
            </h1>
            <p className="text-gray-400 mt-1 font-medium text-sm">Monitor your store's performance, orders, and products</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#111827] border border-gray-800 rounded-full px-1 shadow-sm h-10">
               {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                    period === p.value
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            
            <button className="h-10 px-4 bg-[#111827] border border-gray-800 rounded-full text-sm font-semibold text-gray-300 shadow-sm flex items-center gap-2 hover:bg-gray-800 transition">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-20 flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="font-medium text-gray-400">Loading analytics data...</p>
          </div>
        )}
        
        {isError && (
          <div className="rounded-2xl bg-red-950/30 border border-red-900/50 p-8 flex items-center gap-4 text-red-500">
            <AlertTriangle size={24} />
            <div>
              <h3 className="font-bold text-lg">Failed to load analytics</h3>
              <p className="text-sm mt-1 text-red-400">Please try refreshing the page or check your connection.</p>
            </div>
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Top Graphic Dashboard-style Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Status Bars */}
              <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-1">Orders Breakdown</h3>
                <p className="text-sm text-gray-400 mb-6">{stats.totalOrders} total orders this period.</p>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="flex items-center gap-2 text-gray-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Delivered
                      </span>
                      <span className="text-gray-200">{stats.totalDelivered}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.totalDelivered / stats.totalOrders) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="flex items-center gap-2 text-gray-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pending / Processing
                      </span>
                      <span className="text-gray-200">{stats.totalPending}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.totalPending / stats.totalOrders) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className="flex items-center gap-2 text-gray-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Cancelled
                      </span>
                      <span className="text-gray-200">{stats.totalCancelled}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.totalCancelled / stats.totalOrders) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Circular Progress Right Now */}
              <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6 flex flex-col items-center justify-center relative">
                <div className="absolute top-6 left-6">
                  <h3 className="text-lg font-bold text-white">Completion Rate</h3>
                </div>
                
                <div className="relative w-48 h-48 mt-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="text-gray-800 stroke-current" strokeWidth="12" fill="transparent" />
                    <circle cx="50" cy="50" r="40" className="text-lime-500 stroke-current transition-all duration-1000 ease-in-out" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * completionRate) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{completionRate}%</span>
                    <span className="text-xs text-gray-400 font-medium">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-6">Revenue Summary</h3>
                <div className="space-y-4">
                    <div className="bg-green-950/30 rounded-xl p-5 border border-green-900/50">
                      <p className="text-sm font-semibold text-green-500 mb-1">Total Earned</p>
                      <h4 className="text-3xl font-bold text-green-400">₹{stats.totalRevenue.toLocaleString()}</h4>
                    </div>
                    <div className="bg-orange-950/30 rounded-xl p-5 border border-orange-900/50">
                      <p className="text-sm font-semibold text-orange-500 mb-1">Total Refunded</p>
                      <h4 className="text-3xl font-bold text-orange-400">₹{stats.totalRefundedAmount.toLocaleString()}</h4>
                      <p className="text-xs text-orange-600 mt-1 font-medium">{stats.totalRefunded} refunded orders</p>
                    </div>
                    <div className="bg-blue-950/30 rounded-xl p-5 border border-blue-900/50">
                      <p className="text-sm font-semibold text-blue-500 mb-1">Coupon/Event Spend</p>
                      <h4 className="text-3xl font-bold text-blue-400">₹{stats.totalCouponSpend?.toLocaleString() || '0'}</h4>
                    </div>
                </div>
              </div>
            </div>

            {/* Granular Product Breakdown Table */}
            <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <Package size={20} className="text-blue-500" />
                   Product Inventory Performance
                 </h3>
                 <button className="text-xs font-bold text-gray-500 hover:text-white transition uppercase tracking-widest">
                   Full Report
                 </button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead>
                     <tr className="border-b border-gray-800 text-gray-500">
                       <th className="py-4 px-2 font-bold uppercase text-[10px] tracking-widest">Product Name</th>
                       <th className="py-4 px-2 text-center font-bold uppercase text-[10px] tracking-widest">Quanta Sale</th>
                       <th className="py-4 px-2 text-center font-bold uppercase text-[10px] tracking-widest">Completed</th>
                       <th className="py-4 px-2 text-center font-bold uppercase text-[10px] tracking-widest">Refunded</th>
                       <th className="py-4 px-2 text-right font-bold uppercase text-[10px] tracking-widest">Totally Amount</th>
                       <th className="py-4 px-2 text-right font-bold uppercase text-[10px] tracking-widest">Coupon/Event</th>
                       <th className="py-4 px-2 text-center font-bold uppercase text-[10px] tracking-widest">View</th>
                     </tr>
                   </thead>
                   <tbody className="text-gray-300">
                     {stats.allProductsBreakdown?.length === 0 ? (
                       <tr><td colSpan={7} className="py-10 text-center text-gray-600 italic">No product data available</td></tr>
                     ) : (
                       stats.allProductsBreakdown?.map((p) => (
                         <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition group">
                           <td className="py-4 px-2">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 shrink-0">
                                 {p.image ? <Image src={p.image} alt={p.title} width={40} height={40} className="object-cover" /> : <Package size={20} className="m-2 text-gray-700" />}
                               </div>
                               <div>
                                 <p className="font-bold text-gray-200 group-hover:text-white truncate max-w-[150px]">{p.title}</p>
                                 <p className="text-[10px] font-medium text-gray-500 uppercase">#{p.id.slice(-6)}</p>
                               </div>
                             </div>
                           </td>
                           <td className="py-4 px-2 text-center font-black">{p.quantaSale}</td>
                           <td className="py-4 px-2 text-center font-bold text-lime-500">{p.deliveredQty}</td>
                           <td className="py-4 px-2 text-center font-bold text-red-500">{p.refundedQty || 0}</td>
                           <td className="py-4 px-2 text-right font-black text-white">₹{p.revenue.toLocaleString()}</td>
                           <td className="py-4 px-2 text-right font-bold text-blue-400">₹{p.couponSpend.toLocaleString()}</td>
                           <td className="py-4 px-2 text-center">
                             <button 
                               onClick={() => setSelectedProduct(p)}
                               className="h-8 w-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition shadow-sm"
                             >
                               <Search size={14} />
                             </button>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Product Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProductListCard 
                title="Hero Products" 
                icon={<Trophy size={20} className="text-amber-400" />} 
                products={stats.heroProducts} 
                rankMode={true} 
                onClick={(p) => {
                  const full = stats.allProductsBreakdown?.find(ap => ap.id === p.id);
                  setSelectedProduct(full || null);
                }}
              />
              <ProductListCard 
                title="Needs Improvement" 
                icon={<TrendingDown size={20} className="text-yellow-500" />} 
                products={stats.needsImprovement} 
                isWarning={true}
                onClick={(p) => {
                  const full = stats.allProductsBreakdown?.find(ap => ap.id === p.id);
                  setSelectedProduct(full || null);
                }}
              />
              <ProductListCard 
                title="Consider Removing" 
                icon={<AlertTriangle size={20} className="text-red-400" />} 
                products={stats.toRemove} 
                isWarning={true}
                onClick={(p) => {
                  const full = stats.allProductsBreakdown?.find(ap => ap.id === p.id);
                  setSelectedProduct(full || null);
                }}
              />
            </div>
            {/* Geographic Performance removed for sellers as per requirements */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;
