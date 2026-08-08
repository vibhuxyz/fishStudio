"use client";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Phone, MapPin, Navigation, Package, Camera, CheckCircle2, Loader2, Bike, RotateCcw, X } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { formatOrderId } from "@repo/shared/order-id";
import { toast } from "sonner";
import { AxiosError } from "axios";
import useStaffRequestConfig from "@/hooks/useStaffRequestConfig";
import useSeller from "@/hooks/useSeller";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { buildMapsUrl } from "@/shared/utils/maps";

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED_TO_RIDER: "Assigned",
  SHIPPED: "Out for Delivery",
  DELIVERED: "Delivered",
};

const RiderOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { config: staffConfig, isReady } = useStaffRequestConfig();
  const { seller } = useSeller();
  const isSellerViewing = seller?.role === "seller";
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isOpen: isCameraOpen, videoRef, open: openCamera, capture: capturePhotoFrame, stop: stopCamera } = useCameraCapture();

  // No single-order endpoint scoped to the rider — both list scopes are
  // already correctly filtered by riderId server-side, so we fetch both and
  // pick the matching order out of them.
  const { data: order, isLoading } = useQuery({
    queryKey: ["rider-order", id],
    queryFn: async () => {
      const [assigned, completed] = await Promise.all([
        axiosInstance.get("/order/api/staff/my-rider-orders?scope=assigned", staffConfig),
        axiosInstance.get("/order/api/staff/my-rider-orders?scope=completed", staffConfig),
      ]);
      const all = [...(assigned.data.orders || []), ...(completed.data.orders || [])];
      return all.find((o: any) => o.id === id) || null;
    },
    enabled: isReady,
  });

  const mapsUrl = useMemo(() => (order ? buildMapsUrl(order) : null), [order]);

  const capturePhoto = () => {
    const dataUri = capturePhotoFrame();
    if (dataUri) setProofPhoto(dataUri);
  };

  const retakePhoto = () => {
    setProofPhoto(null);
    openCamera();
  };

  const markPickedUpMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.put(`/order/api/staff/mark-picked-up/${id}`, {}, staffConfig);
    },
    onSuccess: () => {
      toast.success("Order marked as picked up!");
      queryClient.invalidateQueries({ queryKey: ["rider-order", id] });
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update order.");
    },
  });

  const handleMarkDelivered = async () => {
    if (!proofPhoto) {
      toast.error("Take a delivery proof photo first.");
      return;
    }
    setIsUploading(true);
    try {
      await axiosInstance.put(
        `/order/api/staff/mark-delivered/${id}`,
        { photo: proofPhoto },
        staffConfig,
      );
      toast.success("Order marked as delivered!");
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      router.push("/staff/rider/orders");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to mark delivered.");
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

  const isDelivered = order.status === "DELIVERED";
  const isAssigned = order.status === "ASSIGNED_TO_RIDER";

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
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold">Order {formatOrderId(order.id)}</p>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        {isSellerViewing && order.rider?.name && (
          <p className="flex items-center gap-1.5 text-sm text-blue-300 mb-1">
            <Bike size={13} />
            {order.rider.name}
          </p>
        )}
        <p className="text-sm text-gray-300">{order.user?.name || order.deliveryName || "Customer"}</p>

        {/* Contact number and address are only needed to complete the
            delivery — once DELIVERED, the rider has no further reason to
            hold onto the customer's phone number or home address. */}
        {isDelivered ? (
          <p className="text-sm text-gray-500 mt-1">Delivered — contact details hidden for customer privacy.</p>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              {order.deliveryAddress}
              {order.deliveryLandmark ? `, ${order.deliveryLandmark}` : ""}
              {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
              {order.deliveryPincode ? ` - ${order.deliveryPincode}` : ""}
            </p>
            {order.deliveryInstructions && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-300 bg-amber-900/20 border border-amber-900/40 rounded-lg px-2.5 py-2">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                {order.deliveryInstructions}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <a
                href={`tel:${order.deliveryPhone || order.user?.phone_number || ""}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
              >
                <Phone size={15} />
                Call Customer
              </a>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
                >
                  <Navigation size={15} />
                  Maps
                </a>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4 mb-4">
        <p className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Package size={16} />
          Ordered Products
        </p>
        <div className="space-y-3">
          {(order.items || []).map((item: any, idx: number) => {
            const imageUrl = item.product?.images?.[0]?.url;
            const optionParts = [
              item.selectedOptions?.cuttingType,
              item.selectedOptions?.pieceSize,
            ].filter(Boolean);
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={item.product?.title || "Product"} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={18} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-200 font-medium line-clamp-1">{item.product?.title || "Product"}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity}
                    {optionParts.length > 0 ? ` · ${optionParts.join(" · ")}` : ""}
                  </p>
                </div>
                {typeof item.price === "number" && (
                  <span className="text-sm text-gray-400 shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                )}
              </div>
            );
          })}
        </div>
        {typeof order.total === "number" && (
          <div className="flex justify-between text-sm font-semibold text-white border-t border-gray-800 mt-3 pt-3">
            <span>Total</span>
            <span>₹{order.total.toFixed(0)}</span>
          </div>
        )}
      </div>

      {isAssigned && (
        <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4 mb-4">
          <p className="text-white font-semibold text-sm mb-3">Picked Up the Order?</p>
          <p className="text-gray-400 text-xs mb-3">
            Confirm once you've collected this order from the store — this marks it out for delivery.
          </p>
          <button
            type="button"
            disabled={markPickedUpMutation.isPending}
            onClick={() => markPickedUpMutation.mutate()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            {markPickedUpMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Mark Picked Up
          </button>
        </div>
      )}

      {!isDelivered && !isAssigned && (
        <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
          <p className="text-white font-semibold text-sm mb-3">Delivery Proof</p>

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
                className="w-full flex items-center justify-center gap-2 py-3 mt-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
              >
                <Camera size={16} />
                Capture Photo
              </button>
            </div>
          ) : proofPhoto ? (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={proofPhoto} alt="Delivery proof" className="w-full rounded-lg max-h-64 object-cover" />
              <button
                type="button"
                onClick={retakePhoto}
                className="w-full flex items-center justify-center gap-2 py-2 mt-2 text-sm text-gray-400 hover:text-white transition"
              >
                <RotateCcw size={14} />
                Retake photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openCamera}
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-700 rounded-lg py-8 mb-3 text-gray-500 hover:border-gray-600 hover:text-gray-400 transition"
            >
              <Camera size={28} />
              <span className="text-sm">Take delivery proof photo</span>
            </button>
          )}

          <button
            type="button"
            disabled={!proofPhoto || isUploading}
            onClick={handleMarkDelivered}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Mark as Delivered
          </button>
        </div>
      )}
    </div>
  );
};

export default RiderOrderDetailPage;
