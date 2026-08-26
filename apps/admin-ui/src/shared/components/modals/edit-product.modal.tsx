"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, Plus, Loader2, AlertTriangle, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CoustomCuttingType, CoustomPices, CustomSizes } from "@repo/ui";
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

// The shared CoustomCuttingType component hard-codes its field-array name to
// "cuttingType" (singular) — remapped to the "cuttingTypes" payload key on submit.
type EditProductFormValues = UpdateProductPayload & {
  cuttingType?: Array<{ value: string }>;
};

// Stored images carry either the ImageKit spelling (file_url/fileId) or the
// normalised one, depending on when they were uploaded. The save payload only
// accepts the latter, so collapse them on the way into local state rather than
// carrying both shapes through the form.
const toPayloadImages = (images: AdminProduct["images"] = []) =>
  images.map((img) => ({
    url: img.url || img.file_url || "",
    file_id: img.file_id || img.fileId || "",
  }));

const MAX_IMAGES = 5;

const fieldClass =
  "w-full rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1.5";

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-gray-700/70 bg-gray-900/40 p-4 md:p-5">
    <header className="mb-4">
      <h4 className="text-sm font-semibold text-gray-100">{title}</h4>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </header>
    {children}
  </section>
);

const buildDefaults = (product: AdminProduct): EditProductFormValues => ({
  productId: product.id,
  title: product.title,
  slug: product.slug,
  category: product.category,
  subCategory: product.subCategory || "",
  short_description: product.short_description || "",
  tags: product.tags?.join(", ") || "",
  status: product.status === "NonActive" ? "NonActive" : "Active",
  origin: product.origin || "",
  source: product.source || "",
  shelfLife: product.shelfLife || "",
  storageInstructions: product.storageInstructions || "",
  cookingTips: product.cookingTips?.join("\n") || "",
  highlightDescription: product.highlightDescription || "",
  nutritionProtein: product.nutritionProtein || "",
  nutritionOmega3: product.nutritionOmega3 || "",
  nutritionCalories: product.nutritionCalories || "",
  processingWeightLoss: product.processingWeightLoss || "",
  sizes: product.sizes?.map((value) => ({ value })) || [],
  cuttingType: product.cuttingTypes?.map((value) => ({ value })) || [],
  pieceSizes: product.pieceSizes?.map((value) => ({ value })) || [],
  trackStockPerSize: product.trackStockPerSize || false,
});

const EditProductModal = ({
  product,
  isSaving,
  onClose,
  onSave,
}: EditProductModalProps) => {
  const [images, setImages] = useState(() => toPayloadImages(product.images));
  const [isUploading, setIsUploading] = useState(false);
  const [imagePendingRemoval, setImagePendingRemoval] = useState<number | null>(null);

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } =
    useForm<EditProductFormValues>({ defaultValues: buildDefaults(product) });

  useEffect(() => {
    reset(buildDefaults(product));
    setImages(toPayloadImages(product.images));
    setImagePendingRemoval(null);
  }, [product, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images allowed`);
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
      // Without this, re-picking the same file after a failed upload is a no-op.
      e.target.value = "";
    }
  };

  // Detaches the image from the product; the Cloudinary asset itself is left
  // alone. An orphaned asset costs storage, a destroyed one that a cancelled
  // edit still points at costs a broken product page.
  const confirmRemoveImage = () => {
    if (imagePendingRemoval === null) return;
    setImages((prev) => prev.filter((_, i) => i !== imagePendingRemoval));
    setImagePendingRemoval(null);
  };

  const selectedCategory = watch("category");
  const watchedSizes = watch("sizes");
  const { data: categoryConfig } = useAdminCategories();
  const categories = categoryConfig?.categories || [];
  const subCategories = categoryConfig?.subCategories || {};

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subCategories[getCategoryConfigKey(selectedCategory)] || [];
  }, [selectedCategory, subCategories]);

  const hasSizes = (watchedSizes?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-700 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Update Product</h3>
            <p className="text-sm text-gray-400">
              Edit the catalog record without leaving the product list.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 transition hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(({ cuttingType, ...values }) =>
            onSave({ ...values, cuttingTypes: cuttingType, images }),
          )}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <input type="hidden" {...register("productId")} />

            <Section title="Basics">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Title</label>
                  <input {...register("title", { required: true })} className={fieldClass} />
                </div>

                <div>
                  <label className={labelClass}>Slug</label>
                  <input {...register("slug", { required: true })} className={fieldClass} />
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <select {...register("category", { required: true })} className={fieldClass}>
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

                <div>
                  <label className={labelClass}>Subcategory</label>
                  <select {...register("subCategory")} className={fieldClass}>
                    <option value="" className="bg-slate-950">
                      Select subcategory
                    </option>
                    {availableSubCategories.map((subCategory) => (
                      <option key={subCategory} value={subCategory} className="bg-slate-950">
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select {...register("status")} className={fieldClass}>
                    <option value="Active" className="bg-slate-950">
                      Active
                    </option>
                    <option value="NonActive" className="bg-slate-950">
                      Not active
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Processing weight loss</label>
                  <input
                    placeholder="e.g., 25%"
                    {...register("processingWeightLoss")}
                    className={fieldClass}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Shown to the customer next to the cutting options.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Short Description</label>
                  <textarea rows={3} {...register("short_description")} className={fieldClass} />
                </div>
              </div>
            </Section>

            <Section
              title="Merchandising"
              hint="Best Seller, New Arrival, Trending and Limited Stock are applied automatically."
            >
              <label className={labelClass}>Tags</label>
              <input {...register("tags")} className={fieldClass} />
              <MarketingBadgeSelector
                value={watch("tags") as string}
                onChange={(next) => setValue("tags", next)}
              />
              <p className="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                Seller pricing, stock, coupons, and availability are managed from the
                seller dashboard after a seller adds this catalog product to their shop.
              </p>
            </Section>

            <Section
              title="Variants"
              hint="Sizes, cutting types and piece sizes the customer picks between."
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <CustomSizes control={control} errors={errors} />
                <CoustomCuttingType control={control} errors={errors} />
                <CoustomPices control={control} errors={errors} />
              </div>

              {hasSizes && (
                <label className="mt-4 flex items-start gap-2 border-t border-gray-700/70 pt-4 text-sm text-gray-300">
                  <input type="checkbox" {...register("trackStockPerSize")} className="mt-0.5 h-4 w-4" />
                  <span>
                    Sold by exact weight (track stock per size)
                    <span className="mt-0.5 block text-xs text-gray-500">
                      Sellers will enter stock for each size separately — e.g. they may
                      have 1kg on hand but not 1.1kg.
                    </span>
                  </span>
                </label>
              )}
            </Section>

            <Section title="Images" hint={`Up to ${MAX_IMAGES}. The first one is the card image.`}>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((img, idx) => (
                  <div
                    key={img.file_id || idx}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
                  >
                    <Image src={img.url} alt={`Product ${idx + 1}`} fill className="object-cover" />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove image ${idx + 1}`}
                      onClick={() => setImagePendingRemoval(idx)}
                      className="absolute right-1 top-1 flex items-center justify-center rounded bg-red-500/90 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 transition hover:border-gray-500 hover:bg-gray-700/30">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                    ) : (
                      <>
                        <Plus className="text-gray-400" size={24} />
                        <span className="mt-1 text-[10px] uppercase text-gray-500">Add</span>
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
              {images.length === 0 && (
                <p className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                  <ImageIcon size={14} /> This product has no image — the storefront will
                  show a placeholder.
                </p>
              )}
            </Section>

            <Section title="Product Detail Page Content">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Origin</label>
                  <input {...register("origin")} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Source</label>
                  <input
                    placeholder="e.g., Freshwater, Saltwater, Farmed"
                    {...register("source")}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Shelf Life</label>
                  <input placeholder="e.g., 1-2 Days" {...register("shelfLife")} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Storage Instructions</label>
                  <input
                    placeholder="e.g., Keep refrigerated (0-4°C)"
                    {...register("storageInstructions")}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>Cooking Tips (one per line)</label>
                <textarea rows={3} {...register("cookingTips")} className={fieldClass} />
              </div>

              <div className="mt-4">
                <label className={labelClass}>&quot;What makes it great?&quot; description</label>
                <textarea rows={3} {...register("highlightDescription")} className={fieldClass} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Protein (per 100g)</label>
                  <input placeholder="e.g., 18g" {...register("nutritionProtein")} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Omega 3 (per 100g)</label>
                  <input placeholder="e.g., 1.2g" {...register("nutritionOmega3")} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Calories (per 100g)</label>
                  <input
                    placeholder="e.g., 120 kcal"
                    {...register("nutritionCalories")}
                    className={fieldClass}
                  />
                </div>
              </div>
            </Section>
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-700 bg-gray-800/95 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </footer>
        </form>
      </div>

      {imagePendingRemoval !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">Remove this image?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  It comes off the product as soon as you save, on the storefront and in
                  every store already selling it. Upload a replacement before saving if
                  this is the only image.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImagePendingRemoval(null)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition hover:bg-gray-600"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmRemoveImage}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Remove image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductModal;
