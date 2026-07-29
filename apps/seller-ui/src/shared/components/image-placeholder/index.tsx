import React, { useState } from "react";
import { Loader2, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

const ImagePlaceHolder = ({
  small,
  size,
  defaultImage = null,
  index = 0,
  setValue,
  images,
  setImages,
  isUploading,
  uploadStatus = "idle",
  autoUpload = false,
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
  // Opt-in: push to Cloudinary as soon as a file is picked instead of sending
  // base64 along with the banner form.
  autoUpload?: boolean;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const slot = images[index];
  const imagePreview = slot?.file_url || slot?.base64 || defaultImage;
  const slotUploading = Boolean(slot?.uploading);
  const busy = isUploading || slotUploading || isDeleting;

  const uploadSlot = async (uid: string, base64: string) => {
    try {
      const res = await axiosInstance.post(
        "/product/api/upload-store-image",
        { fileName: base64 },
        isProtected,
      );
      if (!res.data?.fileId) {
        throw new Error("Upload response did not include an image");
      }
      setImages((current: any[]) =>
        current.map((img: any) =>
          img?.uid === uid
            ? {
                ...img,
                uploading: false,
                file_url: res.data.file_url,
                fileId: res.data.fileId,
              }
            : img,
        ),
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Image upload failed. Please pick the file again.",
      );
      setImages((current: any[]) => {
        const next = current.filter((img: any) => img?.uid !== uid);
        if (next.length === 0 || next[next.length - 1] !== null) next.push(null);
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Matched by uid on completion — removing another slot mid-upload shifts
      // every index after it.
      const uid = crypto.randomUUID();

      const updated = [...images];
      updated[index] = autoUpload
        ? { base64, file, uid, uploading: true }
        : { base64, file };

      // Push one more empty slot if this is the last image
      if (index === images.length - 1) {
        updated.push(null);
      }

      setImages(updated);
      setValue("images", updated); // for react-hook-form

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
          "/product/api/delete-store-image",
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

    const updated = images.filter((_: any, i: number) => i !== index);
    if (updated.length === 0 || updated[updated.length - 1] !== null) {
      updated.push(null);
    }
    setImages(updated);
    setValue("images", updated);
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <label
        htmlFor={`image-upload-${index}`}
        className="w-full h-full flex flex-col justify-center items-center cursor-pointer"
      >
        {(slotUploading || (isUploading && uploadStatus === "uploading")) && (
          <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-[2px]">
            <Loader2 className="animate-spin text-blue-500 mb-2" size={small ? 24 : 48} />
            <p className="text-white text-sm font-medium">Uploading...</p>
          </div>
        )}
        {isDeleting && (
          <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-[2px]">
            <Loader2 className="animate-spin text-rose-500 mb-2" size={small ? 24 : 48} />
            <p className="text-white text-sm font-medium">Removing...</p>
          </div>
        )}
        {uploadStatus === "waiting" && (
          <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-[1px]">
            <Loader2 className="text-gray-400 mb-2 opacity-50" size={small ? 20 : 32} />
            <p className="text-gray-300 text-xs font-medium">Waiting...</p>
          </div>
        )}
        {uploadStatus === "success" && (
          <div className="absolute inset-0 bg-green-500/20 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-[1px]">
            <div className="bg-green-500 rounded-full p-1 mb-2 shadow-lg">
              <Check className="text-white" size={small ? 14 : 20} />
            </div>
            <p className="text-green-400 text-xs font-bold">Uploaded</p>
          </div>
        )}
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <>
            <p
              className={`text-gray-400 ${
                small ? "text-xl" : "text-4xl"
              } font-semibold`}
            >
              {size}
            </p>
            <p
              className={`text-gray-500 ${
                small ? "text-sm" : "text-lg"
              } pt-2 text-center`}
            >
              Please choose an image <br />
              according to the expected ratio
            </p>
          </>
        )}
      </label>

      {autoUpload && imagePreview && !busy && (
        <button
          type="button"
          onClick={handleDelete}
          title="Delete image"
          className="absolute top-2 right-2 z-20 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm"
        >
          <Trash2 size={16} />
        </button>
      )}

      {!busy && (
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id={`image-upload-${index}`}
          onChange={handleImageChange}
        />
      )}
    </div>
  );
};

export default ImagePlaceHolder;
