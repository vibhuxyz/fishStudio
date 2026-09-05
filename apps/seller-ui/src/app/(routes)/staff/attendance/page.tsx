"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Loader2, MapPin, AlertTriangle } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { formatIstDateTime } from "@repo/shared/datetime";

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string | null;
  checkInAt: string;
  checkOutAt: string | null;
  selfieUrl: string;
  distanceMeters: number;
  isWithinGeofence: boolean;
}

interface RosterMember {
  id: string;
  name: string;
  role: string;
}

/**
 * Who started their shift, where, and who hasn't.
 *
 * Failed check-ins are shown rather than hidden — a rider repeatedly trying to
 * check in from a kilometre away is the signal this screen exists to surface,
 * and filtering it out would leave a manager looking at a shorter, cleaner, and
 * less useful list.
 */
const fmtMeters = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `${value}m`;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export default function StaffAttendancePage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", from, to],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/attendance/store", {
        params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
      });
      return res.data as {
        records: AttendanceRecord[];
        absentToday: RosterMember[];
        geofenceMeters: number;
        calibration: {
          totalAttempts: number;
          rejected: number;
          medianAcceptedMeters: number | null;
          p90AcceptedMeters: number | null;
          maxAcceptedMeters: number | null;
        };
      };
    },
  });

  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center gap-2">
        <CalendarCheck className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl font-semibold">Attendance</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-400">
          <span className="mb-1 block">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </label>
        <label className="text-xs text-slate-400">
          <span className="mb-1 block">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </label>
        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="text-xs text-slate-400 underline hover:text-white"
          >
            Today only
          </button>
        )}
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      ) : (
        <>
          {/* The evidence for setting the radius. A p90 pressed up against the
              limit means honest riders are being turned away; a steady stream
              of rejections means the fence is being worked around rather than
              working. Both are visible here rather than requiring a log dig. */}
          {(data?.calibration.totalAttempts ?? 0) > 0 && (
            <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Geofence check · limit {data?.geofenceMeters}m
                </p>
                <span className="text-xs text-slate-500">
                  over {data?.calibration.totalAttempts} check-in
                  {data?.calibration.totalAttempts === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Median accepted" value={fmtMeters(data?.calibration.medianAcceptedMeters)} />
                <Stat label="90th percentile" value={fmtMeters(data?.calibration.p90AcceptedMeters)} />
                <Stat label="Furthest accepted" value={fmtMeters(data?.calibration.maxAcceptedMeters)} />
                <Stat label="Rejected" value={String(data?.calibration.rejected ?? 0)} />
              </div>
              {data && data.calibration.p90AcceptedMeters !== null &&
                data.calibration.p90AcceptedMeters > data.geofenceMeters * 0.8 && (
                  <p className="mt-3 text-xs text-amber-400">
                    Most check-ins are landing near the limit. Consider raising the radius in
                    Store Settings — GPS accuracy, not distance, is probably what you&apos;re
                    measuring.
                  </p>
                )}
            </div>
          )}

          {(data?.absentToday.length ?? 0) > 0 && (
            <div className="mb-6 rounded-xl border border-amber-700/40 bg-amber-900/10 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                Not checked in today
              </p>
              <p className="text-sm text-slate-300">
                {data?.absentToday.map((m) => m.name).join(", ")}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {(data?.records ?? []).map((record) => (
              <div
                key={record.id}
                className={`flex items-center gap-4 rounded-xl border p-4 ${
                  record.isWithinGeofence
                    ? "border-gray-700 bg-gray-800/40"
                    : "border-red-800/50 bg-red-900/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.selfieUrl}
                  alt={`${record.staffName} at check-in`}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{record.staffName}</p>
                  <p className="text-xs text-slate-500">
                    {record.staffRole} · in {formatIstDateTime(record.checkInAt)}
                    {record.checkOutAt ? ` · out ${formatIstDateTime(record.checkOutAt)}` : " · still on shift"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold ${
                      record.isWithinGeofence ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {record.isWithinGeofence ? (
                      <MapPin className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {record.distanceMeters}m
                  </span>
                  <p className="text-[10px] text-slate-500">
                    limit {data?.geofenceMeters}m
                  </p>
                </div>
              </div>
            ))}

            {(data?.records ?? []).length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-700 py-16 text-center text-slate-500">
                No check-ins for this period.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
