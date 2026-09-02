"use client";

import React, { useRef, useState } from "react";
import { X, UploadCloud, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input, Button } from "@repo/ui";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import type { UpdateCategoryPayload, UpdateSubCategoryPayload } from "@/hooks/useAdminQueries";

export type CategoryEditTarget = {
  category: string;
  subCategory?: string;
  imageUrl?: string;
  isActive: boolean;
};

type EditCategoryModalProps = {
  target: CategoryEditTarget;
  isSaving?: boolean;
  onClose: () => void;
  onSaveCategory: (values: UpdateCategoryPayload) => void;
  onSaveSubCategory: (values: UpdateSubCategoryPayload) => void;
};

type FormValues = {
  name: string;
  isActive: boolean;
};

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

const EditCategoryModal = ({
  target,
  isSaving,
  onClose,
  onSaveCategory,
  onSaveSubCategory,
}: EditCategoryModalProps) => {
  const isSubCategory = Boolean(target.subCategory);
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      name: target.subCategory ?? target.category,
      isActive: target.isActive,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    target.imageUrl || null,
  );
  const [imageUrl, setImageUrl] = useState<string | null>(target.imageUrl || null);
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
      const uploadedUrl = res.data.images[0].file_url;
      setImageUrl(uploadedUrl);
      // Swap the local object-URL preview for the hosted one — the blob URL is
      // revoked when this component unmounts, so leaving it would blank the
      // thumbnail if the modal is reopened.
      setImagePreview(uploadedUrl);
    } catch {
      toast.error("Image upload failed");
      setImagePreview(target.imageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = handleSubmit((values) => {
    if (uploading) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }
    const trimmedName = values.name.trim();
    if (isSubCategory) {
      onSaveSubCategory({
        category: target.category,
        name: target.subCategory!,
        newName: trimmedName !== target.subCategory ? trimmedName : undefined,
        isActive: values.isActive,
      });
    } else {
      onSaveCategory({
        name: target.category,
        newName: trimmedName !== target.category ? trimmedName : undefined,
        imageUrl: imageUrl ?? undefined,
        isActive: values.isActive,
      });
    }
  });

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/70 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">
            {isSubCategory ? "Edit Subcategory" : "Edit Category"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <Input
            label={isSubCategory ? "Subcategory Name" : "Category Name"}
            {...register("name", { required: true })}
          />

          {!isSubCategory && (
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
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" {...register("isActive")} className="h-4 w-4" />
            Active — visible on the storefront
          </label>
          {!watch("isActive") && (
            <p className="text-xs text-amber-400">
              Inactive {isSubCategory ? "subcategories" : "categories"} are hidden
              from customers but keep their existing products.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSaving || uploading}
              isLoading={isSaving}
              loaderLabel="Saving..."
              variant="blue"
              fullWidth={false}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
