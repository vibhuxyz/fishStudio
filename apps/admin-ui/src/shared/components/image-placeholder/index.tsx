import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ImagePlaceHolder = ({
  small,
  size,
  index = 0,
  setValue,
  images,
  setImages,
  isUploading = false,
}: {
  size: string;
  small?: boolean;
  defaultImage?: string | null;
  index?: number;
  setValue: any;
  images: any;
  setImages: any;
  isUploading?: boolean;
}) => {
  const imagePreview = images[index]?.base64 || null;

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

      const updated = [...images];
      updated[index] = { base64, file };

      // Push one more empty slot if this was the last image and we haven't reached a limit
      if (index === images.length - 1 && images.length < 5) {
        updated.push(null);
      }

      setImages(updated);
      setValue("images", updated);
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isUploading) return;

    const updated = [...images];
    
    if (updated[index]) {
        updated.splice(index, 1);
        if (updated.length === 0) updated.push(null);
        if (updated[updated.length - 1] !== null && updated.length < 5) {
            updated.push(null);
        }
        setImages(updated);
        setValue("images", updated);
    }
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center group transition-all hover:border-blue-500/50 overflow-hidden shadow-inner`}
    >
      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={small ? 24 : 40} />
          <span className="text-white text-sm font-medium animate-pulse">Uploading...</span>
        </div>
      )}

      <label
        htmlFor={`image-upload-${index}`}
        className={`w-full h-full flex flex-col justify-center items-center ${isUploading ? "cursor-wait" : "cursor-pointer"}`}
      >
        {imagePreview ? (
          <div className="relative w-full h-full">
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {!isUploading && (
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"
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

      {!isUploading && (
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
