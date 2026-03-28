"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Store, Eye, CheckCircle2, XCircle } from "lucide-react";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import { useAdminSellers, type AdminSellerSummary } from "@/hooks/useAdminQueries";

const SellerPaymentsList = () => {
  const [search, setSearch] = useState("");
  const { data: sellers = [], isLoading } = useAdminSellers();

  const filtered = sellers.filter((s: AdminSellerSummary) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.store?.name?.toLowerCase().includes(q) ||
      s.store?.city?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardPageShell
      title="Payment History"
      breadcrumbTitle="Payments"
      description="Select a seller to view their detailed payment history."
      search={{ value: search, onChange: setSearch, placeholder: "Search sellers..." }}
    >
      {isLoading ? (
        <p className="text-center text-white py-8">Loading sellers...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No sellers found.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-900 rounded-xl">
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 text-left">Seller</th>
                <th className="p-4 text-left">Store</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4 text-left">Products</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((seller: AdminSellerSummary) => (
                <tr key={seller.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{seller.name}</p>
                      <p className="text-gray-400 text-xs">{seller.email}</p>
                      {seller.phone_number && (
                        <p className="text-gray-500 text-[10px]">{seller.phone_number}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {seller.store ? (
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-teal-400 shrink-0" />
                        <span className="text-white text-xs">{seller.store.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs italic">No store</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {seller.store?.city || "—"}
                  </td>
                  <td className="p-4 text-gray-300 text-xs">
                    {seller.totalProducts ?? 0} products
                  </td>
                  <td className="p-4">
                    {seller.isApprovedByAdmin ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                        <XCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/payments/${seller.id}`}
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition font-medium"
                    >
                      <Eye size={14} />
                      View Payments
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPageShell>
  );
};

export default SellerPaymentsList;
