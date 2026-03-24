"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Store, MapPin, Save, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";
import { isProtected } from "@/utils/protected";
import BreadCrumbs from "@/shared/components/breadcrumbs";

type CityDelivery = { city: string; minutes: number };

export default function SettingsPage() {
  const { seller, isLoading } = useSeller();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    address: "",
    city: "",
    pincode: "",
    opening_hours: "",
  });

  const [cityDeliveries, setCityDeliveries] = useState<CityDelivery[]>([]);
  const [newCity, setNewCity] = useState("");
  const [newMinutes, setNewMinutes] = useState("");

  useEffect(() => {
    if (seller?.store) {
      setFormData({
        name: seller.store.name || "",
        bio: seller.store.bio || "",
        address: seller.store.address || "",
        city: seller.store.city || "",
        pincode: seller.store.pincode || "",
        opening_hours: seller.store.opening_hours || "",
      });

      // Convert cityDeliveryTimes map back to array
      const cityDT = seller.store.cityDeliveryTimes as Record<string, number> | null;
      if (cityDT) {
        setCityDeliveries(
          Object.entries(cityDT).map(([city, minutes]) => ({ city, minutes }))
        );
      } else if (seller.store.availableCities?.length) {
        // Fallback: import cities without delivery time
        setCityDeliveries(
          seller.store.availableCities.map((c: string) => ({ city: c, minutes: 30 }))
        );
      }
    }
  }, [seller]);

  const handleAddCity = () => {
    const city = newCity.trim().replace(/\s+/g, " ");
    const mins = parseInt(newMinutes, 10);

    if (!city) { toast.error("Enter a city name"); return; }
    if (!/^[a-zA-Z\s]+$/.test(city)) {
      toast.error("City name should only contain letters and spaces");
      return;
    }
    if (isNaN(mins) || mins < 1 || mins > 300) {
      toast.error("Delivery time must be 1–300 minutes");
      return;
    }
    if (cityDeliveries.some((c) => c.city.toLowerCase() === city.toLowerCase())) {
      toast.error("City already added");
      return;
    }

    setCityDeliveries((prev) => [...prev, { city, minutes: mins }]);
    setNewCity("");
    setNewMinutes("");
  };

  const handleRemoveCity = (city: string) => {
    setCityDeliveries((prev) => prev.filter((c) => c.city !== city));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.pincode) {
      toast.error("Store name and pincode are required");
      return;
    }
    if (cityDeliveries.length === 0) {
      toast.error("Add at least one serviceable city with delivery time");
      return;
    }

    const cityDeliveryTimesMap: Record<string, number> = {};
    cityDeliveries.forEach(({ city, minutes }) => {
      cityDeliveryTimesMap[city] = minutes;
    });

    setIsSaving(true);
    try {
      const { data } = await axiosInstance.post(
        "/auth/api/update-store",
        {
          ...formData,
          availableCities: cityDeliveries.map((c) => c.city),
          cityDeliveryTimes: cityDeliveryTimesMap,
        },
        isProtected
      );
      if (data.success) {
        toast.success("Settings updated successfully!");
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

  return (
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
              <label className="text-sm font-medium text-gray-300">Opening Hours</label>
              <input
                type="text"
                value={formData.opening_hours}
                onChange={(e) => setFormData((f) => ({ ...f, opening_hours: e.target.value }))}
                placeholder="e.g. 8 AM – 8 PM"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
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

            {/* Add City + Delivery Time */}
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

          {/* City tags */}
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
              <p className="text-sm italic text-gray-500">
                No serviceable cities added yet.
              </p>
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
