import { X } from "lucide-react";
import React from "react";

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
}: any) => {
  const imageUrl = product?.images?.[0]?.url || "/file.svg";

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black/70 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-6 rounded-lg md:w-[520px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">
            {product?.isDeleted ? "Restore Product" : "Delete Product"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <img
            src={imageUrl}
            alt={product?.title || "Product"}
            className="w-24 h-24 rounded-lg object-cover border border-gray-700"
          />

          <div className="flex-1 text-sm text-gray-300 space-y-2">
            <p className="text-lg font-semibold text-white">{product?.title}</p>
            <p>
              Category:{" "}
              <span className="text-white">
                {product?.category}
                {product?.subCategory ? ` / ${product.subCategory}` : ""}
              </span>
            </p>
            <p>
              Price: <span className="text-white">₹{product?.sale_price}</span>
            </p>
            <p>
              Stock: <span className="text-white">{product?.stock}</span>
            </p>
            <p>
              Status:{" "}
              <span className="text-white">
                {product?.isDeleted ? "In delete window" : "Active"}
              </span>
            </p>
            {product?.short_description && (
              <p className="text-xs text-gray-400 line-clamp-3">
                {product.short_description}
              </p>
            )}
            {product?.deletedAt && (
              <p className="text-xs text-yellow-400">
                Scheduled delete at {new Date(product.deletedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-300 mt-4 text-sm">
          {product?.isDeleted
            ? "Restore this product and keep it live in the admin catalog."
            : "This product will enter a restore window before it is removed permanently."}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={!product?.isDeleted ? onConfirm : onRestore}
            className={`${
              product?.isDeleted
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } px-4 py-2 rounded-md text-white font-semibold transition`}
          >
            {product?.isDeleted ? "Restore Product" : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
