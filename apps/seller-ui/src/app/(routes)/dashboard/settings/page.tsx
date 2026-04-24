"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Store, MapPin, Save, Loader2, Clock, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";
import { isProtected } from "@/utils/protected";
import BreadCrumbs from "@/shared/components/breadcrumbs";

type CityDelivery = { city: string; minutes: number };

type FormData = {
  name: string;
  bio: string;
  address: string;
  city: string;
  pincode: string;
  opening_hours: string;
  closing_hours: string;
  is_instant_delivery_enabled: boolean;
  instant_delivery_fee: number;
  instant_delivery_window_start: string;
  instant_delivery_window_end: string;
};

type DiffRow = {
  field: string;
  before: string;
  after: string;
};

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt24to12(t: string) {
  if (!t) return t;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function fmtField(key: keyof FormData, val: string | number | boolean): string {
  if (key === "opening_hours" || key === "closing_hours" ||
      key === "instant_delivery_window_start" || key === "instant_delivery_window_end") {
    return fmt24to12(String(val));
  }
  if (key === "is_instant_delivery_enabled") return val ? "Enabled" : "Disabled";
  if (key === "instant_delivery_fee") return `₹${val}`;
  return String(val || "—");
}

const FIELD_LABELS: Record<keyof FormData, string> = {
  name: "Store Name",
  bio: "Short Bio",
  address: "Store Address",
  city: "Base City",
  pincode: "Main Pincode",
  opening_hours: "Opening Time",
  closing_hours: "Closing Time",
  is_instant_delivery_enabled: "Instant Delivery",
  instant_delivery_fee: "Instant Delivery Surcharge",
  instant_delivery_window_start: "Instant Window Start",
  instant_delivery_window_end: "Instant Window End",
};

function citiesLabel(cities: CityDelivery[]): string {
  if (!cities.length) return "—";
  return cities.map((c) => `${c.city} (${c.minutes}m)`).join(", ");
}

// ── Confirmation modal ────────────────────────────────────────────────────────
function ConfirmModal({
  diff,
  citiesDiff,
  onConfirm,
  onCancel,
  isSaving,
}: {
  diff: DiffRow[];
  citiesDiff: { before: string; after: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const rows = [...diff, ...(citiesDiff ? [{ field: "Serviceable Cities", ...citiesDiff }] : [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Confirm Changes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Review what will change before saving</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Diff table */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No changes detected.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.field} className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">{row.field}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-1">Before</p>
                      <p className="text-sm text-red-200 break-words">{row.before}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <div className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">After</p>
                      <p className="text-sm text-emerald-200 break-words">{row.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-700 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-lg border border-gray-600 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving || rows.length === 0}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving…" : "Confirm & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { seller, isLoading } = useSeller();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    bio: "",
    address: "",
    city: "",
    pincode: "",
    opening_hours: "09:00",
    closing_hours: "21:00",
    is_instant_delivery_enabled: true,
    instant_delivery_fee: 20,
    instant_delivery_window_start: "11:00",
    instant_delivery_window_end: "19:00",
  });

  const [cityDeliveries, setCityDeliveries] = useState<CityDelivery[]>([]);
  const [newCity, setNewCity] = useState("");
  const [newMinutes, setNewMinutes] = useState("");

  // Snapshots of the last-saved state (used for diff)
  const savedFormRef = useRef<FormData>(formData);
  const savedCitiesRef = useRef<CityDelivery[]>([]);

  // Re-populate form whenever seller data changes (initial load + after save refetch)
  useEffect(() => {
    if (!seller?.store) return;
    const store = seller.store;

    const loaded: FormData = {
      name: store.name || "",
      bio: store.bio || "",
      address: store.address || "",
      city: store.city || "",
      pincode: store.pincode || "",
      opening_hours: store.opening_hours || "09:00",
      closing_hours: store.closing_hours || "21:00",
      is_instant_delivery_enabled: store.is_instant_delivery_enabled ?? true,
      instant_delivery_fee: store.instant_delivery_fee ?? 20,
      instant_delivery_window_start: store.instant_delivery_window_start || "11:00",
      instant_delivery_window_end: store.instant_delivery_window_end || "19:00",
    };

    const cityDT = store.cityDeliveryTimes as Record<string, number> | null;
    let cities: CityDelivery[] = [];
    if (cityDT) {
      cities = Object.entries(cityDT).map(([city, minutes]) => ({ city, minutes: minutes as number }));
    } else if (store.availableCities?.length) {
      cities = store.availableCities.map((c: string) => ({ city: c, minutes: 30 }));
    }

    setFormData(loaded);
    setCityDeliveries(cities);
    savedFormRef.current = loaded;
    savedCitiesRef.current = cities;
  }, [seller]);

  const handleAddCity = () => {
    const city = newCity.trim().replace(/\s+/g, " ");
    const mins = parseInt(newMinutes, 10);
    if (!city) { toast.error("Enter a city name"); return; }
    if (!/^[a-zA-Z\s]+$/.test(city)) { toast.error("City name should only contain letters and spaces"); return; }
    if (isNaN(mins) || mins < 1 || mins > 300) { toast.error("Delivery time must be 1–300 minutes"); return; }
    if (cityDeliveries.some((c) => c.city.toLowerCase() === city.toLowerCase())) { toast.error("City already added"); return; }
    setCityDeliveries((prev) => [...prev, { city, minutes: mins }]);
    setNewCity("");
    setNewMinutes("");
  };

  const handleRemoveCity = (city: string) => {
    setCityDeliveries((prev) => prev.filter((c) => c.city !== city));
  };

  // Build diff between current form and last saved snapshot
  const buildDiff = (): { formDiff: DiffRow[]; citiesDiff: { before: string; after: string } | null } => {
    const formDiff: DiffRow[] = [];
    const saved = savedFormRef.current;

    (Object.keys(FIELD_LABELS) as (keyof FormData)[]).forEach((key) => {
      const before = fmtField(key, saved[key] as any);
      const after  = fmtField(key, formData[key] as any);
      if (before !== after) formDiff.push({ field: FIELD_LABELS[key], before, after });
    });

    const beforeCities = citiesLabel(savedCitiesRef.current);
    const afterCities  = citiesLabel(cityDeliveries);
    const citiesDiff   = beforeCities !== afterCities ? { before: beforeCities, after: afterCities } : null;

    return { formDiff, citiesDiff };
  };

  const handleSaveClick = () => {
    if (!formData.name || !formData.pincode) { toast.error("Store name and pincode are required"); return; }
    if (cityDeliveries.length === 0) { toast.error("Add at least one serviceable city with delivery time"); return; }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const cityDeliveryTimesMap: Record<string, number> = {};
    cityDeliveries.forEach(({ city, minutes }) => { cityDeliveryTimesMap[city] = minutes; });

    setIsSaving(true);
    try {
      const { data } = await axiosInstance.post(
        "/auth/api/update-store",
        {
          ...formData,
          availableCities: cityDeliveries.map((c) => c.city),
          cityDeliveryTimes: cityDeliveryTimesMap,
        },
        isProtected,
      );
      if (data.success) {
        setShowModal(false);
        toast.success("Settings updated successfully!");
        // Refetch the full seller record so useEffect repopulates the form
        // with exactly what is stored in the DB (includes all fields).
        await queryClient.invalidateQueries({ queryKey: ["seller"] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const { formDiff, citiesDiff } = showModal ? buildDiff() : { formDiff: [], citiesDiff: null };

  return (
    <>
      {showModal && (
        <ConfirmModal
          diff={formDiff}
          citiesDiff={citiesDiff}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          isSaving={isSaving}
        />
      )}

      <div className="mx-auto w-full rounded-lg p-8 text-white shadow-md">
        <div className="mb-6">
          <BreadCrumbs title="Shop Settings" />
          <h1 className="mt-4 text-2xl font-bold">Shop Settings</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage your store information and service areas.
          </p>
        </div>

        <div className="space-y-8">
          {/* General Info */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Store className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">General Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Store Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fresh Fish Haven"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">Short Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell customers about your fresh catch..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Opening Time</label>
                <input
                  type="time"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData((f) => ({ ...f, opening_hours: e.target.value }))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Closing Time</label>
                <input
                  type="time"
                  value={formData.closing_hours}
                  onChange={(e) => setFormData((f) => ({ ...f, closing_hours: e.target.value }))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">Store Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 12 Market Road"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Clock className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Delivery Configuration</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between col-span-2 p-4 rounded-lg bg-gray-700/30 border border-gray-600/50">
                <div>
                  <h3 className="font-medium text-white">Enable Instant Delivery</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Allow customers to choose fast 30-45 min delivery</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, is_instant_delivery_enabled: !f.is_instant_delivery_enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_instant_delivery_enabled ? "bg-blue-600" : "bg-gray-600"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_instant_delivery_enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {formData.is_instant_delivery_enabled && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Instant Delivery Window (Start)</label>
                    <input
                      type="time"
                      value={formData.instant_delivery_window_start}
                      onChange={(e) => setFormData((f) => ({ ...f, instant_delivery_window_start: e.target.value }))}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Instant Delivery Window (End)</label>
                    <input
                      type="time"
                      value={formData.instant_delivery_window_end}
                      onChange={(e) => setFormData((f) => ({ ...f, instant_delivery_window_end: e.target.value }))}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-300">Instant Delivery Surcharge (₹)</label>
                    <input
                      type="number"
                      value={formData.instant_delivery_fee}
                      onChange={(e) => setFormData((f) => ({ ...f, instant_delivery_fee: Number(e.target.value) }))}
                      placeholder="e.g. 20"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-500 italic mt-1">This fee is added to the bill when Instant Delivery is selected.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Service Area */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <MapPin className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Serviceable Areas</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Base City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Muzaffarpur"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Main Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData((f) => ({ ...f, pincode: e.target.value }))}
                  placeholder="e.g. 843111"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Add Serviceable City & Delivery Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
                    placeholder="City name (e.g. Bathnaha)"
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
                    placeholder="Min"
                    min={1}
                    max={300}
                    className="w-24 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Set the average delivery time for each city in minutes.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {cityDeliveries.map(({ city, minutes }) => (
                <div
                  key={city}
                  className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {city}
                  <span className="flex items-center gap-0.5 text-blue-400/80 text-xs">
                    <Clock className="h-3 w-3" />
                    {minutes}m
                  </span>
                  <button
                    onClick={() => handleRemoveCity(city)}
                    className="ml-1 text-gray-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {cityDeliveries.length === 0 && (
                <p className="text-sm italic text-gray-500">No serviceable cities added yet.</p>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-4 border-t border-gray-700 pt-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              disabled={isSaving}
              className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-700"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
