"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import DeleteDiscountCodeModal from "@/shared/components/modals/delete.discount-codes";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  adminQueryKeys,
  deleteDiscountCode,
  type DiscountCode,
  useDiscountCodes,
} from "@/hooks/useAdminQueries";

const Page = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useDiscountCodes();

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: deleteDiscountCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.discounts });
      setShowDeleteModal(false);
    },
  });

  return (
    <DashboardPageShell
      title="Discount Codes"
      breadcrumbTitle="All Seller Coupons"
      description="Sellers create coupons for their own shop products. Admin can review every coupon and remove any code when needed."
    >
      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Seller Coupon Codes</h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Created By</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((discount) => (
                <tr
                  key={discount.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount.public_name}</td>
                  <td className="p-3 capitalize">
                    {discount.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Flat (₹)"}
                  </td>
                  <td className="p-3">
                    {discount.discountType === "percentage"
                      ? `${discount.discountValue}%`
                      : `₹${discount.discountValue}`}
                  </td>
                  <td className="p-3">{discount.discountCode}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{discount.seller?.name || "Unknown seller"}</span>
                      <span className="text-xs text-gray-400">
                        {discount.seller?.email || "No email"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setSelectedDiscount(discount);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && discountCodes.length === 0 && (
          <p className="text-gray-400 w-full pt-4 block text-center">
            No seller coupons available yet.
          </p>
        )}
      </div>

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount.id)}
        />
      )}
    </DashboardPageShell>
  );
};

export default Page;
