"use client";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import DeleteDiscountCodeModal from "@/shared/components/modals/delete.discount-codes";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useRequireAuth from "@/hooks/useRequiredAuth";
import { AxiosError } from "axios";
import { BadgeCheck, BadgeX, Plus, ToggleLeft, ToggleRight, Trash, X } from "lucide-react";
import { Input } from "@repo/ui";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  percentage: "Percentage (%)",
  fixed: "Flat Amount (₹)",
  free_delivery: "Free Delivery",
};

const Page = () => {
  useRequireAuth("coupon");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes", isProtected);
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
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
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        discountValue: data.discountType === "free_delivery" ? 0 : Number(data.discountValue),
        minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : 0,
        maxUses: data.isFirstOrder ? null : (data.maxUses ? Number(data.maxUses) : null),
        maxUsesPerUser: data.isFirstOrder ? 1 : (data.maxUsesPerUser ? Number(data.maxUsesPerUser) : 1),
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        isFirstOrder: data.isFirstOrder,
      };
      await axiosInstance.post("/product/api/create-discount-code", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
      toast.success("Discount code created!");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create discount code");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (discountId: string) => {
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModal(false);
      toast.success("Discount code deleted");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await axiosInstance.patch(`/product/api/toggle-discount-code/${id}`, { isActive });
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      toast.success(isActive ? "Coupon activated" : "Coupon deactivated");
    },
  });

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes.");
      return;
    }
    createMutation.mutate(data);
  };

  const isExpired = (expiresAt: string | null) =>
    expiresAt ? new Date(expiresAt) <= new Date() : false;

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Discount
        </button>
      </div>

      <BreadCrumbs title="Discount Codes" />

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
          <span className="ml-2 text-sm text-gray-400">({discountCodes.length}/8 used)</span>
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Min Order</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Uses</th>
                  <th className="p-3 text-left">Expiry</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((discount: any) => {
                  const expired = isExpired(discount.expiresAt);
                  const usageCount = discount._count?.usages ?? discount.usedCount ?? 0;
                  const maxUses = discount.maxUses;

                  return (
                    <tr
                      key={discount.id}
                      className="border-b border-gray-800 hover:bg-gray-800 transition"
                    >
                      <td className="p-3 font-medium">
                        <div className="flex flex-col gap-1">
                          {discount.public_name}
                          {discount.isFirstOrder && (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full w-fit">
                              First Order Only
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-gray-300">
                        {DISCOUNT_TYPE_LABELS[discount.discountType] ?? discount.discountType}
                      </td>
                      <td className="p-3">
                        {discount.discountType === "percentage"
                          ? `${discount.discountValue}%`
                          : discount.discountType === "free_delivery"
                            ? "Free"
                            : `₹${discount.discountValue}`}
                      </td>
                      <td className="p-3">
                        {discount.minOrderValue > 0 ? `₹${discount.minOrderValue}` : "–"}
                      </td>
                      <td className="p-3">
                        <span className="font-mono bg-gray-700 px-2 py-0.5 rounded text-xs">
                          {discount.discountCode}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">
                        {usageCount}
                        {maxUses ? (
                          <span className="text-gray-500"> / {maxUses}</span>
                        ) : (
                          <span className="text-gray-600"> / ∞</span>
                        )}
                      </td>
                      <td className="p-3">
                        {discount.expiresAt ? (
                          <span className={expired ? "text-red-400" : "text-green-400"}>
                            {new Date(discount.expiresAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {expired && " (expired)"}
                          </span>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </td>
                      <td className="p-3">
                        {discount.isActive && !expired ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <BadgeCheck size={14} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 text-xs">
                            <BadgeX size={14} /> {expired ? "Expired" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {!expired && (
                            <button
                              title={discount.isActive ? "Deactivate" : "Activate"}
                              onClick={() =>
                                toggleMutation.mutate({
                                  id: discount.id,
                                  isActive: !discount.isActive,
                                })
                              }
                              className={`transition ${
                                discount.isActive
                                  ? "text-green-400 hover:text-yellow-400"
                                  : "text-gray-500 hover:text-green-400"
                              }`}
                            >
                              {discount.isActive ? (
                                <ToggleRight size={20} />
                              ) : (
                                <ToggleLeft size={20} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedDiscount(discount);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && discountCodes.length === 0 && (
          <p className="text-gray-400 w-full pt-4 block text-center">
            No discount codes yet. Create your first one!
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

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
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
                    Coupon valid only for customers who have never ordered at your store.
                    Each user can use it once in their lifetime.
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
                      {!watchedIsFirstOrder && (
                        <option value="free_delivery">Free Delivery</option>
                      )}
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

              {/* Usage limits — hidden for first-order coupons (auto-enforced to 1 per user) */}
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
                      label="Per-User Limit"
                      type="number"
                      min={1}
                      defaultValue={1}
                      {...register("maxUsesPerUser")}
                    />
                    <p className="text-gray-500 text-xs mt-0.5">How many times one user can use</p>
                  </div>
                </div>
              )}

              {watchedIsFirstOrder && (
                <p className="text-amber-400/80 text-xs bg-amber-500/10 px-3 py-2 rounded-lg">
                  First-order coupons are automatically limited to 1 use per customer for life.
                </p>
              )}

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {createMutation.isPending ? "Creating…" : "Create Discount Code"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedDiscount.id)}
        />
      )}
    </div>
  );
};

export default Page;
