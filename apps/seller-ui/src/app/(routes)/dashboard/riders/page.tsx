"use client";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import DeleteRiderModal from "@/shared/components/modals/delete.rider.modal";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useRequireAuth from "@/hooks/useRequiredAuth";
import { AxiosError } from "axios";
import { Bike, Phone, Plus, ToggleLeft, ToggleRight, Trash, X } from "lucide-react";
import { Input, Button } from "@repo/ui";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  BIKE: "Bike",
  SCOOTER: "Scooter",
  BICYCLE: "Bicycle",
  OTHER: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-green-500/20 text-green-400",
  DELIVERING: "bg-blue-500/20 text-blue-400",
  OFFLINE: "bg-gray-500/20 text-gray-400",
  ON_LEAVE: "bg-amber-500/20 text-amber-400",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  DELIVERING: "Delivering",
  OFFLINE: "Offline",
  ON_LEAVE: "On Leave",
};

type RiderFormValues = {
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  deliveryZone: string;
  notes: string;
};

const EMPTY_FORM: RiderFormValues = {
  name: "",
  phone: "",
  email: "",
  vehicleType: "BIKE",
  vehicleNumber: "",
  deliveryZone: "",
  notes: "",
};

const Page = () => {
  useRequireAuth("rider");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRider, setEditingRider] = useState<any>(null);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [images, setImages] = useState<(any | null)[]>([null]);

  const queryClient = useQueryClient();

  const { data: riders = [], isLoading } = useQuery({
    queryKey: ["seller-riders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/seller/riders", isProtected);
      return res?.data?.riders || [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<RiderFormValues>({
    mode: "onChange",
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (editingRider) {
      reset({
        name: editingRider.name ?? "",
        phone: editingRider.phone ?? "",
        email: editingRider.email ?? "",
        vehicleType: editingRider.vehicleType ?? "BIKE",
        vehicleNumber: editingRider.vehicleNumber ?? "",
        deliveryZone: editingRider.deliveryZone ?? "",
        notes: editingRider.notes ?? "",
      });
      setImages([editingRider.avatar ? { file_url: editingRider.avatar.url, fileId: editingRider.avatar.file_id } : null]);
    } else {
      reset(EMPTY_FORM);
      setImages([null]);
    }
  }, [editingRider, reset]);

  const closeModal = () => {
    setShowModal(false);
    setEditingRider(null);
    reset(EMPTY_FORM);
    setImages([null]);
  };

  const createMutation = useMutation({
    mutationFn: async (data: RiderFormValues & { avatarId?: string }) => {
      await axiosInstance.post("/auth/api/seller/rider", data, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-riders"] });
      closeModal();
      toast.success("Rider added!");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to add rider");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RiderFormValues & { avatarId?: string } }) => {
      await axiosInstance.put(`/auth/api/seller/rider/${id}`, data, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-riders"] });
      closeModal();
      toast.success("Rider updated!");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update rider");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (riderId: string) => {
      await axiosInstance.delete(`/auth/api/seller/rider/${riderId}`, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-riders"] });
      setShowDeleteModal(false);
      toast.success("Rider deleted");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete rider");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await axiosInstance.put(`/auth/api/seller/rider/${id}/toggle-active`, { isActive }, isProtected);
    },
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-riders"] });
      toast.success(isActive ? "Rider activated" : "Rider deactivated");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update rider status");
    },
  });

  const onSubmit = (data: RiderFormValues) => {
    const avatarId = images[0]?.fileId;
    const payload = { ...data, ...(avatarId && { avatarId }) };
    if (editingRider) {
      updateMutation.mutate({ id: editingRider.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Riders</h2>
        <Button
          className="!w-auto !py-2 !px-4 !rounded-lg !text-sm"
          variant="blue"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} className="mr-2" />
          Add Rider
        </Button>
      </div>

      <BreadCrumbs title="Riders" />

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Riders
          <span className="ml-2 text-sm text-gray-400">({riders.length})</span>
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading riders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="p-3 text-left">Rider</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Vehicle</th>
                  <th className="p-3 text-left">Zone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Active Deliveries</th>
                  <th className="p-3 text-left">Active</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider: any) => (
                  <tr key={rider.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-3">
                        {rider.avatar?.url ? (
                          <img src={rider.avatar.url} alt={rider.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                            <Bike size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span>{rider.name}</span>
                          {rider.email && <span className="text-xs text-gray-500">{rider.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">
                      <a href={`tel:${rider.phone}`} className="flex items-center gap-1.5 hover:text-blue-400">
                        <Phone size={14} /> {rider.phone}
                      </a>
                    </td>
                    <td className="p-3 text-gray-300">
                      <div className="flex flex-col">
                        <span>{VEHICLE_TYPE_LABELS[rider.vehicleType] ?? rider.vehicleType}</span>
                        <span className="text-xs text-gray-500 font-mono">{rider.vehicleNumber}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">{rider.deliveryZone || "–"}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[rider.status] ?? "bg-gray-700 text-gray-300"}`}>
                        {STATUS_LABELS[rider.status] ?? rider.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{rider.activeDeliveryCount}</td>
                    <td className="p-3">
                      <button
                        title={rider.isActive ? "Deactivate" : "Activate"}
                        onClick={() => toggleMutation.mutate({ id: rider.id, isActive: !rider.isActive })}
                        className={`transition ${
                          rider.isActive ? "text-green-400 hover:text-yellow-400" : "text-gray-500 hover:text-green-400"
                        }`}
                      >
                        {rider.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingRider(rider);
                            setShowModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRider(rider);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && riders.length === 0 && (
          <p className="text-gray-400 w-full pt-4 block text-center">
            No riders yet. Add your first delivery rider!
          </p>
        )}
      </div>

      {/* ── Create/Edit modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 px-6 py-4 sticky top-0 bg-gray-800">
              <h3 className="text-xl text-white font-semibold">{editingRider ? "Edit Rider" : "Add Rider"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Profile Photo (optional)</label>
                <ImagePlaceHolder
                  small
                  size="Photo"
                  index={0}
                  images={images}
                  setImages={setImages}
                  setValue={setValue}
                  autoUpload
                />
              </div>

              <div>
                <Input label="Full Name" {...register("name", { required: "Name is required" })} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Input
                  label="Mobile Number"
                  placeholder="9876543210"
                  {...register("phone", {
                    required: "Phone is required",
                    minLength: { value: 10, message: "Phone must be at least 10 digits" },
                  })}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Input
                  label="Email (optional)"
                  type="email"
                  {...register("email", {
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Type</label>
                <select
                  {...register("vehicleType", { required: true })}
                  className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
                >
                  {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Vehicle Number"
                  placeholder="DL 01 AB 1234"
                  {...register("vehicleNumber", { required: "Vehicle number is required" })}
                />
                {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1">{errors.vehicleNumber.message}</p>}
              </div>

              <div>
                <Input label="Delivery Zone (optional)" placeholder="e.g. Sector 20" {...register("deliveryZone")} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes (optional)</label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSaving || !isValid}
                isLoading={isSaving}
                loaderLabel={editingRider ? "Saving..." : "Adding..."}
                variant="blue"
                className="w-full !rounded-lg !py-2.5 !font-semibold"
              >
                {editingRider ? "Save Changes" : "Add Rider"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRider && (
        <DeleteRiderModal
          rider={selectedRider}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedRider.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Page;
