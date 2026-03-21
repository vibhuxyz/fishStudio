"use client";

import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  getCategoryConfigKey,
  useAdminCategories,
  type AdminProduct,
  type UpdateProductPayload,
} from "@/hooks/useAdminQueries";

type EditProductModalProps = {
  product: AdminProduct;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (values: UpdateProductPayload) => void;
};

const EditProductModal = ({
  product,
  isSaving,
  onClose,
  onSave,
}: EditProductModalProps) => {
  const { register, handleSubmit, reset, watch } = useForm<UpdateProductPayload>({
    defaultValues: {
      productId: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      subCategory: product.subCategory || "",
      short_description: product.short_description || "",
      detailed_description: product.detailed_description || "",
      tags: product.tags?.join(", ") || "",
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
      detailed_description: product.detailed_description || "",
      tags: product.tags?.join(", ") || "",
    });
  }, [product, reset]);

  const selectedCategory = watch("category");
  const { data: categoryConfig } = useAdminCategories();
  const categories = categoryConfig?.categories || [];
  const subCategories = categoryConfig?.subCategories || {};

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subCategories[getCategoryConfigKey(selectedCategory)] || [];
  }, [selectedCategory, subCategories]);

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/70 flex items-center justify-center px-4 py-6">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-full overflow-y-auto p-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <div>
            <h3 className="text-xl text-white">Update Product</h3>
            <p className="text-sm text-gray-400">
              Edit the main product details without leaving the product list.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <form
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit(onSave)}
        >
          <input type="hidden" {...register("productId")} />

          <div>
            <label className="block text-sm text-gray-300 mb-1">Title</label>
            <input
              {...register("title", { required: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Slug</label>
            <input
              {...register("slug", { required: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Category</label>
            <select
              {...register("category", { required: true })}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            >
              <option value="" className="bg-slate-950">
                Select category
              </option>
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-slate-950"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Subcategory</label>
            <select
              {...register("subCategory")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            >
              <option value="" className="bg-slate-950">
                Select subcategory
              </option>
              {availableSubCategories.map((subCategory) => (
                <option
                  key={subCategory}
                  value={subCategory}
                  className="bg-slate-950"
                >
                  {subCategory}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tags</label>
            <input
              {...register("tags")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            Seller pricing, stock, coupons, and availability are managed from
            the seller dashboard after a seller adds this catalog product to
            their shop.
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1">
              Short Description
            </label>
            <textarea
              rows={3}
              {...register("short_description")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={6}
              {...register("detailed_description")}
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition disabled:opacity-60"
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
