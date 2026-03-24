import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { frontendEnv } from "@/config/env";
import { Plus, X, Clock } from "lucide-react";
import { toast } from "sonner";

type CityDelivery = { city: string; minutes: number };

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const [submitError, setSubmitError] = useState<string>("");
  const [cityDeliveries, setCityDeliveries] = useState<CityDelivery[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [minutesInput, setMinutesInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      bio: "",
      city: "",
      state: "",
      address: "",
      pincode: "",
      opening_hours: "",
      website: "",
      category: "",
    },
  });

  const bioValue = watch("bio");
  const countWords = (text: string) => text.trim().split(/\s+/).length;
  const wordCount = bioValue ? countWords(bioValue) : 0;

  const addCity = () => {
    const cleanCity = cityInput.trim().replace(/\s+/g, " ");
    const mins = parseInt(minutesInput, 10);

    if (!cleanCity) { toast.error("Enter a city name"); return; }
    if (!/^[a-zA-Z\s]+$/.test(cleanCity)) {
      toast.error("City name should only contain letters and spaces");
      return;
    }
    if (isNaN(mins) || mins < 1 || mins > 300) {
      toast.error("Delivery time must be 1–300 minutes");
      return;
    }
    if (cityDeliveries.some((c) => c.city.toLowerCase() === cleanCity.toLowerCase())) {
      toast.error("City already added");
      return;
    }

    setCityDeliveries([...cityDeliveries, { city: cleanCity, minutes: mins }]);
    setCityInput("");
    setMinutesInput("");
  };

  const removeCity = (index: number) => {
    setCityDeliveries(cityDeliveries.filter((_, i) => i !== index));
  };

  const shopCreateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Build cityDeliveryTimes map: { "Bathnaha": 20, "motipur": 10 }
      const cityDeliveryTimesMap: Record<string, number> = {};
      cityDeliveries.forEach(({ city, minutes }) => {
        cityDeliveryTimesMap[city] = minutes;
      });

      const shopData = {
        ...data,
        sellerId,
        state: data.state,
        availableCities: cityDeliveries.map((c) => c.city),
        cityDeliveryTimes: cityDeliveryTimesMap,
      };

      const response = await axios.post(
        `${frontendEnv.apiUrl}/auth/api/create-store`,
        shopData,
        { headers: { "Content-Type": "application/json" } },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Store created successfully!");
      window.location.href = "/";
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        setSubmitError(
          error.response?.data?.message ||
          error.message ||
          "Failed to create shop. Please try again.",
        );
      } else {
        setSubmitError("An unexpected error occurred. Please check the console.");
      }
      console.error("Create shop error:", error);
    },
  });

  const onSubmit = async (data: any) => {
    if (cityDeliveries.length === 0) {
      toast.error("Please add at least one serviceable city with delivery time");
      return;
    }
    setSubmitError("");
    shopCreateMutation.mutate(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1 py-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4 text-gray-900 font-inter">
          Setup new shop
        </h3>

        {/* Shop Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
          <input
            type="text"
            placeholder="e.g. Fresh Meat Co."
            className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm transition-all focus:border-blue-500 font-inter"
            {...register("name", {
              required: "Shop name is required",
              minLength: { value: 2, message: "Shop name must be at least 2 characters" },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>
          )}
        </div>

        {/* Shop Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio (Max 100 words) *{" "}
            {wordCount > 0 && (
              <span className="text-gray-400 font-normal">({wordCount}/100)</span>
            )}
          </label>
          <textarea
            placeholder="Tell customers about your shop..."
            className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm resize-none focus:border-blue-500 font-inter"
            rows={3}
            {...register("bio", {
              required: "Shop bio is required",
              validate: (value) => countWords(value) <= 100 || "Bio cannot exceed 100 words",
            })}
          />
          {errors.bio && (
            <p className="text-red-500 text-xs mt-1">{String(errors.bio.message)}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              placeholder="e.g. Muzaffarpur"
              className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
              {...register("city", { required: "City is required" })}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{String(errors.city.message)}</p>
            )}
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="842001"
              maxLength={6}
              className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
              {...register("pincode", {
                required: "Pincode is required",
                pattern: { value: /^[1-9][0-9]{5}$/, message: "Invalid Pincode" },
              })}
            />
            {errors.pincode && (
              <p className="text-red-500 text-xs mt-1">{String(errors.pincode.message)}</p>
            )}
          </div>
        </div>

        {/* State */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <input
            type="text"
            placeholder="e.g. Bihar"
            className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
            {...register("state", { required: "State is required" })}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{String(errors.state.message)}</p>
          )}
        </div>

        {/* Serviceable Cities with Delivery Time */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serviceable Areas & Delivery Times *
          </label>
          <p className="text-xs text-gray-400 mb-2">Add each area/locality your shop delivers to, with average delivery time</p>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Area name (e.g. Bathnaha)"
              className="flex-1 p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              min={1}
              max={300}
              className="w-20 p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
              value={minutesInput}
              onChange={(e) => setMinutesInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
            />
            <button
              type="button"
              onClick={addCity}
              className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {cityDeliveries.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No service cities added yet</p>
            ) : (
              cityDeliveries.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200"
                >
                  {c.city}
                  <span className="flex items-center gap-0.5 text-blue-500">
                    <Clock size={10} />
                    {c.minutes}m
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCity(i)}
                    className="text-blue-400 hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Address *</label>
          <input
            type="text"
            placeholder="Street name, landmark..."
            className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{String(errors.address.message)}</p>
          )}
        </div>

        {/* Opening Hours */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours *</label>
          <input
            type="text"
            placeholder="e.g. 9 AM - 9 PM"
            className="w-full p-2.5 border border-gray-300 outline-0 rounded-lg text-sm focus:border-blue-500 font-inter"
            {...register("opening_hours", { required: "Opening hours required" })}
          />
          {errors.opening_hours && (
            <p className="text-red-500 text-xs mt-1">{String(errors.opening_hours.message)}</p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-xs text-center font-medium">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || shopCreateMutation.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-inter"
        >
          {shopCreateMutation.isPending ? "Creating Store..." : "Create Store"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
