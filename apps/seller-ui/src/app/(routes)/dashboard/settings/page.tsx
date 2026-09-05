"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Store, MapPin, Save, Loader2, Clock, X, ArrowRight, Headset } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { DeliverySlotEditor } from "@/shared/components/settings/delivery-slot-editor";
import {
  DEFAULT_DELIVERY_SLOTS,
  parseDeliverySlotConfig,
  type DeliverySlotDefinition,
} from "@repo/shared/delivery-slots";
import useSeller from "@/hooks/useSeller";
import { isProtected } from "@/utils/protected";
import BreadCrumbs from "@/shared/components/breadcrumbs";

// "area" is the locality name (e.g. "Kavi Nagar"), "areaCity" is the real
// city it sits in (e.g. "Ghaziabad") — a single pincode can span areas in
// different cities from the store's own base city.
type AreaDelivery = { area: string; areaCity: string; pincode: string; minutes: number };

// A registered city+pincode combo, added once and then reused when adding
// areas — keeps a seller from retyping (and mistyping) the same city name
// for every locality that shares it.
type CityPincode = { city: string; pincode: string };
const cityPincodeKey = (cp: CityPincode) => `${cp.city}|||${cp.pincode}`;

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
  // Stored here as a percent (e.g. 5, not 0.05) for a readable input — converted
  // to/from the fraction the backend's computeCartSummary expects at load/save.
  gst_rate_percent: number;
  packaging_charge: number;
  base_delivery_charge: number;
  free_delivery_threshold: number;
  // Support / Contact — surfaced to customers on order-detail screens.
  supportPhone: string;
  whatsappNumber: string;
  whatsappLink: string;
  whatsappMessageTemplate: string;
  supportEmail: string;
  supportHours: string;
  supportDescription: string;
  faqLink: string;
};

type DiffRow = {
  field: string;
  before: string;
  after: string;
};

// ── helpers ──────────────────────────────────────────────────────────────────
const slotsLabel = (slots: DeliverySlotDefinition[]) =>
  slots.length === 0
    ? "None"
    : slots
        .map((s) => `${s.label} (${s.startTime}–${s.endTime}, ${s.capacity}/day, closes ${s.cutoffMinutesBefore}m before)`)
        .join("; ");

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
  if (key === "instant_delivery_fee" || key === "packaging_charge" ||
      key === "base_delivery_charge" || key === "free_delivery_threshold") return `₹${val}`;
  if (key === "gst_rate_percent") return `${val}%`;
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
  gst_rate_percent: "GST Rate",
  packaging_charge: "Packaging Charge",
  base_delivery_charge: "Delivery Charge",
  free_delivery_threshold: "Free Delivery Threshold",
  supportPhone: "Support Phone",
  whatsappNumber: "WhatsApp Number",
  whatsappLink: "WhatsApp Link Override",
  whatsappMessageTemplate: "WhatsApp Message Template",
  supportEmail: "Support Email",
  supportHours: "Support Working Hours",
  supportDescription: "Support Description",
  faqLink: "FAQ Link",
};

function citiesLabel(cities: AreaDelivery[]): string {
  if (!cities.length) return "—";
  return cities.map((c) => `${c.area}, ${c.areaCity} · ${c.pincode} (${c.minutes}m)`).join(", ");
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
  const rows = [...diff, ...(citiesDiff ? [{ field: "Serviceable Areas", ...citiesDiff }] : [])];

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
    gst_rate_percent: 0,
    packaging_charge: 0,
    base_delivery_charge: 49,
    free_delivery_threshold: 500,
    supportPhone: "",
    whatsappNumber: "",
    whatsappLink: "",
    whatsappMessageTemplate: "",
    supportEmail: "",
    supportHours: "",
    supportDescription: "",
    faqLink: "",
  });

  const [cityDeliveries, setCityDeliveries] = useState<AreaDelivery[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlotDefinition[]>(DEFAULT_DELIVERY_SLOTS);
  const savedSlotsRef = useRef<DeliverySlotDefinition[]>(DEFAULT_DELIVERY_SLOTS);
  // How many orders one rider may carry at once. Kept out of formData because
  // it is null-able (null = use the platform default) and FIELD_LABELS'
  // formatter assumes a concrete value.
  const [maxConcurrentDeliveries, setMaxConcurrentDeliveries] = useState<number>(3);
  const savedMaxDeliveriesRef = useRef<number>(3);
  // Kept out of formData: they are a nullable pair and the diff formatter
  // assumes a concrete value per field.
  const [attendanceGeofenceMeters, setAttendanceGeofenceMeters] = useState<number>(50);
  const savedGeofenceRef = useRef<number>(50);
  const [storeLatitude, setStoreLatitude] = useState<number | null>(null);
  const [storeLongitude, setStoreLongitude] = useState<number | null>(null);
  const savedCoordsRef = useRef<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  // Step 1 — register the city+pincode combos this store delivers to.
  const [cityPincodes, setCityPincodes] = useState<CityPincode[]>([]);
  const [newRegistryCity, setNewRegistryCity] = useState("");
  const [newRegistryPincode, setNewRegistryPincode] = useState("");

  // Step 2 — attach an area to one of the registered combos above.
  const [newCity, setNewCity] = useState("");
  const [selectedCityPincode, setSelectedCityPincode] = useState("");
  const [newMinutes, setNewMinutes] = useState("");

  // Snapshots of the last-saved state (used for diff)
  const savedFormRef = useRef<FormData>(formData);
  const savedCitiesRef = useRef<AreaDelivery[]>([]);

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
      gst_rate_percent: Math.round(((store.gst_rate ?? 0) * 100) * 100) / 100,
      packaging_charge: store.packaging_charge ?? 0,
      base_delivery_charge: store.base_delivery_charge ?? 49,
      free_delivery_threshold: store.free_delivery_threshold ?? 500,
      supportPhone: store.supportPhone || "",
      whatsappNumber: store.whatsappNumber || "",
      whatsappLink: store.whatsappLink || "",
      whatsappMessageTemplate: store.whatsappMessageTemplate || "",
      supportEmail: store.supportEmail || "",
      supportHours: store.supportHours || "",
      supportDescription: store.supportDescription || "",
      faqLink: store.faqLink || "",
    };

    const cityDT = store.cityDeliveryTimes as Record<string, number> | null;
    const areaPincodes = (store.areaPincodes as Record<string, string> | null) ?? {};
    const areaCities = (store.areaCities as Record<string, string> | null) ?? {};
    let cities: AreaDelivery[] = [];
    if (cityDT) {
      cities = Object.entries(cityDT).map(([area, minutes]) => ({
        area,
        minutes: minutes as number,
        pincode: areaPincodes[area] || "",
        areaCity: areaCities[area] || "",
      }));
    } else if (store.availableCities?.length) {
      cities = store.availableCities.map((a: string) => ({
        area: a,
        minutes: 30,
        pincode: areaPincodes[a] || "",
        areaCity: areaCities[a] || "",
      }));
    }

    // Seed the city+pincode registry from whatever combos are already in use,
    // so previously-added areas' combos are immediately reusable.
    const registrySeen = new Set<string>();
    const registry: CityPincode[] = [];
    cities.forEach(({ areaCity, pincode }) => {
      if (!areaCity || !pincode) return;
      const key = cityPincodeKey({ city: areaCity, pincode });
      if (registrySeen.has(key)) return;
      registrySeen.add(key);
      registry.push({ city: areaCity, pincode });
    });

    // parseDeliverySlotConfig falls back to the defaults for a store that has
    // never configured slots, so this form always opens on something valid.
    const loadedSlots = parseDeliverySlotConfig(seller?.store?.deliverySlotConfig);

    setFormData(loaded);
    setCityDeliveries(cities);
    setDeliverySlots(loadedSlots);
    savedSlotsRef.current = loadedSlots;

    const loadedMax = seller?.store?.maxConcurrentDeliveries ?? 3;
    setMaxConcurrentDeliveries(loadedMax);
    savedMaxDeliveriesRef.current = loadedMax;

    const loadedGeofence = seller?.store?.attendanceGeofenceMeters ?? 50;
    setAttendanceGeofenceMeters(loadedGeofence);
    savedGeofenceRef.current = loadedGeofence;

    const lat = seller?.store?.latitude ?? null;
    const lng = seller?.store?.longitude ?? null;
    setStoreLatitude(lat);
    setStoreLongitude(lng);
    savedCoordsRef.current = { lat, lng };
    setCityPincodes(registry);
    savedFormRef.current = loaded;
    savedCitiesRef.current = cities;
  }, [seller]);

  // Step 1 — register a city+pincode combo, reused below when adding areas.
  const handleAddCityPincode = () => {
    const city = newRegistryCity.trim().replace(/\s+/g, " ");
    const pincode = newRegistryPincode.trim();
    if (!city) { toast.error("Enter a city name"); return; }
    if (!/^[a-zA-Z\s]+$/.test(city)) { toast.error("City can only contain letters and spaces"); return; }
    if (!/^\d{6}$/.test(pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }
    if (cityPincodes.some((cp) => cp.city.toLowerCase() === city.toLowerCase() && cp.pincode === pincode)) {
      toast.error("This city and pincode is already added");
      return;
    }
    setCityPincodes((prev) => [...prev, { city, pincode }]);
    setNewRegistryCity("");
    setNewRegistryPincode("");
  };

  const handleRemoveCityPincode = (cp: CityPincode) => {
    setCityPincodes((prev) => prev.filter((c) => cityPincodeKey(c) !== cityPincodeKey(cp)));
  };

  // Step 2 — attach an area to one of the registered city+pincode combos.
  const handleAddCity = () => {
    const area = newCity.trim().replace(/\s+/g, " ");
    const mins = parseInt(newMinutes, 10);
    if (!area) { toast.error("Enter an area name"); return; }
    // Sector/phase/block areas carry digits — "Sector 46", "Phase 3", "Block C-2".
    if (!/^[a-zA-Z0-9\s-]+$/.test(area)) { toast.error("Area name can only contain letters, numbers, spaces and hyphens"); return; }
    if (!selectedCityPincode) { toast.error("Select the city & pincode this area belongs to"); return; }
    if (isNaN(mins) || mins < 1 || mins > 300) { toast.error("Delivery time must be 1–300 minutes"); return; }
    if (cityDeliveries.some((c) => c.area.toLowerCase() === area.toLowerCase())) { toast.error("Area already added"); return; }
    const [areaCity, pincode] = selectedCityPincode.split("|||");
    setCityDeliveries((prev) => [...prev, { area, areaCity, pincode, minutes: mins }]);
    setNewCity("");
    setSelectedCityPincode("");
    setNewMinutes("");
  };

  const handleRemoveCity = (area: string) => {
    setCityDeliveries((prev) => prev.filter((c) => c.area !== area));
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

    // Slots are an array, so they get one summary row rather than a row per
    // field — the confirm modal is there to catch "I didn't mean to change
    // that", and a per-field slot diff would bury the rest of the list.
    const beforeSlots = slotsLabel(savedSlotsRef.current);
    const afterSlots = slotsLabel(deliverySlots);
    if (beforeSlots !== afterSlots) {
      formDiff.push({ field: "Delivery Slots", before: beforeSlots, after: afterSlots });
    }

    const coordsLabel = (lat: number | null, lng: number | null) =>
      lat === null || lng === null ? "Not set" : `${lat}, ${lng}`;
    const beforeCoords = coordsLabel(savedCoordsRef.current.lat, savedCoordsRef.current.lng);
    const afterCoords = coordsLabel(storeLatitude, storeLongitude);
    if (beforeCoords !== afterCoords) {
      formDiff.push({ field: "Store Map Location", before: beforeCoords, after: afterCoords });
    }

    if (savedGeofenceRef.current !== attendanceGeofenceMeters) {
      formDiff.push({
        field: "Attendance Radius",
        before: `${savedGeofenceRef.current}m`,
        after: `${attendanceGeofenceMeters}m`,
      });
    }

    if (savedMaxDeliveriesRef.current !== maxConcurrentDeliveries) {
      formDiff.push({
        field: "Orders per Rider",
        before: String(savedMaxDeliveriesRef.current),
        after: String(maxConcurrentDeliveries),
      });
    }

    const beforeCities = citiesLabel(savedCitiesRef.current);
    const afterCities  = citiesLabel(cityDeliveries);
    const citiesDiff   = beforeCities !== afterCities ? { before: beforeCities, after: afterCities } : null;

    return { formDiff, citiesDiff };
  };

  const handleSaveClick = () => {
    if (!formData.name || !formData.pincode) { toast.error("Store name and pincode are required"); return; }
    if (cityDeliveries.length === 0) { toast.error("Add at least one serviceable area with a pincode and delivery time"); return; }
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const cityDeliveryTimesMap: Record<string, number> = {};
    const areaPincodesMap: Record<string, string> = {};
    const areaCitiesMap: Record<string, string> = {};
    cityDeliveries.forEach(({ area, minutes, pincode, areaCity }) => {
      cityDeliveryTimesMap[area] = minutes;
      areaPincodesMap[area] = pincode;
      areaCitiesMap[area] = areaCity;
    });

    setIsSaving(true);
    try {
      const { gst_rate_percent, ...formDataRest } = formData;
      const { data } = await axiosInstance.post(
        "/auth/api/update-store",
        {
          ...formDataRest,
          gst_rate: gst_rate_percent / 100,
          deliverySlotConfig: deliverySlots,
          maxConcurrentDeliveries,
          attendanceGeofenceMeters,
          // Both or neither — the schema rejects a lone coordinate, and a
          // half-set pin would silently break the attendance geofence.
          ...(storeLatitude !== null && storeLongitude !== null
            ? { latitude: storeLatitude, longitude: storeLongitude }
            : {}),
          availableCities: cityDeliveries.map((c) => c.area),
          cityDeliveryTimes: cityDeliveryTimesMap,
          areaPincodes: areaPincodesMap,
          areaCities: areaCitiesMap,
        },
        isProtected,
      );
      if (data.success) {
        setShowModal(false);
        savedSlotsRef.current = deliverySlots;
        savedMaxDeliveriesRef.current = maxConcurrentDeliveries;
        savedGeofenceRef.current = attendanceGeofenceMeters;
        savedCoordsRef.current = { lat: storeLatitude, lng: storeLongitude };
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

              {/* Map pin. Serviceability is still decided by pincode and area
                  lists — this is what distances get measured from: the rider
                  attendance geofence, and delivery distance per order. */}
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">Store Map Location</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    step="0.000001"
                    value={storeLatitude ?? ""}
                    onChange={(e) =>
                      setStoreLatitude(e.target.value === "" ? null : Number(e.target.value))
                    }
                    placeholder="Latitude"
                    className="w-40 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    value={storeLongitude ?? ""}
                    onChange={(e) =>
                      setStoreLongitude(e.target.value === "" ? null : Number(e.target.value))
                    }
                    placeholder="Longitude"
                    className="w-40 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) {
                        toast.error("This browser can't share a location");
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setStoreLatitude(Number(pos.coords.latitude.toFixed(6)));
                          setStoreLongitude(Number(pos.coords.longitude.toFixed(6)));
                          toast.success("Location captured — save to apply");
                        },
                        () => toast.error("Could not read your location"),
                        { enableHighAccuracy: true, timeout: 15000 },
                      );
                    }}
                    className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm text-gray-300 transition hover:border-blue-500 hover:text-white"
                  >
                    Use my current location
                  </button>
                </div>
                <p className="text-[11px] italic text-gray-500">
                  Set this from a device at the shop. Rider attendance check-in is measured
                  against it, and without it riders can&apos;t check in at all.
                </p>
              </div>
            </div>
          </div>

          {/* Support & Contact */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Headset className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Support & Contact</h2>
            </div>
            <p className="mb-5 -mt-2 text-xs text-gray-400">
              Shown to customers on their order details screen so they can reach you directly.
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Support Phone Number</label>
                <input
                  type="tel"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData((f) => ({ ...f, supportPhone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData((f) => ({ ...f, whatsappNumber: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">WhatsApp Chat Link (optional)</label>
                <input
                  type="text"
                  value={formData.whatsappLink}
                  onChange={(e) => setFormData((f) => ({ ...f, whatsappLink: e.target.value }))}
                  placeholder="Leave blank to auto-generate from the WhatsApp number above"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">WhatsApp Message Template (optional)</label>
                <textarea
                  value={formData.whatsappMessageTemplate}
                  onChange={(e) => setFormData((f) => ({ ...f, whatsappMessageTemplate: e.target.value }))}
                  placeholder="Leave blank to use the default order-details template (pre-filled with order ID, items, address and bill breakdown)."
                  rows={6}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono text-xs"
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Placeholders: <code>{"{{ORDER_ID}}"}</code> <code>{"{{ORDER_DATE}}"}</code>{" "}
                  <code>{"{{ORDER_STATUS}}"}</code> <code>{"{{STORE_NAME}}"}</code>{" "}
                  <code>{"{{CUSTOMER_NAME}}"}</code> <code>{"{{CUSTOMER_PHONE}}"}</code>{" "}
                  <code>{"{{DELIVERY_ADDRESS}}"}</code> <code>{"{{SUBTOTAL}}"}</code>{" "}
                  <code>{"{{DELIVERY_FEE}}"}</code> <code>{"{{DISCOUNT}}"}</code> <code>{"{{TAX}}"}</code>{" "}
                  <code>{"{{ORDER_AMOUNT}}"}</code> <code>{"{{CUSTOMER_MESSAGE}}"}</code>. Repeat a block per
                  item with <code>{"{{#ORDER_ITEMS}}...{{/ORDER_ITEMS}}"}</code>, using{" "}
                  <code>{"{{PRODUCT_NAME}}"}</code> <code>{"{{QUANTITY}}"}</code> <code>{"{{UNIT_PRICE}}"}</code>{" "}
                  <code>{"{{TOTAL_PRICE}}"}</code> inside it.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Support Email (optional)</label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData((f) => ({ ...f, supportEmail: e.target.value }))}
                  placeholder="support@yourstore.com"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Support Working Hours</label>
                <input
                  type="text"
                  value={formData.supportHours}
                  onChange={(e) => setFormData((f) => ({ ...f, supportHours: e.target.value }))}
                  placeholder="e.g. 9 AM – 9 PM, all days"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">Support Description</label>
                <textarea
                  value={formData.supportDescription}
                  onChange={(e) => setFormData((f) => ({ ...f, supportDescription: e.target.value }))}
                  placeholder="A short note shown alongside your support options"
                  rows={2}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">FAQ Link (optional)</label>
                <input
                  type="text"
                  value={formData.faqLink}
                  onChange={(e) => setFormData((f) => ({ ...f, faqLink: e.target.value }))}
                  placeholder="https://..."
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

          {/* Scheduled Delivery Slots */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Store className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Scheduled Delivery Slots</h2>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              Slots customers can book ahead. Each one takes a fixed number of orders per day —
              once it fills, it stops being offered for that day and customers see the next one.
              Instant delivery is configured above and is not capped this way.
            </p>
            <DeliverySlotEditor slots={deliverySlots} onChange={setDeliverySlots} />

            <div className="mt-6 border-t border-gray-700 pt-5">
              <label className="text-sm font-medium text-gray-300">
                Orders one rider can carry at once
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxConcurrentDeliveries}
                onChange={(e) =>
                  setMaxConcurrentDeliveries(
                    Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className="mt-1 w-full max-w-xs rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-[11px] italic text-gray-500">
                Lets a rider take several nearby drops in one trip. Set to 1 to go back to
                one delivery at a time.
              </p>

              <label className="mt-5 block text-sm font-medium text-gray-300">
                Attendance check-in radius (metres)
              </label>
              <input
                type="number"
                min={20}
                max={2000}
                value={attendanceGeofenceMeters}
                onChange={(e) =>
                  setAttendanceGeofenceMeters(
                    Math.min(2000, Math.max(20, Number(e.target.value) || 20)),
                  )
                }
                className="mt-1 w-full max-w-xs rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-[11px] italic text-gray-500">
                How close to the store map pin a rider must be to start their shift. Phone
                GPS is routinely 10–30m out, so set this from what your staff actually
                record — the Attendance page shows the measured distances.
              </p>
            </div>
          </div>

          {/* Bill Settings */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Store className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Bill Settings</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">GST Rate (%)</label>
                <input
                  type="number"
                  value={formData.gst_rate_percent}
                  onChange={(e) => setFormData((f) => ({ ...f, gst_rate_percent: Number(e.target.value) }))}
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 italic mt-1">Applied to the item subtotal on every order from this store.</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Packaging Charge (₹)</label>
                <input
                  type="number"
                  value={formData.packaging_charge}
                  onChange={(e) => setFormData((f) => ({ ...f, packaging_charge: Number(e.target.value) }))}
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 italic mt-1">Flat charge added to every order, regardless of size.</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={formData.base_delivery_charge}
                  onChange={(e) => setFormData((f) => ({ ...f, base_delivery_charge: Number(e.target.value) }))}
                  placeholder="e.g. 49"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 italic mt-1">Charged below the free-delivery threshold.</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  value={formData.free_delivery_threshold}
                  onChange={(e) => setFormData((f) => ({ ...f, free_delivery_threshold: Number(e.target.value) }))}
                  placeholder="e.g. 500"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 italic mt-1">Orders at or above this subtotal get free delivery.</p>
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-gray-700 pb-4">
              <MapPin className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Serviceable Areas</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Step 1 — register the city+pincode combos this store delivers to */}
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">Add a City & its Pincode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRegistryCity}
                    onChange={(e) => setNewRegistryCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCityPincode()}
                    placeholder="City (e.g. Ghaziabad)"
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newRegistryPincode}
                    onChange={(e) => setNewRegistryPincode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCityPincode()}
                    placeholder="Pincode (e.g. 201001)"
                    maxLength={6}
                    className="w-48 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCityPincode}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {cityPincodes.map((cp) => (
                    <div
                      key={cityPincodeKey(cp)}
                      className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                    >
                      {cp.city} · {cp.pincode}
                      <button
                        onClick={() => handleRemoveCityPincode(cp)}
                        className="text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2 — attach an area to one of the registered combos above */}
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Add Serviceable Area & Delivery Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
                    placeholder="Area (e.g. Kavi Nagar)"
                    className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={selectedCityPincode}
                    onChange={(e) => setSelectedCityPincode(e.target.value)}
                    className="w-56 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    disabled={cityPincodes.length === 0}
                  >
                    <option value="">
                      {cityPincodes.length === 0 ? "Add a city & pincode first" : "Select city & pincode"}
                    </option>
                    {cityPincodes.map((cp) => (
                      <option key={cityPincodeKey(cp)} value={cityPincodeKey(cp)}>
                        {cp.city} · {cp.pincode}
                      </option>
                    ))}
                  </select>
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
                  Each area must be pinned to a registered city & pincode — a single pincode
                  can span several areas in different cities with different real delivery
                  times (e.g. a Ghaziabad locality under a Noida store's pincode).
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {cityDeliveries.map(({ area, areaCity, pincode, minutes }) => (
                <div
                  key={area}
                  className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-300"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {area}
                  <span className="text-blue-400/80 text-xs">
                    · {areaCity || "no city"} · {pincode || "no pincode"}
                  </span>
                  <span className="flex items-center gap-0.5 text-blue-400/80 text-xs">
                    <Clock className="h-3 w-3" />
                    {minutes}m
                  </span>
                  <button
                    onClick={() => handleRemoveCity(area)}
                    className="ml-1 text-gray-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {cityDeliveries.length === 0 && (
                <p className="text-sm italic text-gray-500">No serviceable areas added yet.</p>
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
