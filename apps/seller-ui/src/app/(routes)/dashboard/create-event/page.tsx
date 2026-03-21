"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

type SellerEventFormValues = {
  title: string;
  description: string;
  type: "FREE_DELIVERY" | "DISCOUNT" | "FLASH_SALE";
  minOrder: number | "";
  discount: number | "";
  startTime: string;
  endTime: string;
};

const createSellerEvent = async (payload: SellerEventFormValues) => {
  await axiosInstance.post("/product/api/create-event", payload, isProtected);
};

const updateSellerEvent = async ({
  eventId,
  payload,
}: {
  eventId: string;
  payload: SellerEventFormValues;
}) => {
  await axiosInstance.put(`/product/api/update-event/${eventId}`, payload, isProtected);
};

const fetchSellerEvents = async () => {
  const res = await axiosInstance.get("/product/api/get-seller-events", isProtected);
  return Array.isArray(res.data.events) ? res.data.events : [];
};

const SellerEventForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const eventId = searchParams.get("eventId") || "";
  const { register, handleSubmit, watch, reset } = useForm<SellerEventFormValues>({
    defaultValues: {
      title: "",
      description: "",
      type: "FREE_DELIVERY",
      minOrder: "",
      discount: "",
      startTime: "",
      endTime: "",
    },
  });

  const { data: editingEvent } = useQuery({
    queryKey: ["seller", "events", eventId],
    queryFn: async () => {
      const events = await fetchSellerEvents();
      return events.find((event: any) => event.id === eventId) || null;
    },
    enabled: Boolean(eventId),
    staleTime: 1000 * 60 * 5,
  });

  React.useEffect(() => {
    if (!editingEvent) return;

    reset({
      title: editingEvent.title || "",
      description: editingEvent.description || "",
      type: editingEvent.type || "FREE_DELIVERY",
      minOrder: editingEvent.minOrder ?? "",
      discount: editingEvent.discount ?? "",
      startTime: editingEvent.startTime
        ? new Date(editingEvent.startTime).toISOString().slice(0, 16)
        : "",
      endTime: editingEvent.endTime
        ? new Date(editingEvent.endTime).toISOString().slice(0, 16)
        : "",
    });
  }, [editingEvent, reset]);

  const selectedType = watch("type");

  const createMutation = useMutation({
    mutationFn: createSellerEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "events"] });
      toast.success("Seller event created successfully.");
      router.push("/dashboard/all-events");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create event.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSellerEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "events"] });
      toast.success("Seller event updated successfully.");
      router.push("/dashboard/all-events");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update event.");
    },
  });

  return (
    <div className="min-h-screen w-full p-8 text-white">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold">
          {eventId ? "Edit Event" : "Create Event"}
        </h1>
        <p className="text-sm text-slate-400">
          Add time-based offers for your shop like free delivery, discount
          windows, or flash sales.
        </p>
      </div>

      <BreadCrumbs title={eventId ? "Edit Event" : "Create Event"} />

      <form
        onSubmit={handleSubmit((values) => {
          if (eventId) {
            updateMutation.mutate({ eventId, payload: values });
            return;
          }

          createMutation.mutate(values);
        })}
        className="mt-6 max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Title</label>
            <input
              {...register("title", { required: true })}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              placeholder="Weekend seafood offer"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Type</label>
            <select
              {...register("type")}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
            >
              <option value="FREE_DELIVERY" className="bg-slate-950">
                Free Delivery
              </option>
              <option value="DISCOUNT" className="bg-slate-950">
                Discount
              </option>
              <option value="FLASH_SALE" className="bg-slate-950">
                Flash Sale
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">
              Description
            </label>
            <textarea
              rows={4}
              {...register("description")}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              placeholder="Tell customers when the offer applies."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Minimum Order Value
            </label>
            <input
              type="number"
              {...register("minOrder", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              placeholder="500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              {selectedType === "FREE_DELIVERY"
                ? "Discount Value"
                : "Discount Amount"}
            </label>
            <input
              type="number"
              {...register("discount", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              placeholder={selectedType === "FREE_DELIVERY" ? "Optional" : "10"}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">
              Start Time
            </label>
            <input
              type="datetime-local"
              {...register("startTime", { required: true })}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">End Time</label>
            <input
              type="datetime-local"
              {...register("endTime", { required: true })}
              className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/all-events")}
            className="rounded-md bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {createMutation.isPending || updateMutation.isPending
              ? eventId
                ? "Saving..."
                : "Creating..."
              : eventId
                ? "Save Event"
                : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen w-full p-8 text-white">Loading event form...</div>}>
      <SellerEventForm />
    </Suspense>
  );
};

export default Page;
