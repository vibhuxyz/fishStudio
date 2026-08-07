import React from "react";
import { X } from "lucide-react";

const DeleteRiderModal = ({
  rider,
  onClose,
  onConfirm,
  isLoading,
}: {
  rider: any;
  onClose: () => void;
  onConfirm?: () => void;
  isLoading?: boolean;
}) => {
  const hasActiveDelivery = (rider?.activeDeliveryCount ?? 0) > 0;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Rider</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Warning Message */}
        {hasActiveDelivery ? (
          <p className="text-amber-300 mt-4 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <span className="font-semibold text-white">{rider.name}</span> has an active
            delivery in progress and can't be deleted. Reassign or complete their delivery
            first.
          </p>
        ) : (
          <p className="text-gray-300 mt-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">{rider.name}</span>?
            <br />
            This action <strong>cannot be undone</strong>.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
          >
            Cancel
          </button>
          <button
            disabled={hasActiveDelivery || isLoading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRiderModal;
