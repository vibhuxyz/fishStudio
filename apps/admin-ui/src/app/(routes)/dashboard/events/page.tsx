"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { Input, Button } from "@repo/ui";
import { formatIstDateTime } from "@repo/shared/datetime";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  adminQueryKeys,
  createAdminSellerEvent,
  deleteAdminSellerEvent,
  updateAdminSellerEvent,
  useAdminSellerEvents,
  useAdminSellers,
  type AdminSellerEvent,
  type AdminSellerEventType,
} from "@/hooks/useAdminQueries";

type EventFormValues = {
  title: string;
  description: string;
  type: AdminSellerEventType;
  minOrder: string;
  discount: string;
  startTime: string;
  endTime: string;
};

const EVENT_TYPE_LABELS: Record<AdminSellerEventType, string> = {
  FREE_DELIVERY: "Free delivery",
  DISCOUNT: "Discount",
  FLASH_SALE: "Flash sale",
};

// <input type="datetime-local"> works in the browser's local zone; the store
// runs on IST, so treat the entered wall-clock time as IST when converting to
// the ISO string the API stores.
const toIsoFromLocalInput = (value: string) =>
  value ? new Date(value).toISOString() : "";

// Reverse: an ISO instant → the "YYYY-MM-DDTHH:mm" a datetime-local input wants,
// rendered in IST so the seller sees the same wall-clock time they set.
const toLocalInputFromIso = (iso: string) => {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

const eventMeta = (event: AdminSellerEvent) => {
  if (event.type === "FREE_DELIVERY") {
    return event.minOrder ? `Free delivery above ₹${event.minOrder}` : "Free delivery";
  }
  if (event.type === "FLASH_SALE") {
    return event.discount ? `Flash sale — ${event.discount}% off` : "Flash sale";
  }
  return event.discount ? `${event.discount}% discount` : "Discount event";
};

const numericOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

const EventFormModal = ({
  title,
  initial,
  isSaving,
  onClose,
  onSubmit,
}: {
  title: string;
  initial?: AdminSellerEvent;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      type: initial?.type ?? "DISCOUNT",
      minOrder: initial?.minOrder != null ? String(initial.minOrder) : "",
      discount: initial?.discount != null ? String(initial.discount) : "",
      startTime: toLocalInputFromIso(initial?.startTime ?? ""),
      endTime: toLocalInputFromIso(initial?.endTime ?? ""),
    },
  });

  const type = watch("type");
  const discountRequired = type === "DISCOUNT" || type === "FLASH_SALE";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-700 px-6 py-4 sticky top-0 bg-gray-800">
          <h3 className="text-xl text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 py-4 space-y-4"
        >
          <div>
            <Input label="Title (shown to customers)" {...register("title", { required: "Title is required" })} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              {...register("type")}
              className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
            >
              <option value="DISCOUNT">Discount</option>
              <option value="FLASH_SALE">Flash sale</option>
              <option value="FREE_DELIVERY">Free delivery</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label={discountRequired ? "Discount %" : "Discount % (optional)"}
                type="number"
                {...register("discount", {
                  validate: (v) =>
                    !discountRequired || numericOrNull(v) !== null || "Discount is required for this type",
                })}
              />
              {errors.discount && <p className="text-red-400 text-xs mt-1">{errors.discount.message}</p>}
            </div>
            <div>
              <Input label="Min order ₹ (optional)" type="number" {...register("minOrder")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Starts (IST)</label>
              <input
                type="datetime-local"
                {...register("startTime", { required: "Start time is required" })}
                className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
              />
              {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ends (IST)</label>
              <input
                type="datetime-local"
                {...register("endTime", { required: "End time is required" })}
                className="w-full border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
              />
              {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
            >
              Cancel
            </button>
            <Button type="submit" variant="blue" isLoading={isSaving} loaderLabel="Saving..." fullWidth={false}>
              Save Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Page = () => {
  const queryClient = useQueryClient();
  const { data: sellers = [] } = useAdminSellers();
  const [sellerId, setSellerId] = useState("");
  const { data: events = [], isLoading } = useAdminSellerEvents(sellerId || undefined);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminSellerEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSellerEvent | null>(null);

  const selectedSeller = useMemo(
    () => sellers.find((s) => s.id === sellerId),
    [sellers, sellerId],
  );

  const invalidate = () => {
    if (sellerId) {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.sellerEvents(sellerId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: createAdminSellerEvent,
    onSuccess: () => {
      toast.success("Event created");
      setShowCreate(false);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create event"),
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminSellerEvent,
    onSuccess: () => {
      toast.success("Event updated");
      setEditTarget(null);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update event"),
  });

  const toggleMutation = useMutation({
    mutationFn: updateAdminSellerEvent,
    onSuccess: invalidate,
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update event"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminSellerEvent,
    onSuccess: () => {
      toast.success("Event deleted");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete event"),
  });

  const buildPayload = (values: EventFormValues) => ({
    sellerId,
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    type: values.type,
    minOrder: numericOrNull(values.minOrder),
    discount: numericOrNull(values.discount),
    startTime: toIsoFromLocalInput(values.startTime),
    endTime: toIsoFromLocalInput(values.endTime),
  });

  return (
    <DashboardPageShell
      title="Seller Events"
      breadcrumbTitle="Seller Events"
      description="Time-based offers (discounts, flash sales, free delivery) that run on a seller's shop. Sellers manage their own; Master Admin can manage any seller's events."
      action={
        <Button
          className="!w-auto !py-2 !px-4 !rounded-lg !text-sm"
          variant="blue"
          disabled={!sellerId}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Event
        </Button>
      }
    >
      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <label className="block text-sm font-medium text-gray-300 mb-1">Seller</label>
        <select
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          className="w-full max-w-md border border-gray-700 bg-gray-900 text-white p-2.5 rounded-lg outline-none focus:border-blue-500"
        >
          <option value="">Select a seller...</option>
          {sellers.map((seller) => (
            <option key={seller.id} value={seller.id}>
              {seller.name} ({seller.email})
            </option>
          ))}
        </select>

        {!sellerId ? (
          <p className="text-gray-400 pt-6 text-center">
            Pick a seller to see and manage their events.
          </p>
        ) : isLoading ? (
          <p className="text-gray-400 pt-6 text-center">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400 pt-6 text-center">
            {selectedSeller?.name ?? "This seller"} has no events yet.
          </p>
        ) : (
          <table className="w-full text-white mt-4">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Offer</th>
                <th className="p-3 text-left">Window (IST)</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{event.title}</span>
                      <span className="text-xs text-gray-400">{EVENT_TYPE_LABELS[event.type]}</span>
                    </div>
                  </td>
                  <td className="p-3">{eventMeta(event)}</td>
                  <td className="p-3 text-sm text-gray-300">
                    {formatIstDateTime(event.startTime)} → {formatIstDateTime(event.endTime)}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={event.isActive !== false}
                      aria-label={`${event.isActive !== false ? "Deactivate" : "Activate"} ${event.title}`}
                      disabled={
                        toggleMutation.isPending &&
                        toggleMutation.variables?.eventId === event.id
                      }
                      onClick={() =>
                        toggleMutation.mutate({
                          eventId: event.id,
                          payload: { isActive: event.isActive === false },
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
                        event.isActive !== false ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          event.isActive !== false ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        title="Edit event"
                        onClick={() => setEditTarget(event)}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        title="Delete event"
                        onClick={() => setDeleteTarget(event)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && sellerId && (
        <EventFormModal
          title={`New event for ${selectedSeller?.name ?? "seller"}`}
          isSaving={createMutation.isPending}
          onClose={() => setShowCreate(false)}
          onSubmit={(values) => createMutation.mutate(buildPayload(values))}
        />
      )}

      {editTarget && (
        <EventFormModal
          key={editTarget.id}
          title="Edit event"
          initial={editTarget}
          isSaving={updateMutation.isPending}
          onClose={() => setEditTarget(null)}
          onSubmit={(values) =>
            updateMutation.mutate({ eventId: editTarget.id, payload: buildPayload(values) })
          }
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl">
            <div className="border-b border-gray-700 px-6 py-4">
              <h3 className="text-lg text-white font-semibold">Delete event?</h3>
            </div>
            <div className="px-6 py-4 text-sm text-gray-300">
              &quot;{deleteTarget.title}&quot; will be removed from {selectedSeller?.name ?? "this seller"}&apos;s
              shop. This cannot be undone.
            </div>
            <div className="flex justify-end gap-3 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
              >
                Cancel
              </button>
              <Button
                variant="rose"
                isLoading={deleteMutation.isPending}
                loaderLabel="Deleting..."
                fullWidth={false}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
};

export default Page;
