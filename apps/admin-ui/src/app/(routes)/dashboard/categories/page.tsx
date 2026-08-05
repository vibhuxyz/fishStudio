"use client";

import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, UploadCloud, X, Loader2, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Input, Button } from "@repo/ui";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import DeleteCategoryModal, {
  CategoryDeleteTarget,
} from "@/shared/components/modals/delete.category.modal";
import EditCategoryModal, {
  CategoryEditTarget,
} from "@/shared/components/modals/edit-category.modal";
import {
  adminQueryKeys,
  createAdminCategory,
  createAdminSubCategory,
  deleteAdminCategory,
  deleteAdminSubCategory,
  getCategoryConfigKey,
  updateAdminCategory,
  updateAdminSubCategory,
  useAdminCategories,
  type UpdateCategoryPayload,
  type UpdateSubCategoryPayload,
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
  const categoryStatus = data?.categoryStatus || {};
  const subCategoryStatus = data?.subCategoryStatus || {};

  /* ── Image upload state ─────────────────────────── */
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
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
      setUploadedImageId(res.data.images[0].fileId);
    } catch {
      toast.error("Image upload failed");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const resetImageState = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    setUploadedImageId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drops the asset from Cloudinary as well — the admin is discarding an image
  // that was already pushed there the moment they picked it.
  const deleteImage = async () => {
    if (uploading || removingImage) return;

    if (uploadedImageId) {
      setRemovingImage(true);
      try {
        await axiosInstance.post(
          "/product/api/admin/delete-cloudinary-image",
          { fileId: uploadedImageId },
          isProtected,
        );
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Could not delete the image");
        setRemovingImage(false);
        return;
      }
      setRemovingImage(false);
    }
    resetImageState();
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
      resetImageState();
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

  const [deleteTarget, setDeleteTarget] = useState<CategoryDeleteTarget | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (target: CategoryDeleteTarget) =>
      target.subCategory
        ? deleteAdminSubCategory(target.category, target.subCategory)
        : deleteAdminCategory(target.category),
    onSuccess: (_data, target) => {
      toast.success(target.subCategory ? "Subcategory deleted" : "Category deleted");
      setDeleteTarget(null);
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete");
    },
  });

  const [editTarget, setEditTarget] = useState<CategoryEditTarget | null>(null);

  const updateCategoryMutation = useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => updateAdminCategory(payload),
    onSuccess: () => {
      toast.success("Category updated");
      setEditTarget(null);
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update category");
    },
  });

  const updateSubCategoryMutation = useMutation({
    mutationFn: (payload: UpdateSubCategoryPayload) => updateAdminSubCategory(payload),
    onSuccess: () => {
      toast.success("Subcategory updated");
      setEditTarget(null);
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update subcategory");
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
              onSubmit={handleCategorySubmit((values) => {
                if (uploading) {
                  toast.error("Please wait for the image to finish uploading.");
                  return;
                }
                createCategoryMutation.mutate(values);
              })}
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
                    <div className="group relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-600 bg-gray-900 flex-shrink-0">
                      {uploading || removingImage ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <>
                          <Image
                            src={imagePreview}
                            alt="category preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={deleteImage}
                            title="Delete image"
                            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {uploading
                          ? "Uploading..."
                          : removingImage
                            ? "Removing..."
                            : "Image ready"}
                      </p>
                      <p className="text-xs text-gray-400">Will appear as circular icon</p>
                    </div>
                    {!uploading && !removingImage && (
                      <button
                        type="button"
                        onClick={deleteImage}
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

              <Button
                type="submit"
                disabled={createCategoryMutation.isPending || !previewName}
                isLoading={createCategoryMutation.isPending}
                loaderLabel="Creating..."
                variant="blue"
              >
                <Plus size={18} className="mr-2" />
                Create Category
              </Button>
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
              <Button
                type="submit"
                disabled={createSubCategoryMutation.isPending}
                isLoading={createSubCategoryMutation.isPending}
                loaderLabel="Creating..."
                variant="blue"
              >
                <Plus size={18} className="mr-2" />
                Create Subcategory
              </Button>
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
                  const isActive = categoryStatus[category] ?? true;
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
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-semibold text-white">{category}</h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">
                              {items.length} subcategories
                            </span>
                            <button
                              type="button"
                              title="Edit category"
                              onClick={() =>
                                setEditTarget({
                                  category,
                                  imageUrl: categoryImages[category],
                                  isActive,
                                })
                              }
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              title="Delete category"
                              onClick={() => setDeleteTarget({ category })}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {items.length === 0 && (
                          <p className="text-sm text-slate-400">No subcategories added yet.</p>
                        )}
                        {items.map((item) => {
                          const subIsActive =
                            subCategoryStatus[`${category}::${item}`] ?? true;
                          return (
                            <span
                              key={item}
                              className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200"
                            >
                              {!subIsActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Inactive" />
                              )}
                              {item}
                              <button
                                type="button"
                                title="Edit subcategory"
                                onClick={() =>
                                  setEditTarget({
                                    category,
                                    subCategory: item,
                                    isActive: subIsActive,
                                  })
                                }
                                className="text-slate-500 transition hover:text-blue-400"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                title="Delete subcategory"
                                onClick={() =>
                                  setDeleteTarget({ category, subCategory: item })
                                }
                                className="text-slate-500 transition hover:text-red-400"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteCategoryModal
          target={deleteTarget}
          isLoading={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget)}
        />
      )}

      {editTarget && (
        <EditCategoryModal
          target={editTarget}
          isSaving={updateCategoryMutation.isPending || updateSubCategoryMutation.isPending}
          onClose={() => setEditTarget(null)}
          onSaveCategory={(values) => updateCategoryMutation.mutate(values)}
          onSaveSubCategory={(values) => updateSubCategoryMutation.mutate(values)}
        />
      )}
    </DashboardPageShell>
  );
};

export default CategoriesPage;
