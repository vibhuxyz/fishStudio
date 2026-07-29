import React, { useState } from "react";
import { Trash2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

// Keep a trailing empty slot so there is always somewhere to add the next
// image, and never leave the grid with nothing to click.
const withTrailingSlot = (list: any[]) => {
  const next = [...list];
  if (next.length === 0) next.push(null);
  else if (next[next.length - 1] !== null && next.length < 5) next.push(null);
  return next;
};

const ImagePlaceHolder = ({
  small,
  size,
  index = 0,
  setValue,
  images,
  setImages,
  isUploading = false,
  uploadStatus = "idle",
  autoUpload = false,
  folder = "products",
  productTitle,
}: {
  size: string;
  small?: boolean;
  defaultImage?: string | null;
  index?: number;
  setValue: any;
  images: any;
  setImages: any;
  isUploading?: boolean;
  uploadStatus?: "idle" | "waiting" | "uploading" | "success";
  // Opt-in: push to Cloudinary as soon as a file is picked rather than waiting
  // for the parent form to submit.
  autoUpload?: boolean;
  folder?: string;
  productTitle?: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const slot = images[index];
  const imagePreview = slot?.file_url || slot?.base64 || null;
  const slotUploading = Boolean(slot?.uploading);
  const busy = isUploading || slotUploading || isDeleting;

  const uploadSlot = async (uid: string, base64: string) => {
    try {
      const res = await axiosInstance.post(
        "/product/api/admin/upload-cloudinary-image",
        {
          images: [base64],
          folder,
          ...(productTitle?.trim() ? { productTitle } : {}),
        },
        isProtected,
      );
      const uploaded = res.data?.images?.[0];
      if (!uploaded?.fileId) {
        throw new Error("Upload response did not include an image");
      }
      setImages((current: any[]) =>
        current.map((img: any) =>
          img?.uid === uid
            ? {
                ...img,
                uploading: false,
                file_url: uploaded.file_url,
                fileId: uploaded.fileId,
              }
            : img,
        ),
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Image upload failed. Please pick the file again.",
      );
      // Drop the slot instead of leaving a spinner the admin can't clear.
      setImages((current: any[]) =>
        withTrailingSlot(current.filter((img: any) => img?.uid !== uid)),
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if limit already reached (excluding the current slot if it's empty)
    const activeImages = images.filter((img: any) => img !== null);
    if (activeImages.length >= 5 && !images[index]) {
      toast.error("Max 5 images allowed! Please delete some first.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., 5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error("File is too large! Please upload an image less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Completion is matched by uid, not index — deleting another slot while
      // this one is in flight shifts every index after it.
      const uid = crypto.randomUUID();

      const updated = [...images];
      updated[index] = autoUpload
        ? { base64, file, uid, uploading: true }
        : { base64, file };

      // Push one more empty slot if this was the last image and we haven't reached a limit
      if (index === images.length - 1 && images.length < 5) {
        updated.push(null);
      }

      setImages(updated);
      setValue("images", updated);

      if (autoUpload) {
        uploadSlot(uid, base64);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;

    const target = images[index];
    if (!target) return;

    if (target.fileId) {
      setIsDeleting(true);
      try {
        await axiosInstance.post(
          "/product/api/admin/delete-cloudinary-image",
          { fileId: target.fileId },
          isProtected,
        );
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Could not delete the image",
        );
        setIsDeleting(false);
        return;
      }
      setIsDeleting(false);
    }

    const updated = withTrailingSlot(
      images.filter((_: any, i: number) => i !== index),
    );
    setImages(updated);
    setValue("images", updated);
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center group transition-all hover:border-blue-500/50 overflow-hidden shadow-inner`}
    >
      {/* Loading Overlays */}
      {(slotUploading || (isUploading && uploadStatus === "uploading")) && (
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={small ? 24 : 40} />
          <span className="text-white text-sm font-medium animate-pulse">Uploading...</span>
        </div>
      )}

      {isDeleting && (
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-rose-500" size={small ? 24 : 40} />
          <span className="text-white text-sm font-medium animate-pulse">Removing...</span>
        </div>
      )}

      {uploadStatus === "waiting" && (
        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
          <Loader2 className="text-gray-400 opacity-50" size={small ? 20 : 32} />
          <span className="text-gray-300 text-xs font-medium">Waiting...</span>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="absolute inset-0 z-10 bg-green-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
          <div className="bg-green-500 rounded-full p-1 shadow-lg">
            <Check className="text-white" size={small ? 14 : 20} />
          </div>
          <span className="text-green-400 text-xs font-bold font-secondary">Uploaded</span>
        </div>
      )}

      <label
        htmlFor={`image-upload-${index}`}
        className={`w-full h-full flex flex-col justify-center items-center ${busy ? "cursor-wait" : "cursor-pointer"}`}
      >
        {imagePreview ? (
          <div className="relative w-full h-full">
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {!busy && (
              <button
                onClick={handleDelete}
                className={`absolute top-2 right-2 z-20 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full ${
                  autoUpload ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                } transition-opacity shadow-lg backdrop-blur-sm`}
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4">
            <p
              className={`text-gray-400 ${
                small ? "text-xl" : "text-4xl"
              } font-semibold`}
            >
              {size}
            </p>
            <p
              className={`text-gray-500 ${
                small ? "text-xs" : "text-sm"
              } pt-2 text-center max-w-[80%] uppercase tracking-wider font-medium`}
            >
              {images.length >= 5 && !images[index] ? "Limit Reached" : "Select Image"} <br />
              <span className="text-gray-600 text-[10px] normal-case">(Max 5MB)</span>
            </p>
          </div>
        )}
      </label>

      {!busy && (
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id={`image-upload-${index}`}
          disabled={images.length >= 5 && !images[index]}
          onChange={handleImageChange}
        />
      )}
    </div>
  );
};

export default ImagePlaceHolder;
