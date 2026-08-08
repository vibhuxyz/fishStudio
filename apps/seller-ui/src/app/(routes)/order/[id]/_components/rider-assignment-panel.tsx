"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Bike, Phone, X } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  BIKE: "Bike",
  SCOOTER: "Scooter",
  BICYCLE: "Bicycle",
  OTHER: "Other",
};

interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  riderStatus: string;
  activeDeliveryCount: number;
  photo?: { url: string } | null;
}

function RiderAvatar({ rider, size = 40 }: { rider: Rider; size?: number }) {
  if (rider.photo?.url) {
    return (
      <Image
        src={rider.photo.url}
        alt={rider.name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center flex-shrink-0"
    >
      <Bike size={size * 0.45} className="text-fuchsia-400" />
    </div>
  );
}

export default function RiderAssignmentPanel({
  orderId,
  status,
  assignedRider,
  onChanged,
}: {
  orderId: string;
  status: string;
  assignedRider: Rider | null;
  onChanged: () => Promise<void> | void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [eligibleRiders, setEligibleRiders] = useState<Rider[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [mode, setMode] = useState<"assign" | "change">("assign");

  const openPicker = async (nextMode: "assign" | "change") => {
    setMode(nextMode);
    setShowPicker(true);
    setLoadingRiders(true);
    try {
      const res = await axiosInstance.get(`/order/api/eligible-riders/${orderId}`);
      setEligibleRiders(res.data?.riders ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load riders");
    } finally {
      setLoadingRiders(false);
    }
  };

  const handlePick = async (riderId: string) => {
    setSubmitting(riderId);
    try {
      const endpoint = mode === "assign" ? "assign-rider" : "change-rider";
      await axiosInstance.put(`/order/api/${endpoint}/${orderId}`, { riderId });
      toast.success(mode === "assign" ? "Rider assigned" : "Rider changed");
      setShowPicker(false);
      await onChanged();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign rider");
    } finally {
      setSubmitting(null);
    }
  };

  const handleRemove = async () => {
    setSubmitting("remove");
    try {
      await axiosInstance.put(`/order/api/remove-rider/${orderId}`);
      toast.success("Rider removed");
      await onChanged();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove rider");
    } finally {
      setSubmitting(null);
    }
  };

  if (status !== "READY_FOR_PICKUP" && status !== "ASSIGNED_TO_RIDER") return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Bike className="h-5 w-5 text-fuchsia-400" />
        <h2 className="text-md font-semibold text-gray-100">Delivery Rider</h2>
      </div>

      {status === "READY_FOR_PICKUP" && !assignedRider && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">No rider assigned yet.</p>
          <button
            onClick={() => openPicker("assign")}
            className="rounded-md bg-fuchsia-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-fuchsia-700 transition"
          >
            Assign Rider
          </button>
        </div>
      )}

      {status === "ASSIGNED_TO_RIDER" && assignedRider && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RiderAvatar rider={assignedRider} />
            <div className="text-sm text-gray-200">
              <p className="font-semibold">{assignedRider.name}</p>
              <a href={`tel:${assignedRider.phone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 mt-0.5">
                <Phone size={13} /> {assignedRider.phone}
              </a>
              <p className="text-xs text-gray-500 mt-0.5">
                {VEHICLE_TYPE_LABELS[assignedRider.vehicleType] ?? assignedRider.vehicleType} ·{" "}
                {assignedRider.vehicleNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openPicker("change")}
              disabled={submitting !== null}
              className="rounded-md border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-700 transition disabled:opacity-50"
            >
              Change Rider
            </button>
            <button
              onClick={handleRemove}
              disabled={submitting !== null}
              className="rounded-md border border-red-600 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/10 transition disabled:opacity-50"
            >
              {submitting === "remove" ? "Removing..." : "Remove Rider"}
            </button>
          </div>
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 px-5 py-4 sticky top-0 bg-gray-800">
              <h3 className="text-lg text-white font-semibold">
                {mode === "assign" ? "Assign a Rider" : "Change Rider"}
              </h3>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {loadingRiders ? (
                <p className="text-gray-400 text-sm text-center py-6">Loading riders...</p>
              ) : eligibleRiders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No riders are available right now. Add or free up a rider first.
                </p>
              ) : (
                eligibleRiders.map((rider) => (
                  <div
                    key={rider.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <RiderAvatar rider={rider} size={36} />
                      <div className="text-sm text-gray-200">
                        <p className="font-semibold">{rider.name}</p>
                        <p className="text-xs text-green-400 mt-0.5">Available</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Current Deliveries: {rider.activeDeliveryCount} · Phone: {rider.phone}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePick(rider.id)}
                      disabled={submitting !== null}
                      className="rounded-md bg-fuchsia-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-fuchsia-700 transition disabled:opacity-50"
                    >
                      {submitting === rider.id ? "Assigning..." : "Assign"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
