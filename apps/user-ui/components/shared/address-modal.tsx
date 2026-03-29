"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Home,
  Briefcase,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Navigation,
  Search,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddressStore,
  type Address,
  type AddressType,
  type SelectedLocation,
} from "@/lib/address-store";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedAddressesOnly?: boolean;
}

type ModalView = "list" | "pincode" | "add";

const ADDRESS_TYPE_ICONS: Record<AddressType, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  Work: <Briefcase className="h-5 w-5" />,
  Other: <MoreHorizontal className="h-5 w-5" />,
};

interface StoreInfo {
  id: string;
  name: string;
  city: string;
  state?: string;
  availableCities: string[];
  cityDeliveryTimes?: Record<string, number>;
}

export function AddressModal({
  open,
  onOpenChange,
  savedAddressesOnly = false,
}: AddressModalProps) {
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress, setAddresses } =
    useAddressStore();
  const { setSelectedLocation } = useAddressStore();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const [view, setView] = useState<ModalView>("list");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  /** Select a saved address and resolve its store for product/banner filtering */
  const handleSelectSavedAddress = async (address: Address) => {
    // 1. Mark as selected address immediately
    selectAddress(address.id);

    // 2. Clear stale location and invalidate queries immediately
    // Update selectedLocation with at least the pincode so header can show "soon" or try to resolve
    setSelectedLocation({
      storeId: "",
      storeName: "",
      pincode: address.pincode,
      city: address.city,
    });

    // Invalidate queries to refresh store-specific data
    queryClient.invalidateQueries({ queryKey: ["store"] });
    queryClient.invalidateQueries({ queryKey: ["storefront"] });

    onOpenChange(false);
    toast.success(`Delivering to ${address.label}`);

    // 3. Resolve the actual store for this address's pincode in the background
    try {
      const res = await axiosInstance.get(`/auth/api/check-pincode?pincode=${address.pincode}`);
      const data = res.data;
      if (data.success && data.store) {
        const city = address.city || data.store.availableCities?.[0] || "";
        setSelectedLocation({
          storeId: data.store.id,
          storeName: data.store.name,
          pincode: address.pincode,
          city,
          deliveryTimeMinutes: data.store.cityDeliveryTimes?.[city],
          isOpen: data.store.isOpen,
          opening_hours: data.store.opening_hours,
        });
        // Refetch store queries now that we have the full store data
        queryClient.invalidateQueries({ queryKey: ["store"] });
      }
    } catch {
      // API failed — selectedLocation stays with just pincode
    }
  };
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [serviceableCities, setServiceableCities] = useState<string[]>([]);
  const [serviceablePincodes, setServiceablePincodes] = useState<string[]>([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  // Pre-fill for add form when coming from city selection
  const [prefilledCity, setPrefilledCity] = useState("");
  const [prefilledDeliveryMins, setPrefilledDeliveryMins] = useState<number | undefined>();

  // All cities (primary + available), deduped
  const allCities = storeInfo
    ? storeInfo.availableCities
    : [];

  const filteredCities = locationSearchQuery.trim()
    ? allCities.filter((c) =>
        c.toLowerCase().includes(locationSearchQuery.toLowerCase())
      )
    : allCities;

  const [form, setForm] = useState({
    label: "Home" as AddressType,
    name: "",
    phone: "",
    street: "",
    landmark: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });

  const pincodeInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setView(savedAddressesOnly && addresses.length > 0 ? "list" : "pincode");
      setPincode("");
      setPincodeError("");
      setLoading(false);
      setStoreInfo(null);
      setServiceableCities([]);
      setServiceablePincodes([]);
      setLocationSearchQuery("");
      setPrefilledCity("");
      setPrefilledDeliveryMins(undefined);
      setForm({
        label: "Home",
        name: "",
        phone: "",
        street: "",
        landmark: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  }, [open, savedAddressesOnly]);

  const handlePincodeInput = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setPincodeError("");
    setStoreInfo(null);
    setServiceableCities([]);
    setServiceablePincodes([]);
    setLocationSearchQuery("");
  };

  const handleCheckPincode = async () => {
    if (pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    setLoading(true);
    setPincodeError("");
    setStoreInfo(null);
    setServiceableCities([]);
    setServiceablePincodes([]);

    try {
      const res = await axiosInstance.get(`/auth/api/check-pincode?pincode=${pincode}`);
      const data = res.data;

      if (data.success && data.store) {
        setStoreInfo(data.store);
      } else {
        // Fetch serviceable areas for suggestion
        try {
          const areasRes = await axiosInstance.get("/auth/api/serviceable-areas");
          if (areasRes.data.success) {
            setServiceableCities(areasRes.data.cities || []);
            setServiceablePincodes(areasRes.data.pincodes || []);
          }
        } catch (_) {}
        setPincodeError("coming-soon");
      }
    } catch (err: any) {
      setPincodeError(err.response?.data?.message || "Failed to check pincode. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: string) => {
    if (!storeInfo) return;
    const deliveryMins = storeInfo.cityDeliveryTimes?.[city];

    // Save the selected location immediately so products/banners load
    const location: SelectedLocation = {
      storeId: storeInfo.id,
      storeName: storeInfo.name,
      pincode,
      city,
      deliveryTimeMinutes: deliveryMins,
      isOpen: (storeInfo as any).isOpen,
      opening_hours: (storeInfo as any).opening_hours,
    };
    setSelectedLocation(location);
    queryClient.invalidateQueries({ queryKey: ["store"] });
    queryClient.invalidateQueries({ queryKey: ["storefront"] });

    // Close modal immediately — products & banners update based on pincode
    onOpenChange(false);
    toast.success(`Delivering to ${city}`, {
      description: deliveryMins ? `Estimated delivery in ~${deliveryMins} min` : undefined,
    });
  };

  const handleEnterManually = () => {
    // Also set the location so products load while user fills the form
    if (storeInfo) {
      const city = storeInfo.availableCities?.[0] || storeInfo.city || "";
      const deliveryMins = storeInfo.cityDeliveryTimes?.[city];
      setSelectedLocation({
        storeId: storeInfo.id,
        storeName: storeInfo.name,
        pincode,
        city,
        deliveryTimeMinutes: deliveryMins,
        isOpen: (storeInfo as any).isOpen,
        opening_hours: (storeInfo as any).opening_hours,
      });
    }
    setForm((f) => ({
      ...f,
      pincode,
      city: storeInfo?.city || "",
      state: storeInfo?.state || "",
    }));
    setView("add");
  };

  const handleSaveAddress = async () => {
    if (!form.name || !form.phone || !form.street || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isLoggedIn) {
      toast.error("Please log in to save addresses");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/api/add-address", {
        address: { ...form, isDefault: addresses.length === 0 },
      });
      if (data.success) {
        setAddresses(data.addresses);
        toast.success("Address saved!");
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (view === "list") return savedAddressesOnly ? "Deliver to" : "My Addresses";
    if (view === "pincode") return "Enter Pincode";
    return "Add New Address";
  };

  const getBackView = (): ModalView => {
    if (view === "add") return "pincode";
    return "list";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl"
              style={{ maxHeight: "90dvh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  {view !== "list" && (
                    <button
                      type="button"
                      onClick={() => setView(getBackView())}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-foreground">{getTitle()}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "calc(90dvh - 70px)" }}>

                {/* ===== PINCODE VIEW ===== */}
                {view === "pincode" && (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Enter your 6-digit pincode to find serviceable addresses in your area.
                    </p>

                    {/* Pincode input */}
                    <div className="flex gap-2">
                      <Input
                        ref={pincodeInputRef}
                        placeholder="e.g. 843111"
                        className="h-12 flex-1 text-base font-semibold tracking-widest"
                        value={pincode}
                        onChange={(e) => handlePincodeInput(e.target.value)}
                        maxLength={6}
                        inputMode="numeric"
                        onKeyDown={(e) => e.key === "Enter" && handleCheckPincode()}
                        autoFocus
                      />
                      <Button
                        className="h-12 bg-offer-green px-5 text-white hover:bg-offer-green/90 font-bold"
                        onClick={handleCheckPincode}
                        disabled={pincode.length !== 6 || loading}
                      >
                        {loading ? "Checking..." : "Check"}
                      </Button>
                    </div>

                    {/* Detect / Search buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-offer-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-offer-green/90"
                        onClick={() => toast.info("Location detection not available. Please enter pincode.")}
                      >
                        <Navigation className="h-4 w-4" />
                        Detect my location
                      </button>
                      <span className="text-xs font-medium text-muted-foreground">OR</span>
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                        onClick={() => toast.info("Please use pincode to search your area.")}
                      >
                        <Search className="h-4 w-4" />
                        Search location
                      </button>
                    </div>

                    {/* Saved Addresses (Shortcut in Pincode View) */}
                    {addresses.length > 0 && !storeInfo && !pincodeError && (
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-foreground truncate">Saved Addresses</p>
                          <button 
                            onClick={() => setView("list")}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View All
                          </button>
                        </div>
                        <div className="space-y-3">
                          {addresses.slice(0, 2).map((address) => (
                            <AddressCard
                              key={address.id}
                              address={address}
                              isSelected={address.id === selectedAddressId}
                              onSelect={() => handleSelectSavedAddress(address)}
                              onRemove={async () => {
                                try {
                                  const { data } = await axiosInstance.delete(
                                    `/auth/api/delete-address/${address.id}`
                                  );
                                  if (data.success) {
                                    setAddresses(data.addresses);
                                    toast.success("Address removed");
                                  }
                                } catch {
                                  toast.error("Failed to remove address");
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coming soon */}
                    {pincodeError === "coming-soon" && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                          <div>
                            <p className="font-semibold text-amber-800 text-sm">Coming Soon to your area!</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              We don&apos;t deliver to <strong>{pincode}</strong> yet.
                            </p>
                          </div>
                        </div>
                        {serviceablePincodes.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-amber-800 mb-2">We currently serve (Pincodes):</p>
                            <div className="flex flex-wrap gap-1.5">
                              {serviceablePincodes.slice(0, 14).map((pin) => (
                                <span key={pin} className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                  {pin}
                                </span>
                              ))}
                              {serviceablePincodes.length > 14 && (
                                <span className="text-xs text-amber-600 self-center">+{serviceablePincodes.length - 14} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generic error */}
                    {pincodeError && pincodeError !== "coming-soon" && (
                      <p className="text-sm font-medium text-destructive">{pincodeError}</p>
                    )}

                    {/* Serviceable cities list (after check success) */}
                    {storeInfo && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-foreground">
                            Nearby areas in {pincode}
                          </p>
                          {allCities.length >= 4 && (
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="text"
                                placeholder="Search..."
                                value={locationSearchQuery}
                                onChange={(e) => setLocationSearchQuery(e.target.value)}
                                className="h-8 rounded-lg border border-border bg-muted/50 pl-8 pr-3 text-xs outline-none focus:border-primary/50"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {filteredCities.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">No areas match</p>
                          ) : (
                            filteredCities.map((city) => {
                              const mins = storeInfo.cityDeliveryTimes?.[city];
                              return (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => handleSelectCity(city)}
                                  className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-left transition-colors hover:border-offer-green/40 hover:bg-offer-green/5"
                                >
                                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MapPin className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-foreground">{city}</p>
                                    {mins && (
                                      <p className="flex items-center gap-1 text-xs text-offer-green font-medium mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        ~{mins} min delivery
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                </button>
                              );
                            })
                          )}
                        </div>

                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                          onClick={handleEnterManually}
                        >
                          <Plus className="h-4 w-4" />
                          Enter address manually
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== LIST VIEW ===== */}
                {view === "list" && (
                  <div className="space-y-4">
                    {addresses.length > 0 ? (
                      <>
                        <p className="text-sm font-semibold text-foreground">Your saved addresses</p>
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <AddressCard
                              key={address.id}
                              address={address}
                              isSelected={address.id === selectedAddressId}
                              onSelect={() => handleSelectSavedAddress(address)}
                              onRemove={async () => {
                                try {
                                  const { data } = await axiosInstance.delete(
                                    `/auth/api/delete-address/${address.id}`
                                  );
                                  if (data.success) {
                                    setAddresses(data.addresses);
                                    toast.success("Address removed");
                                  }
                                } catch {
                                  toast.error("Failed to remove address");
                                }
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No saved addresses yet</p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 p-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                      onClick={() => setView("pincode")}
                    >
                      <Plus className="h-4 w-4" />
                      Add new address
                    </button>
                  </div>
                )}

                {/* ===== ADD ADDRESS FORM ===== */}
                {view === "add" && (
                  <div className="space-y-5">
                    {/* Delivery time badge if set */}
                    {prefilledDeliveryMins && (
                      <div className="flex items-center gap-2 rounded-xl bg-offer-green/10 border border-offer-green/20 px-4 py-2.5">
                        <Clock className="h-4 w-4 text-offer-green flex-shrink-0" />
                        <p className="text-sm font-medium text-offer-green">
                          ~{prefilledDeliveryMins} min delivery to {prefilledCity}
                        </p>
                      </div>
                    )}

                    {/* Address type */}
                    <div>
                      <p className="mb-2 text-sm font-semibold text-foreground">Address type</p>
                      <div className="flex gap-2">
                        {(["Home", "Work", "Other"] as AddressType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, label: type }))}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                              form.label === type
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {ADDRESS_TYPE_ICONS[type]}
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">Full Name *</label>
                        <Input
                          placeholder="John Doe"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">Phone Number *</label>
                        <Input
                          placeholder="9876543210"
                          inputMode="numeric"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                            }))
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">House / Street / Flat *</label>
                        <Input
                          placeholder="Flat 3B, Marine Drive"
                          value={form.street}
                          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-foreground">Landmark (Optional)</label>
                        <Input
                          placeholder="Near Fish Market"
                          value={form.landmark}
                          onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Area</label>
                        <Input
                          placeholder="Marine Lines"
                          value={form.area}
                          onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">Pincode *</label>
                        <Input
                          placeholder="400002"
                          inputMode="numeric"
                          value={form.pincode}
                          readOnly={!!pincode}
                          className={pincode ? "bg-muted" : ""}
                          onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">City *</label>
                        <Select
                          value={form.city}
                          onValueChange={(val) => setForm((f) => ({ ...f, city: val }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            {allCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-foreground">State</label>
                        <Input
                          placeholder="Bihar"
                          value={form.state}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>

                      <Button
                        className="w-full h-12 bg-offer-green text-white hover:bg-offer-green/90 font-bold text-base rounded-xl"
                        onClick={handleSaveAddress}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Address"}
                      </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function AddressCard({
  address,
  isSelected,
  onSelect,
  onRemove,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={`relative rounded-xl border transition-colors ${
      isSelected ? "border-offer-green bg-offer-green/5" : "border-border bg-background hover:border-primary/30"
    }`}>
      <button type="button" className="flex w-full items-start gap-3 p-4 text-left" onClick={onSelect}>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
          isSelected ? "bg-offer-green/15 text-offer-green" : "bg-muted text-muted-foreground"
        }`}>
          {ADDRESS_TYPE_ICONS[address.label]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-foreground">{address.label}</p>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-offer-green" />}
          </div>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {address.name}, {address.street}
            {address.landmark ? `, ${address.landmark}` : ""}
            {", "}
            {address.area} {address.city}
          </p>
        </div>
      </button>
      <div className="flex gap-2 px-4 pb-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {!isSelected && (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
