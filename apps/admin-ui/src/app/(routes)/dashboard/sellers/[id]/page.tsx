"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, BarChart3, CheckCircle2, IndianRupee, Mail, MapPin, Package, Phone, RefreshCw, ShoppingCart, Store, TicketPercent, TrendingDown, Trophy, Search } from "lucide-react";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import { useAdminSellerDetail, useAdminStats, useUpdateSellerApproval, StatsPeriod, DetailedProductRow } from "@/hooks/useAdminQueries";
import ProductDetailModal from "@/shared/components/analytics/ProductDetailModal";

const PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const PERMISSION_OPTIONS = [
  { id: "product", label: "Manage Products" },
  { id: "coupon", label: "Manage Coupons" },
  { id: "event", label: "Manage Events" },
  { id: "full_access", label: "Full Access" },
];

const SellerDetailPage = () => {
  const params = useParams<{ id: string }>();
  const sellerId = typeof params?.id === "string" ? params.id : "";
  const { data: seller, isLoading } = useAdminSellerDetail(sellerId);
  const updateMutation = useUpdateSellerApproval();

  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>("month");
  const [selectedProduct, setSelectedProduct] = useState<DetailedProductRow | null>(null);
  const { data: statsData, isLoading: isLoadingStats } = useAdminStats(statsPeriod, sellerId);
  const stats = statsData?.stats;

  const handleToggleApproval = () => {
    if (!seller) return;
    updateMutation.mutate({
      sellerId,
      isApprovedByAdmin: !seller.isApprovedByAdmin,
      permissions: seller.permissions || [],
    });
  };

  const handleTogglePermission = (permId: string) => {
    if (!seller) return;
    let newPerms = seller.permissions || [];
    if (newPerms.includes(permId)) {
      newPerms = newPerms.filter((p) => p !== permId);
    } else {
      newPerms = [...newPerms, permId];
    }
    updateMutation.mutate({
      sellerId,
      isApprovedByAdmin: seller.isApprovedByAdmin || false,
      permissions: newPerms,
    });
  };

  return (
    <DashboardPageShell
      title="Seller Details"
      breadcrumbTitle="Seller Details"
      description="Inspect the seller profile, store data, products, coupons, and reviews in one place."
      action={
        <Link
          href="/dashboard/sellers"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          <ArrowLeft size={16} />
          Back To Sellers
        </Link>
      }
    >
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {isLoading ? (
        <div className="rounded-xl bg-gray-900 p-5 text-gray-400">
          Loading seller details...
        </div>
      ) : !seller ? (
        <div className="rounded-xl bg-gray-900 p-5 text-gray-400">
          Seller not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-xl bg-gray-900 p-5">
              <h3 className="mb-4 text-xl font-semibold text-white">{seller.name}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={16} />
                  <span>{seller.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={16} />
                  <span>{seller.phone_number || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Store size={16} />
                  <span>{seller.store?.name || "No store created"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={16} />
                  <span>
                    {seller.store?.city || seller.store?.address || "No address"}
                  </span>
                </div>
              </div>

              {seller.store?.bio && (
                <div className="mt-4 rounded-lg border border-gray-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                  {seller.store.bio}
                </div>
              )}

              {/* Approval & Permissions Actions */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Access Control</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-lg border border-gray-800">
                    <div>
                      <p className="font-medium text-white">Admin Approval Status</p>
                      <p className="text-xs text-slate-400">Determine if this seller can fully access their dashboard.</p>
                    </div>
                    <button
                      onClick={handleToggleApproval}
                      disabled={updateMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${seller.isApprovedByAdmin ? "bg-green-500" : "bg-gray-600"} disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${seller.isApprovedByAdmin ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-lg border border-gray-800">
                    <p className="font-medium text-white mb-3">Feature Permissions</p>
                    <div className="grid grid-cols-2 gap-3">
                      {PERMISSION_OPTIONS.map((opt) => {
                        const isChecked = seller.permissions?.includes(opt.id);
                        return (
                          <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                              checked={isChecked || false}
                              onChange={() => handleTogglePermission(opt.id)}
                              disabled={updateMutation.isPending}
                            />
                            <span className="text-sm text-slate-300">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Products", value: seller.totalProducts ?? 0 },
                { label: "Coupons", value: seller.totalCoupons ?? 0 },
                { label: "Banners", value: seller.totalBanners ?? 0 },
                { label: "Reviews", value: seller.totalReviews ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-900 p-5">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Store Products</h3>
            {seller.store?.products?.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {seller.store.products.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-800 bg-slate-950/50"
                  >
                    <div className="relative h-44 w-full bg-slate-900">
                      <Image
                        src={product.images?.[0]?.url || "/file.svg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h4 className="font-semibold text-white">{product.title}</h4>
                      <p className="text-sm text-slate-400">
                        {product.category} / {product.subCategory}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Stock: {product.stock}</span>
                        <span>Status: {product.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Sale: Rs {product.sale_price}</span>
                        <span>Regular: Rs {product.regular_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">This seller has no store products yet.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl bg-gray-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Seller Coupons</h3>
              {seller.coupons?.length ? (
                <div className="space-y-3">
                  {seller.coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-slate-950/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-white">{coupon.public_name}</p>
                        <p className="text-sm text-slate-400">{coupon.discountCode}</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <TicketPercent size={16} />
                        <span>
                          {coupon.discountValue}
                          {coupon.discountType === "percentage" ? "%" : " Rs"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No seller coupons available.</p>
              )}
            </div>

            <div className="rounded-xl bg-gray-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Store Reviews</h3>
              {seller.store?.storeReviews?.length ? (
                <div className="space-y-3">
                  {seller.store.storeReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-gray-800 bg-slate-950/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">
                          {review.user?.name || "Anonymous user"}
                        </p>
                        <p className="text-sm text-amber-300">
                          Rating: {review.rating}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {review.reviews || "No written review"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No store reviews yet.</p>
              )}
            </div>
          </div>

          {/* ── Seller Analytics Section ── */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <BarChart3 size={20} className="text-blue-400" />
                Seller Analytics
              </h3>
              <div className="inline-flex rounded-lg border border-gray-800 bg-gray-800 p-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setStatsPeriod(p.value)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      statsPeriod === p.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingStats ? (
              <p className="text-sm text-gray-400">Loading analytics...</p>
            ) : !stats ? (
              <p className="text-sm text-gray-400">No order data available for this period.</p>
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, color: "text-green-400", icon: <IndianRupee size={16} className="text-green-400" /> },
                    { label: "Orders", value: stats.totalOrders, color: "text-blue-400", icon: <ShoppingCart size={16} className="text-blue-400" /> },
                    { label: "Delivered", value: stats.totalDelivered, color: "text-emerald-400", icon: <CheckCircle2 size={16} className="text-emerald-400" /> },
                    { label: "Cancelled", value: stats.totalCancelled, color: "text-red-400", icon: <AlertTriangle size={16} className="text-red-400" /> },
                    { label: "Refunded Amount", value: `₹${stats.totalRefundedAmount.toLocaleString()}`, color: "text-orange-400", icon: <IndianRupee size={16} className="text-orange-400" /> },
                    { label: "Coupon Spend", value: `₹${(stats as any).totalCouponSpend?.toLocaleString() || '0'}`, color: "text-blue-400", icon: <TicketPercent size={16} className="text-blue-400" /> },
                  ].map((card) => (
                    <div key={card.label} className="flex items-start gap-3 rounded-lg bg-slate-950/50 border border-gray-800 p-3">
                      <div className="mt-0.5">{card.icon}</div>
                      <div>
                        <p className="text-xs text-gray-400">{card.label}</p>
                        <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pincode Breakdown */}
                {stats.pincodeBreakdown.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <MapPin size={14} className="text-blue-400" />
                      Orders by Pincode
                    </h4>
                    <table className="w-full text-xs text-white">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="py-2 text-left">Pincode</th>
                          <th className="py-2 text-right">Orders</th>
                          <th className="py-2 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.pincodeBreakdown.slice(0, 8).map((row) => (
                          <tr key={row.pincode} className="border-b border-gray-800/50">
                            <td className="py-1.5 text-gray-300">{row.pincode}</td>
                            <td className="py-1.5 text-right">{row.orders}</td>
                            <td className="py-1.5 text-right text-green-400">₹{row.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Hero Products */}
                {stats.heroProducts.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <Trophy size={14} className="text-amber-400" />
                      Hero Products
                    </h4>
                    <div className="space-y-2">
                      {stats.heroProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-slate-950/50 p-2.5">
                          <span className="text-xs font-bold text-amber-400 w-5">#{i + 1}</span>
                          <div className="relative h-8 w-8 shrink-0 rounded overflow-hidden bg-gray-800">
                            {p.image ? (
                              <Image src={p.image} alt={p.title} fill className="object-cover" />
                            ) : (
                              <Package size={14} className="m-auto text-gray-500 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.orders} orders • ₹{p.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Needs Attention */}
                {(stats.needsImprovement.length > 0 || stats.toRemove.length > 0) && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {stats.needsImprovement.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-yellow-400">
                          <TrendingDown size={12} />
                          Needs Improvement
                        </h4>
                        <div className="space-y-1.5">
                          {stats.needsImprovement.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 text-xs text-gray-300 border border-gray-800 rounded-lg p-2 bg-slate-950/50">
                              <span className="truncate">{p.title}</span>
                              <span className="ml-auto text-yellow-400 shrink-0">{p.orders} orders</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {stats.toRemove.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-red-400">
                          <AlertTriangle size={12} />
                          Consider Removing
                        </h4>
                        <div className="space-y-1.5">
                          {stats.toRemove.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 text-xs text-gray-300 border border-gray-800 rounded-lg p-2 bg-slate-950/50">
                              <span className="truncate">{p.title}</span>
                              <span className="ml-auto text-red-400 shrink-0">0 orders</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Granular Product Breakdown List */}
                {stats.allProductsBreakdown && stats.allProductsBreakdown.length > 0 && (
                  <div className="mt-8 border-t border-gray-800 pt-6">
                    <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                      <Package size={16} className="text-blue-400" />
                      Detailed Product Breakdown
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-300">
                        <thead className="bg-slate-950 text-gray-400 border-b border-gray-800">
                          <tr>
                            <th className="py-3 px-3 uppercase text-[10px] font-black tracking-widest">Product</th>
                            <th className="py-3 px-3 text-center uppercase text-[10px] font-black tracking-widest">Quanta</th>
                            <th className="py-3 px-3 text-center uppercase text-[10px] font-black tracking-widest">Comp</th>
                            <th className="py-3 px-3 text-center uppercase text-[10px] font-black tracking-widest">Ref</th>
                            <th className="py-3 px-3 text-right uppercase text-[10px] font-black tracking-widest">Amount (₹)</th>
                            <th className="py-3 px-3 text-right uppercase text-[10px] font-black tracking-widest text-blue-400">Coupon (₹)</th>
                            <th className="py-3 px-3 text-center uppercase text-[10px] font-black tracking-widest">Inspect</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.allProductsBreakdown.map((row) => (
                            <tr key={row.id} className="border-b border-gray-800/50 hover:bg-slate-900/50">
                              <td className="py-2 px-3 font-medium text-white truncate max-w-[200px]" title={row.title}>
                                {row.title}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-gray-100">{row.quantaSale}</td>
                              <td className="py-3 px-3 text-center font-bold text-green-500">{row.deliveredQty}</td>
                              <td className="py-3 px-3 text-center text-red-400 font-bold">{row.refundedQty || 0}</td>
                              <td className="py-3 px-3 text-right font-black text-white">{row.revenue.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-bold text-blue-400">{(row as any).couponSpend?.toLocaleString() || '0'}</td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => setSelectedProduct(row as DetailedProductRow)}
                                  className="h-7 w-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition shadow-sm"
                                >
                                  <Search size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
};

export default SellerDetailPage;
