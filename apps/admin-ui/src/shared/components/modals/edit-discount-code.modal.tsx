"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Input, Button } from "@repo/ui";
import type { DiscountCode, UpdateDiscountCodePayload } from "@/hooks/useAdminQueries";

interface EditFormValues {
  public_name: string;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: string;
  maxDiscountAmount: string;
  minOrderValue: string;
  expiresAt: string;
  maxUses: string;
  maxUsesPerUser: string;
  isFirstOrder: boolean;
}

/** `2026-08-31T00:00:00.000Z` -> `2026-08-31`, which is what <input type="date"> wants. */
const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

type Props = {
  discount: DiscountCode;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateDiscountCodePayload) => void;
};

const EditDiscountCodeModal = ({ discount, isSaving, onClose, onSave }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditFormValues>({
    mode: "onChange",
    defaultValues: {
      public_name: discount.public_name,
      discountType: (discount.discountType as EditFormValues["discountType"]) ?? "percentage",
      discountValue: String(discount.discountValue ?? ""),
      maxDiscountAmount: discount.maxDiscountAmount != null ? String(discount.maxDiscountAmount) : "",
      // `?? ""` not `|| ""` — a real 0 minimum must survive the round trip.
      minOrderValue: discount.minOrderValue != null ? String(discount.minOrderValue) : "",
      expiresAt: toDateInput(discount.expiresAt),
      maxUses: discount.maxUses != null ? String(discount.maxUses) : "",
      maxUsesPerUser: discount.maxUsesPerUser != null ? String(discount.maxUsesPerUser) : "1",
      isFirstOrder: discount.isFirstOrder ?? false,
    },
  });

  const watchedType = watch("discountType");
  const watchedIsFirstOrder = watch("isFirstOrder");

  const onSubmit = handleSubmit((data) => {
    onSave({
      public_name: data.public_name,
      discountType: data.discountType,
      discountValue: data.discountType === "free_delivery" ? 0 : Number(data.discountValue),
      // A cap is only meaningful on a percentage coupon; switching away from
      // percentage clears it rather than leaving a value that does nothing.
      maxDiscountAmount:
        data.discountType === "percentage" && data.maxDiscountAmount
          ? Number(data.maxDiscountAmount)
          : null,
      minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : 0,
      // Sent as an offset-bearing ISO string: updateCouponSchema requires one,
      // and a bare date would be read as UTC midnight — a day early in IST.
      expiresAt: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59+05:30`).toISOString() : null,
      // A first-order coupon is bounded by the customer's order history, so
      // its own limits are fixed: once per user, no global ceiling. Same rule
      // the create form and the server both apply.
      maxUses: data.isFirstOrder ? null : data.maxUses ? Number(data.maxUses) : null,
      maxUsesPerUser: data.isFirstOrder ? 1 : data.maxUsesPerUser ? Number(data.maxUsesPerUser) : 1,
      isFirstOrder: data.isFirstOrder,
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-gray-800 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-700 bg-gray-800 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Edit Discount Code</h3>
            <p className="text-xs text-gray-400">
              {discount.seller?.name ? `${discount.seller.name} · ` : ""}
              <span className="font-mono">{discount.discountCode}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <Input
            label="Title"
            placeholder="e.g. Monsoon Special"
            {...register("public_name", { required: "Title is required" })}
          />
          {errors.public_name && (
            <p className="text-xs text-red-400">{errors.public_name.message}</p>
          )}

          <div>
            <label htmlFor="discountType" className="mb-1 block text-sm text-gray-300">
              Discount type
            </label>
            <select
              id="discountType"
              {...register("discountType")}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Flat (₹)</option>
              <option value="free_delivery">Free Delivery</option>
            </select>
          </div>

          {/* Free delivery has no rupee or percent value to set. */}
          {watchedType !== "free_delivery" && (
            <Input
              label={watchedType === "percentage" ? "Discount value (%)" : "Discount value (₹)"}
              type="number"
              min={0}
              {...register("discountValue", {
                required: "Value is required",
                validate: (v) =>
                  Number(v) > 0 ? true : "Value must be greater than 0",
              })}
            />
          )}
          {errors.discountValue && (
            <p className="text-xs text-red-400">{errors.discountValue.message}</p>
          )}

          {watchedType === "percentage" && (
            <Input
              label="Maximum discount (₹) — optional"
              type="number"
              min={0}
              placeholder="No cap"
              {...register("maxDiscountAmount")}
            />
          )}

          <Input
            label="Minimum order value (₹)"
            type="number"
            min={0}
            placeholder="0"
            {...register("minOrderValue")}
          />

          {/* Raw input: the shared Input component only supports text-like and
              number types, not date. */}
          <div>
            <label htmlFor="expiresAt" className="mb-1 block text-sm text-gray-300">
              Expires on — blank never expires
            </label>
            <input
              id="expiresAt"
              type="date"
              {...register("expiresAt")}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              {...register("isFirstOrder")}
            />
            <span className="text-sm text-gray-300">
              First order only (once per customer, per store)
            </span>
          </label>

          {/* Both limits are decided by the first-order rule, so showing them
              would offer a choice that has no effect. */}
          {!watchedIsFirstOrder && (
            <>
              <Input
                label="Total uses — blank for unlimited"
                type="number"
                min={1}
                placeholder="Unlimited"
                {...register("maxUses")}
              />
              <Input
                label="Uses per customer"
                type="number"
                min={1}
                {...register("maxUsesPerUser", { required: "Per-customer limit is required" })}
              />
            </>
          )}

          <p className="rounded-lg border border-gray-700 bg-gray-900/60 p-3 text-xs text-gray-400">
            The code itself and the store it belongs to cannot be changed — customers may
            already hold this code, and past redemptions are recorded against it. Delete and
            re-create to change either.
            {typeof discount.usedCount === "number" && discount.usedCount > 0 && (
              <> This coupon has already been redeemed {discount.usedCount} time
                {discount.usedCount === 1 ? "" : "s"}.</>
            )}
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              className="!w-auto !rounded-lg !px-4 !py-2 !text-sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="blue"
              className="!w-auto !rounded-lg !px-4 !py-2 !text-sm"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiscountCodeModal;
