"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";

type SellerEvent = {
  id: string;
  title: string;
  description?: string | null;
  type: "FREE_DELIVERY" | "DISCOUNT" | "FLASH_SALE";
  minOrder?: number | null;
  discount?: number | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const fetchSellerEvents = async (): Promise<SellerEvent[]> => {
  const res = await axiosInstance.get("/product/api/get-seller-events", isProtected);
  return Array.isArray(res.data.events) ? res.data.events : [];
};

const deleteSellerEvent = async (eventId: string) => {
  await axiosInstance.delete(`/product/api/delete-event/${eventId}`, isProtected);
};

const formatEventMeta = (event: SellerEvent) => {
  if (event.type === "FREE_DELIVERY") {
    return event.minOrder ? `Free delivery above Rs${event.minOrder}` : "Free delivery";
  }

  if (event.type === "FLASH_SALE") {
    return event.discount ? `Flash sale: ${event.discount}% off` : "Flash sale";
  }

  return event.discount ? `${event.discount}% discount` : "Discount event";
};

const Page = () => {
  useRequireAuth("event");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["seller", "events"],
    queryFn: fetchSellerEvents,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSellerEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "events"] });
      toast.success("Event deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete event.");
    },
  });

  return (
    <div className="min-h-screen w-full p-8 text-white">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">All Events</h1>
          <p className="text-sm text-slate-400">
            Review and manage the time-based offers currently scheduled for your
            shop.
          </p>
        </div>
        <Link
          href="/dashboard/create-event"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Event
        </Link>
      </div>

      <BreadCrumbs title="All Events" />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300">
            Loading seller events...
          </div>
        )}

        {!isLoading &&
          events.map((event) => {
            const isLive =
              event.isActive &&
              new Date(event.startTime).getTime() <= Date.now() &&
              new Date(event.endTime).getTime() >= Date.now();

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        isLive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {isLive ? "Live" : "Scheduled"}
                    </span>
                    <h2 className="mt-3 text-lg font-semibold text-white">
                      {event.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      {formatEventMeta(event)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/create-event?eventId=${event.id}`)}
                    className="text-amber-400 transition hover:text-amber-300"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(event.id)}
                    className="text-red-400 transition hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {event.description && (
                  <p className="mb-4 text-sm text-slate-400">{event.description}</p>
                )}

                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarRange size={16} className="text-slate-500" />
                    <span>
                      {new Date(event.startTime).toLocaleString()} to{" "}
                      {new Date(event.endTime).toLocaleString()}
                    </span>
                  </div>
                  {event.minOrder ? <p>Minimum order: Rs{event.minOrder}</p> : null}
                </div>
              </div>
            );
          })}

        {!isLoading && events.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300">
            No seller events yet. Create one to schedule discounts, flash sales,
            or free delivery campaigns.
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
