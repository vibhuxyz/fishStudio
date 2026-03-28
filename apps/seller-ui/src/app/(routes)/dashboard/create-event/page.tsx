"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";

type FirstOrderCouponValues = {
  public_name: string;
  discountType: "percentage" | "fixed";
  discountValue: number | "";
  discountCode: string;
  minOrderValue: number | "";
  expiresAt: string;
};

type SellerEventFormValues = {
  title: string;
  description: string;
  type: "FREE_DELIVERY" | "DISCOUNT" | "FLASH_SALE";
  minOrder: number | "";
  discount: number | "";
  startTime: string;
  endTime: string;
  attachFirstOrderCoupon: boolean;
  firstOrderCoupon: FirstOrderCouponValues;
};

const createSellerEvent = async (payload: any) => {
  await axiosInstance.post("/product/api/create-event", payload, isProtected);
};

const updateSellerEvent = async ({
  eventId,
  payload,
}: {
  eventId: string;
  payload: any;
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
  const { register, handleSubmit, watch, reset, setValue } = useForm<SellerEventFormValues>({
    defaultValues: {
      title: "",
      description: "",
      type: "FREE_DELIVERY",
      minOrder: "",
      discount: "",
      startTime: "",
      endTime: "",
      attachFirstOrderCoupon: false,
      firstOrderCoupon: {
        public_name: "",
        discountType: "percentage",
        discountValue: "",
        discountCode: "",
        minOrderValue: "",
        expiresAt: "",
      },
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
      attachFirstOrderCoupon: false,
    });
  }, [editingEvent, reset]);

  const selectedType = watch("type");
  const attachCoupon = watch("attachFirstOrderCoupon");
  const couponDiscountType = watch("firstOrderCoupon.discountType");

  const createMutation = useMutation({
    mutationFn: createSellerEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "events"] });
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      toast.success("Event created successfully.");
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
      toast.success("Event updated successfully.");
      router.push("/dashboard/all-events");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update event.");
    },
  });

  const onSubmit = (values: SellerEventFormValues) => {
    const { attachFirstOrderCoupon, firstOrderCoupon, ...eventData } = values;

    const payload: any = { ...eventData };

    if (attachFirstOrderCoupon && !eventId) {
      // When the event is FREE_DELIVERY, the coupon inherits that type automatically
      const isFreeDeliveryEvent = values.type === "FREE_DELIVERY";
      payload.firstOrderCoupon = {
        public_name: firstOrderCoupon.public_name,
        discountType: isFreeDeliveryEvent ? "free_delivery" : firstOrderCoupon.discountType,
        discountValue: isFreeDeliveryEvent ? 0 : Number(firstOrderCoupon.discountValue),
        discountCode: firstOrderCoupon.discountCode.toUpperCase(),
        minOrderValue: firstOrderCoupon.minOrderValue
          ? Number(firstOrderCoupon.minOrderValue)
          : 0,
        expiresAt: firstOrderCoupon.expiresAt
          ? new Date(firstOrderCoupon.expiresAt).toISOString()
          : null,
      };
    }

    if (eventId) {
      updateMutation.mutate({ eventId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

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
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 max-w-4xl space-y-6"
      >
        {/* ── Event Details ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Event Details</h2>
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
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              >
                <option value="FREE_DELIVERY" className="bg-slate-950">Free Delivery</option>
                <option value="DISCOUNT" className="bg-slate-950">Discount</option>
                <option value="FLASH_SALE" className="bg-slate-950">Flash Sale</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-300">Description</label>
              <textarea
                rows={3}
                {...register("description")}
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                placeholder="Tell customers when the offer applies."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Minimum Order Value</label>
              <input
                type="number"
                {...register("minOrder", { valueAsNumber: true })}
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                placeholder="500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                {selectedType === "FREE_DELIVERY" ? "Discount Value" : "Discount Amount"}
              </label>
              <input
                type="number"
                {...register("discount", { valueAsNumber: true })}
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                placeholder={selectedType === "FREE_DELIVERY" ? "Optional" : "10"}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Start Time</label>
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
        </div>

        {/* ── First Order Coupon (only on create) ───────────────────────── */}
        {!eventId && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="attachFirstOrderCoupon"
                {...register("attachFirstOrderCoupon")}
                className="mt-0.5 w-4 h-4 accent-amber-400 cursor-pointer"
              />
              <label htmlFor="attachFirstOrderCoupon" className="cursor-pointer">
                <p className="text-amber-300 font-medium">
                  Create a First-Order Coupon with this event
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Auto-generates a coupon valid only for customers placing their
                  first order at your store. Each customer can redeem it once, for life.
                </p>
              </label>
            </div>

            {attachCoupon && (
              <div className="grid gap-4 md:grid-cols-2 mt-2">
                {/* When the event is FREE_DELIVERY, show an info banner instead of discount fields */}
                {selectedType === "FREE_DELIVERY" && (
                  <div className="md:col-span-2 flex items-start gap-2 bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-2">
                    <span className="text-teal-300 text-xs mt-0.5">✓</span>
                    <p className="text-teal-300 text-xs">
                      The coupon will automatically grant <strong>free delivery</strong> — matching
                      this event. No separate discount type needed.
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-slate-300">
                    Coupon Title <span className="text-slate-500">(shown to customers)</span>
                  </label>
                  <input
                    {...register("firstOrderCoupon.public_name", {
                      required: attachCoupon ? "Coupon title required" : false,
                    })}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                    placeholder={
                      selectedType === "FREE_DELIVERY"
                        ? "e.g. Free delivery on your first order!"
                        : "e.g. Welcome — 20% off your first order!"
                    }
                  />
                </div>

                {/* Discount Type + Value — hidden for FREE_DELIVERY events (auto-inherited) */}
                {selectedType !== "FREE_DELIVERY" && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Discount Type</label>
                      <select
                        {...register("firstOrderCoupon.discountType")}
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
                      >
                        <option value="percentage" className="bg-slate-950">Percentage (%) off</option>
                        <option value="fixed" className="bg-slate-950">Flat Amount (₹) off</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-slate-300">
                        {couponDiscountType === "percentage" ? "Discount %" : "Discount Amount (₹)"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        {...register("firstOrderCoupon.discountValue", {
                          required: attachCoupon && selectedType !== "FREE_DELIVERY" ? "Value required" : false,
                          valueAsNumber: true,
                        })}
                        className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                        placeholder={couponDiscountType === "percentage" ? "20" : "100"}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Coupon Code</label>
                  <input
                    {...register("firstOrderCoupon.discountCode", {
                      required: attachCoupon ? "Code required" : false,
                      pattern: {
                        value: /^[A-Z0-9_]{3,20}$/i,
                        message: "3–20 chars, letters/numbers/underscore only",
                      },
                    })}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none font-mono"
                    placeholder="WELCOME20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Min Order Value (₹) <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register("firstOrderCoupon.minOrderValue", { valueAsNumber: true })}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Coupon Expiry <span className="text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register("firstOrderCoupon.expiresAt")}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="text-amber-400/80 text-xs bg-amber-500/10 px-3 py-2 rounded-lg">
                    This coupon will be saved to your Discount Codes list. Each new customer
                    can use it once — validated against their full order history at your store.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
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
              ? eventId ? "Saving..." : "Creating..."
              : eventId ? "Save Event" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Page = () => {
  useRequireAuth("event");
  return (
    <Suspense fallback={<div className="min-h-screen w-full p-8 text-white">Loading event form...</div>}>
      <SellerEventForm />
    </Suspense>
  );
};

export default Page;
