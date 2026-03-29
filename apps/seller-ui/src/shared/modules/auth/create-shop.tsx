import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { frontendEnv } from "@/config/env";
import { Plus, X, Clock, Store, MapPin, Globe, Briefcase, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui";

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
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      bio: "",
      city: "",
      state: "",
      address: "",
      pincode: "",
      opening_hours: "",
      closing_hours: "",
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
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        },
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

  const inputStyles = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium text-sm";
  const labelStyles = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 mb-2";

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-4">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Store size={32} />
          </div>
          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Store Config
          </h3>
          <p className="text-slate-500 text-sm font-medium italic">
            Defining your commercial operational matrix
          </p>
        </div>

        {/* Core Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
             <Briefcase size={12} className="text-emerald-500" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Core Identity</h4>
          </div>
          
          <div className="space-y-2">
            <label className={labelStyles}>Shop Name *</label>
            <input
              type="text"
              placeholder="e.g. Fresh Meat Co."
              className={inputStyles}
              {...register("name", {
                required: "Shop name is required",
                minLength: { value: 2, message: "Shop name must be at least 2 characters" },
              })}
            />
            {errors.name && (
              <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelStyles}>
              Professional Bio *{" "}
              {wordCount > 0 && (
                <span className="text-emerald-500/50">({wordCount}/100)</span>
              )}
            </label>
            <textarea
              placeholder="Tell customers about your shop's heritage and mission..."
              className={`${inputStyles} resize-none h-32`}
              {...register("bio", {
                required: "Shop bio is required",
                validate: (value) => countWords(value) <= 100 || "Bio cannot exceed 100 words",
              })}
            />
            {errors.bio && (
              <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{String(errors.bio.message)}</p>
            )}
          </div>
        </div>

        {/* Geospatial Matrix Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 px-1">
             <MapPin size={12} className="text-emerald-500" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Geospatial Matrix</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelStyles}>Base City *</label>
              <input
                type="text"
                placeholder="Muzaffarpur"
                className={inputStyles}
                {...register("city", { required: "City is required" })}
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Pincode *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="842001"
                maxLength={6}
                className={inputStyles}
                {...register("pincode", {
                  required: "Pincode is required",
                  pattern: { value: /^[1-9][0-9]{5}$/, message: "Invalid Pincode" },
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelStyles}>State / Region *</label>
            <input
              type="text"
              placeholder="Bihar"
              className={inputStyles}
              {...register("state", { required: "State is required" })}
            />
          </div>

          <div className="space-y-2">
            <label className={labelStyles}>Operational Headquarters *</label>
            <input
              type="text"
              placeholder="Street name, landmark..."
              className={inputStyles}
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{String(errors.address.message)}</p>
            )}
          </div>
        </div>

        {/* Logistics Stream Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 px-1">
             <Globe size={12} className="text-emerald-500" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Logistics Stream</h4>
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
            <div className="space-y-2">
              <label className={labelStyles}>Service Nodes & Latency</label>
              <p className="text-[10px] text-slate-500 mb-4 italic font-medium">Add locations and average delivery latency (minutes)</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Area Name"
                  className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium text-sm"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Mins"
                  className="w-24 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600 text-white font-medium text-sm"
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
                />
                <button
                  type="button"
                  onClick={addCity}
                  className="w-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-12 items-center">
              <AnimatePresence>
                {cityDeliveries.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-slate-600 italic font-medium ml-2"
                  >
                    No active service nodes defined...
                  </motion.p>
                ) : (
                  cityDeliveries.map((c, i) => (
                    <motion.div
                      key={c.city}
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 10 }}
                      className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 backdrop-blur-md group"
                    >
                      <span>{c.city}</span>
                      <div className="w-1 h-3 bg-emerald-500/20 mx-1" />
                      <Clock size={10} className="text-emerald-500/50" />
                      <span>{c.minutes}M</span>
                      <button
                        type="button"
                        onClick={() => removeCity(i)}
                        className="ml-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Operational Timeline Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 px-1">
             <Clock size={12} className="text-emerald-500" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Operational Timeline</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelStyles}>Opening Hours *</label>
              <div className="relative">
                <input
                  type="time"
                  className={`${inputStyles} cursor-pointer appearance-none`}
                  {...register("opening_hours", { required: "Opening time required" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>Closing Hours *</label>
              <div className="relative">
                <input
                  type="time"
                  className={`${inputStyles} cursor-pointer appearance-none`}
                  {...register("closing_hours", { required: "Closing time required" })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6"
              >
                <p className="text-rose-500 text-[10px] font-black text-center uppercase tracking-widest italic">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting || shopCreateMutation.isPending || cityDeliveries.length === 0}
            isLoading={shopCreateMutation.isPending}
            loaderLabel="Encrypting Matrix..."
            variant="emerald"
          >
            Initialize System 
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateShop;
