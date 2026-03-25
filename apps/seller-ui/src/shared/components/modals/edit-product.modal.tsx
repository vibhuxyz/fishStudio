"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

type DiscountCode = {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
};

export type SellerProductFormValues = {
  productId: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  tags: string;
  regular_price: number;
  sale_price: number;
  stock: number;
  cash_on_delivery: "yes" | "no";
  status: "Active" | "NonActive";
  discountCodes: string[];
};

type EditProductModalProps = {
  product: any;
  discountCodes: DiscountCode[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (values: SellerProductFormValues) => void;
};

const EditProductModal = ({
  product,
  discountCodes,
  isSaving,
  onClose,
  onSave,
}: EditProductModalProps) => {
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<SellerProductFormValues>({
      defaultValues: {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        subCategory: product.subCategory || "",
        short_description: product.short_description || "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
        regular_price: Number(product.regular_price || 0),
        sale_price: Number(product.sale_price || 0),
        stock: Number(product.stock || 0),
        cash_on_delivery: product.cashOnDelivery === "no" ? "no" : "yes",
        status: product.status === "NonActive" ? "NonActive" : "Active",
        discountCodes: Array.isArray(product.discount_codes)
          ? product.discount_codes
          : [],
      },
    });

  useEffect(() => {
    reset({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      subCategory: product.subCategory || "",
      short_description: product.short_description || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      regular_price: Number(product.regular_price || 0),
      sale_price: Number(product.sale_price || 0),
      stock: Number(product.stock || 0),
      cash_on_delivery: product.cashOnDelivery === "no" ? "no" : "yes",
      status: product.status === "NonActive" ? "NonActive" : "Active",
      discountCodes: Array.isArray(product.discount_codes)
        ? product.discount_codes
        : [],
    });
  }, [product, reset]);

  const selectedDiscountCodes = watch("discountCodes") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-lg bg-gray-800 p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3">
          <div>
            <h3 className="text-xl text-white">Update Shop Product</h3>
            <p className="text-sm text-gray-400">
              Manage seller pricing, stock, availability, and coupons for this
              shop copy.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <form
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSave)}
        >
          <input type="hidden" {...register("productId")} />

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Title
              <span className="ml-2 text-xs text-gray-500">(read-only)</span>
            </label>
            <input
              {...register("title")}
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-gray-700 bg-gray-900/60 px-3 py-2 text-gray-400 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Slug
              <span className="ml-2 text-xs text-gray-500">(read-only)</span>
            </label>
            <input
              {...register("slug")}
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-gray-700 bg-gray-900/60 px-3 py-2 text-gray-400 outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Category</label>
            <input
              {...register("category", { required: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Subcategory
            </label>
            <input
              {...register("subCategory")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Regular Price
            </label>
            <input
              type="number"
              {...register("regular_price", { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Sale Price</label>
            <input
              type="number"
              {...register("sale_price", { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Stock</label>
            <input
              type="number"
              {...register("stock", { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Status</label>
            <select
              {...register("status")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            >
              <option value="Active" className="bg-slate-950">
                Active – Ready to sell
              </option>
              <option value="NonActive" className="bg-slate-950">
                Non-Active – Coming Soon
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">
              Tags
              <span className="ml-2 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">locked</span>
            </label>
            <input
              value={Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || ""}
              readOnly
              tabIndex={-1}
              className="w-full cursor-default select-none rounded-md border border-gray-800 bg-gray-900/30 px-3 py-2 text-gray-500 outline-none pointer-events-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-gray-300">
              Short Description
              <span className="ml-2 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">locked</span>
            </label>
            <textarea
              rows={3}
              value={product.short_description || ""}
              readOnly
              tabIndex={-1}
              className="w-full cursor-default select-none rounded-md border border-gray-800 bg-gray-900/30 px-3 py-2 text-gray-500 outline-none pointer-events-none resize-none"
            />
          </div>


          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Cash On Delivery
            </label>
            <select
              {...register("cash_on_delivery")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            >
              <option value="yes" className="bg-slate-950">
                Yes
              </option>
              <option value="no" className="bg-slate-950">
                No
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-gray-300">
              Seller Coupons
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-gray-700 bg-slate-950/40 p-3">
              {discountCodes.length === 0 && (
                <p className="text-sm text-gray-400">
                  Create seller coupons first to attach them here.
                </p>
              )}
              {discountCodes.map((discount) => {
                const isSelected = selectedDiscountCodes.includes(discount.id);

                return (
                  <button
                    key={discount.id}
                    type="button"
                    className={`rounded-md border px-3 py-1 text-sm ${
                      isSelected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-gray-900 text-gray-300"
                    }`}
                    onClick={() => {
                      const nextValue = isSelected
                        ? selectedDiscountCodes.filter((id) => id !== discount.id)
                        : [...selectedDiscountCodes, discount.id];
                      setValue("discountCodes", nextValue);
                    }}
                  >
                    {discount.public_name} ({discount.discountValue}
                    {discount.discountType === "percentage" ? "%" : "Rs"})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
