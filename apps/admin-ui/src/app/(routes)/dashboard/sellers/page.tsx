"use client";

import React from "react";
import Link from "next/link";
import { Eye, Store, TicketPercent, IndianRupee } from "lucide-react";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import { useAdminSellers, useSellerAccessCodes } from "@/hooks/useAdminQueries";
import GiveAccessModal from "./GiveAccessModal";
import GiveSignupAccessModal from "./GiveSignupAccessModal";
import ViewCodeModal from "./ViewCodeModal";

const SellersPage = () => {
  const { data: sellers = [], isLoading } = useAdminSellers();
  const { data: sellerCodes = [], isLoading: isLoadingCodes } = useSellerAccessCodes();
  const [selectedSellerId, setSelectedSellerId] = React.useState<string | null>(null);
  const [viewingCode, setViewingCode] = React.useState<string | null>(null);

  const [isGiveSignupAccessOpen, setIsGiveSignupAccessOpen] = React.useState(false);

  return (
    <DashboardPageShell
      title="Sellers"
      breadcrumbTitle="All Sellers"
      description="Review sellers, their stores, and how much catalog inventory they currently carry."
    >
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsGiveSignupAccessOpen(true)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Generate Signup Access Code
        </button>
      </div>
      <div className="rounded-xl bg-gray-900 p-5">
        {isLoading ? (
          <p className="text-gray-400">Loading sellers...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Seller</th>
                <th className="p-3 text-left">Store</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-left">Coupons</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-b border-gray-800 transition hover:bg-gray-800/40"
                >
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{seller.name}</span>
                      <span className="text-xs text-gray-400">{seller.email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-slate-400" />
                      <div className="flex flex-col">
                        <span>{seller.store?.name || "No store yet"}</span>
                        <span className="text-xs text-gray-400">
                          {seller.store?.city || seller.store?.address || "-"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{seller.totalProducts ?? 0}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <TicketPercent size={16} className="text-slate-400" />
                      <span>{seller.totalCoupons ?? 0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {seller.createdAt
                      ? new Date(seller.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    {seller.isApprovedByAdmin ? (
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/dashboard/sellers/${seller.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-600 transition"
                        >
                          <Eye size={14} />
                          View Profile
                        </Link>
                        <Link
                          href={`/dashboard/sellers/${seller.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600/10 border border-blue-600/20 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-600 hover:text-white transition"
                        >
                          <IndianRupee size={14} />
                          Payments
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSellerId(seller.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700"
                      >
                        Give Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && sellers.length === 0 && (
          <p className="pt-4 text-center text-gray-400">No sellers found.</p>
        )}
      </div>

      <div className="mt-8 rounded-xl bg-gray-900 p-5">
        <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
          <span>Pending Invitations</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-500">{sellerCodes.length}</span>
        </h3>
        {isLoadingCodes ? (
          <p className="text-gray-400">Loading invitations...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Expires At</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellerCodes.map((invite) => (
                <tr
                  key={invite.id}
                  className="border-b border-gray-800 transition hover:bg-gray-800/40"
                >
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{invite.email}</span>
                      <span className="text-xs text-amber-500">Pending Signup</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewingCode(invite.code)}
                      className="inline-flex items-center gap-2 rounded-lg border border-green-600/30 bg-green-600/20 px-3 py-2 text-sm text-green-400 transition hover:bg-green-600/30"
                    >
                      <Eye size={16} />
                      View Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoadingCodes && sellerCodes.length === 0 && (
          <p className="pt-4 text-center text-gray-400">No pending invitations found.</p>
        )}
      </div>

      {selectedSellerId && (
        <GiveAccessModal
          sellerId={selectedSellerId}
          onClose={() => setSelectedSellerId(null)}
        />
      )}

      {isGiveSignupAccessOpen && (
        <GiveSignupAccessModal
          onClose={() => setIsGiveSignupAccessOpen(false)}
        />
      )}

      {viewingCode && (
        <ViewCodeModal
          code={viewingCode}
          onClose={() => setViewingCode(null)}
        />
      )}
    </DashboardPageShell>
  );
};

export default SellersPage;
