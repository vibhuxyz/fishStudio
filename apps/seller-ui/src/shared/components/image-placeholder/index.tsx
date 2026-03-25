import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";

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
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      const updated = [...images];
      updated[index] = { base64, file };

      // Push one more empty slot if this is the last image
      if (index === images.length - 1) {
        updated.push(null);
      }

      setImagePreview(base64); // ✅ set the preview
      setImages(updated);
      setValue("images", updated); // for react-hook-form
    };

    reader.readAsDataURL(file);
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
        {isUploading && uploadStatus === "uploading" && (
          <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-[2px]">
            <Loader2 className="animate-spin text-blue-500 mb-2" size={small ? 24 : 48} />
            <p className="text-white text-sm font-medium">Uploading...</p>
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

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ImagePlaceHolder;
