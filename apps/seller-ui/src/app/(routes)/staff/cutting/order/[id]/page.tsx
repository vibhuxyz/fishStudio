"use client";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, CheckCircle2, Loader2, X, Package, PlayCircle } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { displayOrderNumber } from "@repo/shared/order-id";
import { toast } from "sonner";
import { AxiosError } from "axios";
import useStaffRequestConfig from "@/hooks/useStaffRequestConfig";
import { useCameraCapture } from "@/hooks/useCameraCapture";

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
};

// What the cutting staff actually needs to read off an order item — how much
// and how to cut it. comboId is an internal linking id, never prep info.
const PREP_OPTION_LABELS: Record<string, string> = {
  size: "Size",
  pieceSize: "Piece Size",
  cuttingType: "Cutting Type",
};
const HIDDEN_OPTION_KEYS = new Set(["comboId"]);

const CuttingOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { config: staffConfig, isReady } = useStaffRequestConfig();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { isOpen: isCameraOpen, videoRef, open: openCamera, capture: capturePhotoFrame, stop: stopCamera } = useCameraCapture();

  // No single-order endpoint scoped to cutting staff — the "awaiting prep"
  // list is already correctly scoped server-side (storeId + status), so we
  // fetch it and pick the matching order out of it.
  const { data: order, isLoading } = useQuery({
    queryKey: ["cutting-order", id],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/staff/my-cutting-orders", staffConfig);
      const all = res.data.orders || [];
      return all.find((o: any) => o.id === id) || null;
    },
    enabled: isReady,
  });

  const itemCount = useMemo(
    () => (order?.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
    [order],
  );

  const capturePhoto = () => {
    const dataUri = capturePhotoFrame();
    if (dataUri) setPhotos((prev) => [...prev, dataUri]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const startPreparingMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.put(`/order/api/staff/start-preparing/${id}`, {}, staffConfig);
    },
    onSuccess: () => {
      toast.success("Preparation started!");
      queryClient.invalidateQueries({ queryKey: ["cutting-order", id] });
      queryClient.invalidateQueries({ queryKey: ["cutting-orders"] });
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to start preparation.");
    },
  });

  const handleMarkComplete = async () => {
    if (photos.length === 0) {
      toast.error("Take at least one preparation photo first.");
      return;
    }
    setIsUploading(true);
    try {
      await axiosInstance.put(
        `/order/api/staff/prepare-complete/${id}`,
        { photos },
        staffConfig,
      );
      toast.success("Preparation complete — ready to assign a rider!");
      queryClient.invalidateQueries({ queryKey: ["cutting-orders"] });
      router.push("/staff/cutting/orders");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to mark complete.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-gray-500">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 pt-4 text-center text-gray-500 py-16">
        <p>Order not found.</p>
      </div>
    );
  }

  const isAccepted = order.status === "ACCEPTED";
  const isPreparing = order.status === "PREPARING";

  return (
    <div className="px-4 pt-4 pb-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-gray-400 flex items-center gap-2 text-sm mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white font-semibold">Order {displayOrderNumber(order)}</p>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300">
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <p className="text-sm text-gray-400">{order.user?.name || order.deliveryName || "Customer"}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800 text-sm">
          <span className="text-gray-500">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
          {typeof order.total === "number" && (
            <span className="text-white font-semibold">₹{order.total.toFixed(0)}</span>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {(order.items || []).map((item: any, idx: number) => {
          const imageUrl = item.product?.images?.[0]?.url;
          const prepOptions = Object.entries(item.selectedOptions || {}).filter(
            ([key, value]) => !HIDDEN_OPTION_KEYS.has(key) && value !== "" && value != null,
          );
          return (
            <div key={idx} className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="relative w-16 h-16 shrink-0 rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={item.product?.title || "Product"} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-white font-semibold text-sm">
                    {item.product?.title || "Product"} × {item.quantity}
                  </p>
                  {typeof item.price === "number" && (
                    <p className="text-xs text-gray-500 mt-0.5">₹{(item.price * item.quantity).toFixed(0)}</p>
                  )}
                </div>
              </div>
              {prepOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-[76px]">
                  {prepOptions.map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-700/50"
                    >
                      <span className="text-xs text-emerald-400/80 font-medium">
                        {PREP_OPTION_LABELS[key] || key}:
                      </span>
                      <span className="text-base font-bold text-emerald-300">{String(value)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAccepted && (
        <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
          <p className="text-white font-semibold text-sm mb-3">Ready to Start?</p>
          <p className="text-gray-400 text-xs mb-3">
            Confirm once you begin preparing this order — it'll show as "Preparing" to the rest of the team.
          </p>
          <button
            type="button"
            disabled={startPreparingMutation.isPending}
            onClick={() => startPreparingMutation.mutate()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            {startPreparingMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PlayCircle size={16} />
            )}
            Start Preparing
          </button>
        </div>
      )}

      {isPreparing && (
        <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
          <p className="text-white font-semibold text-sm mb-3">Preparation Photos</p>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`Preparation ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isCameraOpen ? (
            <div className="mb-3">
              <div className="relative w-full rounded-lg overflow-hidden bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-64 object-cover" />
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={capturePhoto}
                className="w-full flex items-center justify-center gap-2 py-3 mt-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition"
              >
                <Camera size={16} />
                Capture Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCamera}
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-700 rounded-lg py-6 mb-3 text-gray-500 hover:border-gray-600 hover:text-gray-400 transition"
            >
              <Camera size={24} />
              <span className="text-sm">Add photo</span>
            </button>
          )}

          <button
            type="button"
            disabled={photos.length === 0 || isUploading}
            onClick={handleMarkComplete}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Preparation Completed
          </button>
        </div>
      )}
    </div>
  );
};

export default CuttingOrderDetailPage;
