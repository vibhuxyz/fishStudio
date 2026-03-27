import React, { useState, useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";
import {
  useAdminSellerDetail,
  useUpdateSellerApproval,
  AdminSellerSummary,
} from "@/hooks/useAdminQueries";
import { useRouter } from "next/navigation";

const PERMISSION_OPTIONS = [
  { id: "product", label: "Manage Products" },
  { id: "coupon", label: "Manage Coupons" },
  { id: "event", label: "Manage Events" },
  { id: "full_access", label: "Full Access" },
];

export default function GiveAccessModal({
  sellerId,
  onClose,
}: {
  sellerId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { data: sellerDetail, isLoading } = useAdminSellerDetail(sellerId);
  const updateMutation = useUpdateSellerApproval();

  const [isApproved, setIsApproved] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showConfirmFullAccess, setShowConfirmFullAccess] = useState(false);

  useEffect(() => {
    if (sellerDetail) {
      setIsApproved(sellerDetail.isApprovedByAdmin || false);
      setPermissions(sellerDetail.permissions || []);
    }
  }, [sellerDetail]);

  const handleToggleApproval = () => {
    if (!isApproved) {
      setIsApproved(true);
      setShowPermissionsModal(true); // Open the permissions modal when toggling ON
    } else {
      setIsApproved(false);
      setPermissions([]);
    }
  };

  const handleTogglePermission = (permId: string) => {
    if (permId === "full_access") {
      const isCurrentlySelected = permissions.includes("full_access");
      if (!isCurrentlySelected) {
        setShowConfirmFullAccess(true);
      } else {
        setPermissions((prev) => prev.filter((p) => p !== permId));
      }
      return;
    }

    setPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId],
    );
  };

  const handleConfirmFullAccess = () => {
    updateMutation.mutate(
      {
        sellerId,
        isApprovedByAdmin: true,
        permissions: ["full_access"],
      },
      {
        onSuccess: () => {
          setShowConfirmFullAccess(false);
          setShowPermissionsModal(false);
          onClose();
          router.push(`/dashboard/sellers/${sellerId}`);
        },
      },
    );
  };

  const handleSavePermissions = () => {
    updateMutation.mutate(
      {
        sellerId,
        isApprovedByAdmin: true,
        permissions,
      },
      {
        onSuccess: () => {
          setShowPermissionsModal(false);
          onClose();
          router.push(`/dashboard/sellers/${sellerId}`);
        },
      },
    );
  };

  const handleSaveMain = () => {
    // Used if they are just toggling off, or hitting save without opening the secondary modal
    updateMutation.mutate(
      {
        sellerId,
        isApprovedByAdmin: isApproved,
        permissions,
      },
      {
        onSuccess: () => {
          onClose();
          router.push(`/dashboard/sellers/${sellerId}`);
        },
      },
    );
  };

  return (
    <>
      {/* 1. Base Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="mb-4 text-xl font-bold text-white">
            Give Access to Seller
          </h2>

          {isLoading ? (
            <p className="text-gray-400">Loading seller details...</p>
          ) : !sellerDetail ? (
            <p className="text-gray-400">Could not load seller details.</p>
          ) : (
            <div className="space-y-6">
              {/* Grid of full details */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-950/50 p-4 border border-gray-800 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-white">{sellerDetail.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-white">{sellerDetail.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-white">
                    {sellerDetail.phone_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Shop Name</p>
                  <p className="font-medium text-white">
                    {sellerDetail.store?.name || "No Store"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Shop Address</p>
                  <p className="font-medium text-white">
                    {sellerDetail.store?.address || "No Address"}
                    {sellerDetail.store?.city
                      ? `, ${sellerDetail.store?.city}`
                      : ""}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Total Products / Coupons</p>
                  <p className="font-medium text-white">
                    {sellerDetail.totalProducts ?? 0} Products,{" "}
                    {sellerDetail.totalCoupons ?? 0} Coupons
                  </p>
                </div>
              </div>

              {/* Approval status toggle */}
              <div className="flex items-center justify-between rounded-xl bg-gray-950/50 p-4 border border-gray-800">
                <div>
                  <p className="font-medium text-white">Admin Approval</p>
                  <p className="text-xs text-gray-400">
                    Give access to seller dashboard
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleApproval}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isApproved ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isApproved ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMain}
                  disabled={updateMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Feature Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPermissionsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="mb-2 text-xl font-bold text-white">
              Feature Permissions
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              Select which dashboard features this seller can manage. Selecting
              "Full Access" will allow unconditional access.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {PERMISSION_OPTIONS.map((opt) => {
                const isChecked = permissions.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 cursor-pointer rounded-lg bg-gray-950/50 p-3 border border-gray-800 hover:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(opt.id)}
                    />
                    <span className="text-sm font-medium text-gray-200">
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={updateMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving..." : "Save & Grant Access"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm Full Access Modal */}
      {showConfirmFullAccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">
              Grant Full Access?
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              Are you sure you want to give full access to this seller? They
              will be able to manage all restricted features unconditionally.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmFullAccess(false)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmFullAccess}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, Grant Access
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
