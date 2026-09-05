"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, MapPin, CheckCircle2, IndianRupee, Package, Route } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { formatIstDateTime } from "@repo/shared/datetime";

interface Attendance {
  id: string;
  checkInAt: string;
  checkOutAt: string | null;
  selfieUrl: string;
  distanceMeters: number;
  isWithinGeofence: boolean;
}

interface DailyStats {
  ordersDelivered: number;
  kmTravelled: number | null;
  codCollected: number;
  codOutstanding: number;
  earnings: number | null;
  earningsUnavailableReason: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Reads a picked photo as a data URL — the shape the upload endpoint takes. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that photo"));
    reader.readAsDataURL(file);
  });
}

/** Browser geolocation, promisified with a timeout the user can act on. */
function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This device can't share its location"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      // The geofence is 50m, so a cached fix from an hour ago is useless here.
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
    });
  });
}

/**
 * A rider's shift: check in with a selfie at the store, and see the day so far.
 *
 * Both halves of the check-in are captured on the client but neither is trusted
 * — the server measures the distance itself against the store's own pin and
 * decides. Nothing here can be talked into passing.
 */
export default function RiderShiftPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data: attendanceData } = useQuery({
    queryKey: ["my-attendance"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/attendance/me");
      return res.data as { attendance: Attendance | null; isCheckedIn: boolean };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["rider-daily-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/rider-stats");
      return res.data as DailyStats;
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => axiosInstance.post("/order/api/attendance/check-out", {}),
    onSuccess: () => {
      toast.success("Shift ended");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Could not end shift"),
  });

  const handleSelfie = async (file: File) => {
    setBusy(true);
    try {
      // Location first: a rider who is out of range should find that out before
      // being asked to wait through a photo upload.
      const position = await getPosition();
      const photo = await readAsDataUrl(file);

      await axiosInstance.post("/order/api/attendance/check-in", {
        photo,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      toast.success("Checked in");
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
    } catch (error: any) {
      const data = error?.response?.data;
      // The server answers an out-of-range attempt with the actual distance,
      // which is far more actionable than "check-in failed".
      toast.error(
        data?.message ||
          (error instanceof GeolocationPositionError
            ? "Turn on location to check in"
            : error?.message) ||
          "Check-in failed",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const attendance = attendanceData?.attendance;
  const isCheckedIn = attendanceData?.isCheckedIn ?? false;

  return (
    <div className="p-4 space-y-4">
      <section className="rounded-2xl border border-gray-800 bg-[#0d1117] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">
          Today&apos;s shift
        </h2>

        {isCheckedIn && attendance ? (
          <>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">On shift</p>
                <p className="text-xs text-gray-500">
                  Since {formatIstDateTime(attendance.checkInAt)} · {attendance.distanceMeters}m
                  from store
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
              className="mt-4 w-full rounded-xl border border-gray-700 py-3 text-sm font-bold text-gray-300 transition hover:border-gray-500 hover:text-white disabled:opacity-40"
            >
              {checkOutMutation.isPending ? "Ending…" : "End shift"}
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-400">
              Take a selfie at the store to start your shift. Your location is checked
              against the store, so this only works once you&apos;ve arrived.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleSelfie(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold transition hover:bg-blue-500 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              {busy ? "Checking in…" : "Check in"}
            </button>

            {attendance && !attendance.isWithinGeofence && (
              <p className="mt-3 flex items-start gap-2 text-xs text-red-400">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                Last attempt was {attendance.distanceMeters}m away — too far from the store.
              </p>
            )}
          </>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Package className="h-4 w-4 text-blue-400" />}
          label="Delivered"
          value={String(stats?.ordersDelivered ?? 0)}
        />
        <StatTile
          icon={<Route className="h-4 w-4 text-purple-400" />}
          label="Distance"
          // Null means no delivery had coordinates to measure, which is not the
          // same as having ridden nowhere.
          value={stats?.kmTravelled != null ? `${stats.kmTravelled} km` : "—"}
        />
        <StatTile
          icon={<IndianRupee className="h-4 w-4 text-emerald-400" />}
          label="COD today"
          value={inr(stats?.codCollected ?? 0)}
        />
        <StatTile
          icon={<IndianRupee className="h-4 w-4 text-amber-400" />}
          label="Cash to hand over"
          value={inr(stats?.codOutstanding ?? 0)}
        />
      </section>

      {stats?.earnings == null && (
        <p className="rounded-xl border border-dashed border-gray-800 p-4 text-center text-xs text-gray-600">
          Earnings aren&apos;t shown yet — no payout rate has been set up.
        </p>
      )}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#0d1117] p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
