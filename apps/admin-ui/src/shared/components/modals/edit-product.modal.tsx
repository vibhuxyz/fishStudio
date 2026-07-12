"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { MarketingBadgeSelector } from "@/shared/components/marketing-badge-selector";
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
  const [images, setImages] = useState(product.images || []);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm<UpdateProductPayload>({
    defaultValues: {
      productId: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      subCategory: product.subCategory || "",
      short_description: product.short_description || "",
      tags: product.tags?.join(", ") || "",
      origin: product.origin || "",
      source: product.source || "",
      shelfLife: product.shelfLife || "",
      storageInstructions: product.storageInstructions || "",
      cookingTips: product.cookingTips?.join("\n") || "",
      highlightDescription: product.highlightDescription || "",
      nutritionProtein: product.nutritionProtein || "",
      nutritionOmega3: product.nutritionOmega3 || "",
      nutritionCalories: product.nutritionCalories || "",
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
      tags: product.tags?.join(", ") || "",
      origin: product.origin || "",
      source: product.source || "",
      shelfLife: product.shelfLife || "",
      storageInstructions: product.storageInstructions || "",
      cookingTips: product.cookingTips?.join("\n") || "",
      highlightDescription: product.highlightDescription || "",
      nutritionProtein: product.nutritionProtein || "",
      nutritionOmega3: product.nutritionOmega3 || "",
      nutritionCalories: product.nutritionCalories || "",
    });
    setImages(product.images || []);
  }, [product, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Single file check
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const res = await axiosInstance.post(
          "/product/api/admin/upload-cloudinary-image",
          {
            images: [base64],
            folder: "products",
            productTitle: product.title,
          },
          isProtected
        );

        if (res.data.success && res.data.images?.[0]) {
          const newImg = {
            url: res.data.images[0].file_url,
            file_id: res.data.images[0].fileId,
          };
          setImages((prev) => [...prev, newImg]);
        }
      }
      toast.success("Images uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
            <MarketingBadgeSelector
              value={watch("tags") as string}
              onChange={(next) => setValue("tags", next)}
            />
          </div>

          <div className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            Seller pricing, stock, coupons, and availability are managed from
            the seller dashboard after a seller adds this catalog product to
            their shop.
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm text-gray-300">Product Images (Max 5)</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-gray-900 border border-gray-700 group">
                  <Image
                    src={img.url}
                    alt={`Product ${idx}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 rounded flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="relative aspect-square rounded-md border-2 border-dashed border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-700/30 transition">
                  {isUploading ? (
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  ) : (
                    <>
                      <Plus className="text-gray-400" size={24} />
                      <span className="text-[10px] text-gray-500 mt-1 uppercase">Add</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
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

          <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-gray-200 mb-3">
              Product Detail Page Content
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Origin</label>
                <input
                  {...register("origin")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Source</label>
                <input
                  placeholder="e.g., Freshwater, Saltwater, Farmed"
                  {...register("source")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Shelf Life</label>
                <input
                  placeholder="e.g., 1-2 Days"
                  {...register("shelfLife")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Storage Instructions
                </label>
                <input
                  placeholder="e.g., Keep refrigerated (0-4°C)"
                  {...register("storageInstructions")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm text-gray-300 mb-1">
                Cooking Tips (one per line)
              </label>
              <textarea
                rows={3}
                {...register("cookingTips")}
                className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm text-gray-300 mb-1">
                &quot;What makes it great?&quot; description
              </label>
              <textarea
                rows={3}
                {...register("highlightDescription")}
                className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Protein (per 100g)
                </label>
                <input
                  placeholder="e.g., 18g"
                  {...register("nutritionProtein")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Omega 3 (per 100g)
                </label>
                <input
                  placeholder="e.g., 1.2g"
                  {...register("nutritionOmega3")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Calories (per 100g)
                </label>
                <input
                  placeholder="e.g., 120 kcal"
                  {...register("nutritionCalories")}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>
            </div>
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
              disabled={isSaving || isUploading}
              onClick={handleSubmit((values) => onSave({ ...values, images }))}
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
