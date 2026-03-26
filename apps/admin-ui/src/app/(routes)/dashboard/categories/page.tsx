"use client";

import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, UploadCloud, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Input } from "@repo/ui";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  adminQueryKeys,
  createAdminCategory,
  createAdminSubCategory,
  getCategoryConfigKey,
  useAdminCategories,
} from "@/hooks/useAdminQueries";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

type CategoryFormValues = {
  name: string;
};

type SubCategoryFormValues = {
  category: string;
  name: string;
};

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminCategories();
  const categories = data?.categories || [];
  const subCategories = data?.subCategories || {};
  const categoryImages = data?.categoryImages || {};

  /* ── Image upload state ─────────────────────────── */
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const base64 = await convertToBase64(file);
      const res = await axiosInstance.post(
        "/product/api/admin/upload-cloudinary-image",
        { images: [base64], folder: "categriy" },
        isProtected,
      );
      setUploadedImageUrl(res.data.images[0].file_url);
    } catch {
      toast.error("Image upload failed");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Forms ──────────────────────────────────────── */
  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    watch: watchCategory,
    reset: resetCategory,
  } = useForm<CategoryFormValues>({ defaultValues: { name: "" } });

  const {
    register: registerSubCategory,
    handleSubmit: handleSubCategorySubmit,
    reset: resetSubCategory,
  } = useForm<SubCategoryFormValues>({ defaultValues: { category: "", name: "" } });

  const refreshCategories = () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });

  const previewName = watchCategory("name");

  const createCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      createAdminCategory(values.name, uploadedImageUrl ?? undefined),
    onSuccess: () => {
      toast.success("Category created");
      resetCategory();
      clearImage();
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create category");
    },
  });

  const createSubCategoryMutation = useMutation({
    mutationFn: (values: SubCategoryFormValues) =>
      createAdminSubCategory(values.category, values.name),
    onSuccess: () => {
      toast.success("Subcategory created");
      resetSubCategory();
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create subcategory");
    },
  });

  return (
    <DashboardPageShell
      title="Categories"
      breadcrumbTitle="Category Manager"
      description="Manage the catalog categories and subcategories used in admin product forms."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px,1fr]">
        {/* ── Left panel ── */}
        <div className="space-y-6">
          {/* Add Category */}
          <div className="rounded-xl bg-gray-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Add Category</h3>
            <form
              className="space-y-4"
              onSubmit={handleCategorySubmit((values) =>
                createCategoryMutation.mutate(values),
              )}
            >
              <Input
                label="Category Name"
                placeholder="e.g. Curry Cuts"
                {...registerCategory("name", { required: true })}
              />

              {/* Image upload */}
              <div>
                <label className="mb-1 block text-sm text-gray-300">
                  Category Image
                </label>
                {!imagePreview ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-6 transition hover:border-blue-500 hover:bg-gray-800">
                    <UploadCloud size={28} className="text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload image</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                ) : (
                  <div className="relative flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-600 bg-gray-900 flex-shrink-0">
                      {uploading ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <Image
                          src={imagePreview}
                          alt="category preview"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {uploading ? "Uploading..." : "Image ready"}
                      </p>
                      <p className="text-xs text-gray-400">Will appear as circular icon</p>
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Live preview */}
              {(previewName || imagePreview) && (
                <div>
                  <p className="mb-2 text-xs text-gray-400">Preview (how it looks in storefront)</p>
                  <div className="flex justify-center rounded-xl bg-[#fce8ee] py-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-200 shadow-md">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-300">
                            <UploadCloud size={28} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <span className="text-center text-sm font-medium text-gray-800">
                        {previewName || "Category Name"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={createCategoryMutation.isPending || uploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>

          {/* Add Subcategory */}
          <div className="rounded-xl bg-gray-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Add Subcategory</h3>
            <form
              className="space-y-4"
              onSubmit={handleSubCategorySubmit((values) =>
                createSubCategoryMutation.mutate(values),
              )}
            >
              <div>
                <label className="mb-1 block text-sm text-gray-300">Category</label>
                <select
                  {...registerSubCategory("category", { required: true })}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                >
                  <option value="" className="bg-slate-950">
                    Select category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-950">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Subcategory Name"
                placeholder="e.g. Boneless & Mince"
                {...registerSubCategory("name", { required: true })}
              />
              <button
                type="submit"
                disabled={createSubCategoryMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {createSubCategoryMutation.isPending ? "Creating..." : "Create Subcategory"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right panel — category tree ── */}
        <div className="rounded-xl bg-gray-900 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Current Category Tree</h3>
          {isLoading ? (
            <p className="text-gray-400">Loading categories...</p>
          ) : (
            <>
              {/* Storefront-style preview row */}
              {categories.length > 0 && (
                <div className="mb-6 rounded-xl bg-[#fce8ee] px-4 py-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#b05070]">
                    Storefront preview
                  </p>
                  <div className="flex flex-wrap gap-6">
                    {categories.map((cat) => (
                      <div key={cat} className="flex flex-col items-center gap-2">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-200 shadow">
                          {categoryImages[cat] ? (
                            <Image
                              src={categoryImages[cat]}
                              alt={cat}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-300 text-xs text-gray-500">
                              No img
                            </div>
                          )}
                        </div>
                        <span className="max-w-[80px] text-center text-xs font-medium text-gray-800">
                          {cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tree list */}
              <div className="space-y-5">
                {categories.map((category) => {
                  const items = subCategories[getCategoryConfigKey(category)] || [];
                  return (
                    <div
                      key={category}
                      className="rounded-lg border border-gray-800 bg-slate-950/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        {categoryImages[category] && (
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-gray-700">
                            <Image
                              src={categoryImages[category]}
                              alt={category}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 items-center justify-between">
                          <h4 className="text-base font-semibold text-white">{category}</h4>
                          <span className="text-xs text-slate-400">
                            {items.length} subcategories
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {items.length === 0 && (
                          <p className="text-sm text-slate-400">No subcategories added yet.</p>
                        )}
                        {items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
};

export default CategoriesPage;
