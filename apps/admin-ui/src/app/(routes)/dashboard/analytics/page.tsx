"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, ExternalLink, MapPin, Package, TrendingDown, Trophy, AlertTriangle, IndianRupee, RefreshCw, ShoppingCart, CheckCircle2, ChevronDown, Download, Filter, Search, Calendar } from "lucide-react";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  useAdminStats,
  StatsPeriod,
  StatsPayload,
  PincodeRow,
  ProductRow,
  DetailedProductRow,
  SellerBreakdownRow,
} from "@/hooks/useAdminQueries";
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

function ProductListCard({ title, icon, products, rankMode = false, isWarning = false, onProductClick }: { title: string; icon: React.ReactNode; products: (ProductRow | DetailedProductRow)[]; rankMode?: boolean; isWarning?: boolean; onProductClick?: (p: any) => void }) {
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
              onClick={() => onProductClick?.(p)}
              className="flex items-center gap-4 bg-gray-800/30 rounded-xl p-3 border border-gray-800/50 transition-all hover:bg-gray-800/50 hover:border-gray-700 cursor-pointer group"
            >
              {rankMode && (
                <span className={`text-sm font-bold w-5 shrink-0 ${i < 3 ? 'text-amber-400' : 'text-gray-500'}`}>#{i + 1}</span>
              )}
              <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 shadow-sm flex items-center justify-center">
                {p.image ? (
                  <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform" />
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
                  <ExternalLink size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StatsSection({ 
  stats, 
  onProductClick,
  expandedPincode,
  setExpandedPincode
}: { 
  stats: StatsPayload; 
  onProductClick: (p: any) => void;
  expandedPincode: string | null;
  setExpandedPincode: (p: string | null) => void;
}) {
  const totalCompleted = stats.totalDelivered;
  const completionRate = stats.totalOrders > 0 
    ? Math.round((totalCompleted / stats.totalOrders) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Graphic Dashboard-style Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Bars */}
        <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-1">Platform Orders</h3>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pending
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
            
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Refunded
                </span>
                <span className="text-gray-200">{stats.totalRefunded}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats.totalOrders > 0 ? (stats.totalRefunded / stats.totalOrders) * 100 : 0}%` }}></div>
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
              </div>
           </div>
        </div>
      </div>

      {/* Product Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductListCard 
          title="Hero Products" 
          icon={<Trophy size={20} className="text-amber-400" />} 
          products={stats.heroProducts} 
          rankMode={true} 
          onProductClick={onProductClick}
        />
        <ProductListCard 
          title="Needs Improvement" 
          icon={<TrendingDown size={20} className="text-yellow-500" />} 
          products={stats.needsImprovement} 
          isWarning={true}
          onProductClick={onProductClick}
        />
        <ProductListCard 
          title="Consider Removing" 
          icon={<AlertTriangle size={20} className="text-red-400" />} 
          products={stats.toRemove} 
          isWarning={true}
          onProductClick={onProductClick}
        />
      </div>

      {/* Pincode & Shop Table (Updated per mockup) */}
      <div className="rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500">
               <MapPin size={20} />
             </div>
             <h3 className="text-lg font-bold text-white">Geographic Performance (Pincodes)</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-950/50 text-gray-500 border-b border-gray-800">
              <tr>
                <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Pin code</th>
                <th className="py-4 px-4 font-black uppercase text-[10px] tracking-widest">Shop Name</th>
                <th className="py-4 px-4 text-center font-black uppercase text-[10px] tracking-widest">Total Sales by Shop</th>
                <th className="py-4 px-4 text-center font-black uppercase text-[10px] tracking-widest">Total Repetition</th>
                <th className="py-4 px-4 text-center font-black uppercase text-[10px] tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {stats.pincodeBreakdown.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-600 italic">No geographic data available</td></tr>
              ) : (
                stats.pincodeBreakdown.flatMap((row) => 
                  row.shops ? row.shops.map((shopData) => {
                    const isExpanded = expandedPincode === `${row.pincode}-${shopData.id}`;
                    return (
                      <React.Fragment key={`${row.pincode}-${shopData.id}`}>
                        <tr 
                          className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition cursor-pointer ${isExpanded ? 'bg-gray-800/20 text-white' : ''}`}
                          onClick={() => setExpandedPincode(isExpanded ? null : `${row.pincode}-${shopData.id}`)}
                        >
                          <td className="py-4 px-4 font-bold text-blue-400">#{row.pincode}</td>
                          <td className="py-4 px-4 font-bold">{shopData.name || "Unknown Shop"}</td>
                          <td className="py-4 px-4 text-center font-black">{shopData.sales}</td>
                          <td className="py-4 px-4 text-center font-bold text-lime-500">{shopData.repetition || 0}</td>
                          <td className="py-4 px-4 text-center">
                            <button className={`p-2 rounded-full transition ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-500'}`}>
                              <ChevronDown size={14} className={isExpanded ? "rotate-180" : ""} />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-900/50">
                            <td colSpan={5} className="p-0">
                              <div className="p-6 border-x border-gray-800/50 animate-in slide-in-from-top-2 duration-200">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                  <Package size={12} className="text-blue-500" />
                                  Product Performance for {shopData.name} in {row.pincode}
                                </h4>
                                <table className="w-full text-[11px] text-left">
                                  <thead className="text-gray-600 border-b border-gray-800">
                                    <tr>
                                      <th className="pb-3 pr-2 font-black uppercase tracking-widest">Product Name</th>
                                      <th className="pb-3 px-2 text-center font-black uppercase tracking-widest">Quanta Sale</th>
                                      <th className="pb-3 px-2 text-center font-black uppercase tracking-widest">Completed</th>
                                      <th className="pb-3 px-2 text-center font-black uppercase tracking-widest">Refunded</th>
                                      <th className="pb-3 px-2 text-right font-black uppercase tracking-widest">Totally Amount</th>
                                      <th className="pb-3 px-2 text-right font-black uppercase tracking-widest">Coupon/Event</th>
                                      <th className="pb-3 pl-2 text-center font-black uppercase tracking-widest">View</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.values(shopData.products || {}).map((p: any) => (
                                      <tr key={p.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition group">
                                        <td className="py-3 pr-2 flex items-center gap-3">
                                           <div className="h-8 w-8 rounded bg-gray-900 border border-gray-800 overflow-hidden shrink-0">
                                             {p.image ? <img src={p.image} alt={p.title} width={32} height={32} className="object-cover" /> : <Package size={12} className="m-2 text-gray-700" />}
                                           </div>
                                           <span className="font-bold text-gray-300 group-hover:text-white transition-colors truncate max-w-[150px]">{p.title}</span>
                                        </td>
                                        <td className="py-3 px-2 text-center font-black">{p.qty}</td>
                                        <td className="py-3 px-2 text-center font-bold text-lime-500">{p.qty}</td>
                                        <td className="py-3 px-2 text-center font-bold text-red-500">0</td>
                                        <td className="py-3 px-2 text-right font-black text-white">₹{p.revenue.toLocaleString()}</td>
                                        <td className="py-3 px-2 text-right font-bold text-blue-400">₹{p.couponSpend ? p.couponSpend.toLocaleString() : '0'}</td>
                                        <td className="py-3 pl-2 text-center">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); onProductClick(p); }}
                                            className="h-7 w-7 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-600 transition shadow-sm"
                                          >
                                            <Search size={12} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }) : []
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const AnalyticsPage = () => {
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [selectedProduct, setSelectedProduct] = useState<DetailedProductRow | null>(null);
  const [expandedPincode, setExpandedPincode] = useState<string | null>(null);
  const { data, isLoading, isError } = useAdminStats(period);
  const stats = data?.stats;
  const perSeller = data?.perSellerBreakdown ?? [];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 font-sans text-gray-200 selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto">
        {selectedProduct && (
          <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
        {/* Header styling like the mockup */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Platform Analytics</h1>
            <p className="text-gray-400 mt-1 font-medium text-sm">Monitor platform metrics, global orders, and sellers</p>
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
          <StatsSection 
            stats={stats} 
            onProductClick={(p) => {
              // In the summaries, they are ProductRow. We need to find the full data from allProductsBreakdown if possible.
              const fullData = stats.allProductsBreakdown?.find((ap) => ap.id === p.id);
              setSelectedProduct(fullData || (p as any));
            }}
            expandedPincode={expandedPincode}
            setExpandedPincode={setExpandedPincode}
          />
        )}

        {/* Per-seller breakdown styling mimicking Transaction table */}
        {perSeller.length > 0 && (
          <div className="mt-8 rounded-2xl bg-[#111827] shadow-lg border border-gray-800 p-6 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-white">Sellers Transaction & Performance</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" placeholder="Search Seller" className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-900 text-white placeholder-gray-500 transition shadow-sm w-[200px]" />
                </div>
                <div className="flex items-center bg-[#111827] border border-gray-800 rounded-full px-3 py-2 text-sm font-medium text-gray-300 shadow-sm gap-2">
                  <span className="text-gray-500">Sort by:</span> Orders <ChevronDown size={14} className="text-gray-500" />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap">Seller Name</th>
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap text-center">Orders</th>
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap text-center">Delivered</th>
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap text-center">Cancelled</th>
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap text-center">Score</th>
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap text-right">Revenue</th>
                    <th className="py-4 px-2 font-semibold text-gray-500 whitespace-nowrap text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {perSeller.map((s: SellerBreakdownRow) => {
                    // compute a naive "score" pill
                    let statusColor = "bg-green-900/40 text-green-400";
                    let statusText = "Excellent";
                    if (s.totalCancelled > s.totalDelivered && s.totalOrders > 0) {
                      statusColor = "bg-red-900/40 text-red-400";
                      statusText = "Critical";
                    } else if (s.totalOrders === 0) {
                      statusColor = "bg-gray-800 text-gray-400";
                      statusText = "Inactive";
                    } else if (s.totalDelivered < s.totalOrders * 0.5) {
                      statusColor = "bg-orange-900/40 text-orange-400";
                      statusText = "Average";
                    }

                    return (
                      <tr key={s.sellerId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition group">
                        <td className="py-4 px-2">
                          <p className="font-bold text-gray-200">{s.name}</p>
                          <p className="text-xs font-medium text-gray-500">{s.email}</p>
                        </td>
                        <td className="py-4 px-2 text-center font-semibold">{s.totalOrders}</td>
                        <td className="py-4 px-2 text-center font-bold text-gray-400">{s.totalDelivered}</td>
                        <td className="py-4 px-2 text-center font-bold text-gray-400">{s.totalCancelled}</td>
                        <td className="py-4 px-2 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right font-bold text-gray-200">
                          ₹{s.totalRevenue.toLocaleString()}
                        </td>
                        <td className="py-4 px-2 text-center">
                          <Link
                            href={`/dashboard/sellers/${s.sellerId}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-colors shadow-sm"
                            title="View Dashboard"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
