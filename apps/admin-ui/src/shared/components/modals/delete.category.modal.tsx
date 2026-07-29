import React from "react";
import { X } from "lucide-react";

export type CategoryDeleteTarget = {
  category: string;
  subCategory?: string;
};

const DeleteCategoryModal = ({
  target,
  onClose,
  onConfirm,
  isLoading,
}: {
  target: CategoryDeleteTarget;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  const isSubCategory = Boolean(target.subCategory);

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/70 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">
            {isSubCategory ? "Delete Subcategory" : "Delete Category"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {target.subCategory ?? target.category}
          </span>
          {isSubCategory && (
            <>
              {" "}
              from <span className="font-semibold text-white">{target.category}</span>
            </>
          )}
          ?
        </p>
        <p className="text-gray-400 mt-2 text-sm">
          {isSubCategory
            ? "It will disappear from the admin product forms."
            : "Its subcategories and image will be removed too."}{" "}
          Categories still used by a product cannot be deleted.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            disabled={isLoading}
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-semibold transition flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;
