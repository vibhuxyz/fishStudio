"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Plus, Trash, X } from "lucide-react";
import { Input, Button } from "@repo/ui";
import DeleteDiscountCodeModal from "@/shared/components/modals/delete.discount-codes";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  adminQueryKeys,
  createDiscountCode,
  deleteDiscountCode,
  type DiscountCode,
  type DiscountCodePayload,
  useAdminSellers,
  useDiscountCodes,
} from "@/hooks/useAdminQueries";

interface CreateFormValues {
  sellerId: string;
  public_name: string;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: string;
  maxDiscountAmount: string;
  discountCode: string;
  minOrderValue: string;
  expiresAt: string;
  maxUses: string;
  maxUsesPerUser: string;
  isFirstOrder: boolean;
}

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useDiscountCodes();
  const { data: sellers = [] } = useAdminSellers();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateFormValues>({
    mode: "onChange",
    defaultValues: {
      sellerId: "",
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      maxDiscountAmount: "",
      discountCode: "",
      minOrderValue: "",
      expiresAt: "",
      maxUses: "",
      maxUsesPerUser: "1",
      isFirstOrder: false,
    },
  });

  const watchedType = watch("discountType");
  const watchedIsFirstOrder = watch("isFirstOrder");

  const createMutation = useMutation({
    mutationFn: (data: CreateFormValues) => {
      const payload: DiscountCodePayload = {
        sellerId: data.sellerId,
        public_name: data.public_name,
        discountType: data.discountType,
        discountValue: data.discountType === "free_delivery" ? 0 : Number(data.discountValue),
        maxDiscountAmount:
          data.discountType === "percentage" && data.maxDiscountAmount
            ? Number(data.maxDiscountAmount)
            : null,
        discountCode: data.discountCode,
        minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : 0,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        // A first-order coupon is capped by the customer's order history, so
        // its own limits are fixed: once per user, and no global ceiling.
        maxUses: data.isFirstOrder ? null : (data.maxUses ? Number(data.maxUses) : null),
        maxUsesPerUser: data.isFirstOrder ? 1 : (data.maxUsesPerUser ? Number(data.maxUsesPerUser) : 1),
        isFirstOrder: data.isFirstOrder,
      };
      return createDiscountCode(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.discounts });
      reset();
      setShowModal(false);
    },
  });

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
      description="Sellers create coupons for their own shop products. Admin can review every coupon, create one on a seller's behalf, or remove any code when needed."
      action={
        <Button
          className="!w-auto !py-2 !px-4 !rounded-lg !text-sm"
          variant="blue"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Discount
        </Button>
      }
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
                <th className="p-3 text-left">Store</th>
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
                      : discount.discountType === "free_delivery"
                        ? "Free Delivery"
                        : "Flat (₹)"}
                  </td>
                  <td className="p-3">
                    {discount.discountType === "percentage"
                      ? `${discount.discountValue}%`
                      : discount.discountType === "free_delivery"
                        ? "—"
                        : `₹${discount.discountValue}`}
                    {discount.discountType === "percentage" && discount.maxDiscountAmount && (
                      <span className="text-gray-500 text-xs"> (max ₹{discount.maxDiscountAmount})</span>
                    )}
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

      {/* ── Create modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 px-6 py-4 sticky top-0 bg-gray-800">
              <h3 className="text-xl text-white font-semibold">Create Discount Code</h3>
              <button
                onClick={() => { setShowModal(false); reset(); }}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit((data) => createMutation.mutate(data))}
              className="px-6 py-4 space-y-4"
            >
              {/* Seller — which store this coupon belongs to */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Seller</label>
                <Controller
                  control={control}
                  name="sellerId"
                  rules={{ required: "Select a seller" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="">Select a seller...</option>
                      {sellers.map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name} ({seller.email})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.sellerId && (
                  <p className="text-red-400 text-xs mt-1">{errors.sellerId.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <Input
                  label="Title (shown to customers)"
                  {...register("public_name", { required: "Title is required" })}
                />
                {errors.public_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.public_name.message}</p>
                )}
              </div>

              {/* First Order Only toggle */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Controller
                  control={control}
                  name="isFirstOrder"
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="isFirstOrder"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-amber-400 cursor-pointer"
                    />
                  )}
                />
                <label htmlFor="isFirstOrder" className="cursor-pointer">
                  <p className="text-amber-300 text-sm font-medium">First Order Only</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Coupon valid only for customers who have never ordered at the selected
                    store. Each user can use it once in their lifetime.
                  </p>
                </label>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="percentage">Percentage (%) off</option>
                      <option value="fixed">Flat Amount (₹) off</option>
                      <option value="free_delivery">Free Delivery</option>
                    </select>
                  )}
                />
              </div>

              {/* Discount Value — hidden for free_delivery */}
              {watchedType !== "free_delivery" && (
                <div>
                  <Input
                    label={watchedType === "percentage" ? "Discount %" : "Discount Amount (₹)"}
                    type="number"
                    min={1}
                    {...register("discountValue", { required: "Value is required" })}
                  />
                  {errors.discountValue && (
                    <p className="text-red-400 text-xs mt-1">{errors.discountValue.message}</p>
                  )}
                </div>
              )}

              {/* Max discount cap — percentage only */}
              {watchedType === "percentage" && (
                <div>
                  <Input
                    label="Max Discount Amount (₹)"
                    type="number"
                    min={1}
                    placeholder="No cap"
                    {...register("maxDiscountAmount")}
                  />
                  <p className="text-gray-500 text-xs mt-0.5">
                    Leave blank for no cap on the discount amount
                  </p>
                </div>
              )}

              {/* Code */}
              <div>
                <Input
                  label="Coupon Code (e.g. WELCOME20)"
                  placeholder="UPPERCASE letters, numbers, underscore"
                  {...register("discountCode", {
                    required: "Code is required",
                    pattern: {
                      value: /^[A-Z0-9_]{3,20}$/i,
                      message: "3–20 chars, letters/numbers/underscore only",
                    },
                  })}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                />
                {errors.discountCode && (
                  <p className="text-red-400 text-xs mt-1">{errors.discountCode.message}</p>
                )}
              </div>

              {/* Min Order */}
              <div>
                <Input
                  label="Minimum Order Value (₹)"
                  type="number"
                  min={0}
                  placeholder="0 = no minimum"
                  {...register("minOrderValue")}
                />
                <p className="text-gray-500 text-xs mt-0.5">Leave 0 for no minimum</p>
              </div>

              {/* Expiry date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Expiry Date <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  {...register("expiresAt")}
                  className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
                />
                <p className="text-gray-500 text-xs mt-0.5">Leave blank = never expires</p>
              </div>

              {/* Usage limits — fixed at once-per-user for a first-order coupon */}
              {!watchedIsFirstOrder && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Total Usage Limit"
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    {...register("maxUses")}
                  />
                  <p className="text-gray-500 text-xs mt-0.5">Blank = unlimited</p>
                </div>
                <div>
                  <Input
                    label="Per-User Limit *"
                    type="number"
                    min={1}
                    {...register("maxUsesPerUser", {
                      required: "Per-user limit is required",
                      min: { value: 1, message: "Must be at least 1" },
                    })}
                  />
                  <p className="text-gray-500 text-xs mt-0.5">How many times one user can use</p>
                  {errors.maxUsesPerUser && (
                    <p className="text-red-400 text-xs mt-1">{errors.maxUsesPerUser.message}</p>
                  )}
                </div>
              </div>
              )}

              <Button
                type="submit"
                disabled={createMutation.isPending || !isValid}
                isLoading={createMutation.isPending}
                loaderLabel="Creating..."
                variant="blue"
                className="w-full !rounded-lg !py-2.5 !font-semibold"
              >
                Create Discount Code
              </Button>
            </form>
          </div>
        </div>
      )}

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
