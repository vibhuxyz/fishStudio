"use client";

import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Search,
  Home,
  Briefcase,
  MoreHorizontal,
  Navigation,
  Pencil,
  Trash2,
  Plus,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddressStore,
  getNearbyAddresses,
  PINCODE_AREA_MAP,
  type Address,
  type AddressType,
} from "@/lib/address-store";
import { toast } from "sonner";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, only shows the saved-addresses list (for cart "Change" button) */
  savedAddressesOnly?: boolean;
}

type ModalView = "list" | "pincode" | "add";

const ADDRESS_TYPE_ICONS: Record<AddressType, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  Work: <Briefcase className="h-5 w-5" />,
  Other: <MoreHorizontal className="h-5 w-5" />,
};

export function AddressModal({ open, onOpenChange, savedAddressesOnly = false }: AddressModalProps) {
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress } =
    useAddressStore();

  const [view, setView] = useState<ModalView>("list");
  const [pincode, setPincode] = useState("");
  const [pincodeValid, setPincodeValid] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [nearbyAddresses, setNearbyAddresses] = useState<{ address: string; distance: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [detecting, setDetecting] = useState(false);

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

  // Reset view on open
  useEffect(() => {
    if (open) {
      setView("list");
      setPincode("");
      setPincodeValid(false);
      setPincodeError("");
      setNearbyAddresses([]);
      setSearchQuery("");
      setForm({ label: "Home", name: "", phone: "", street: "", landmark: "", area: "", city: "", state: "", pincode: "" });
    }
  }, [open]);

  const handlePincodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setPincodeError("");
    setPincodeValid(false);
    setNearbyAddresses([]);
  };

  const handleValidatePincode = () => {
    if (pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    const nearby = getNearbyAddresses(pincode);
    if (nearby.length === 0) {
      setPincodeError("Sorry, we don't deliver to this pincode yet");
      return;
    }
    setPincodeValid(true);
    setNearbyAddresses(nearby);
    const areaInfo = PINCODE_AREA_MAP[pincode]?.[0];
    if (areaInfo) {
      setForm((f) => ({ ...f, area: areaInfo.area, city: areaInfo.city, state: areaInfo.state, pincode }));
    }
  };

  const handleDetectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      setDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        toast.success("Location detected!");
        setPincode("400002");
        setPincodeValid(true);
        setNearbyAddresses(getNearbyAddresses("400002"));
        setForm((f) => ({ ...f, area: "Marine Lines", city: "Mumbai", state: "Maharashtra", pincode: "400002" }));
        setView("pincode");
        setDetecting(false);
      },
      () => {
        toast.error("Unable to detect location. Please enter manually.");
        setDetecting(false);
      }
    );
  };

  const handleSelectNearby = (address: string) => {
    const parts = address.split(",");
    setForm((f) => ({ ...f, street: parts[0]?.trim() || "" }));
    setView("add");
  };

  const handleSaveAddress = () => {
    if (!form.name || !form.phone || !form.street || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    addAddress(form);
    toast.success("Address saved successfully");
    onOpenChange(false);
  };

  const filteredAddresses = addresses.filter((a) =>
    searchQuery
      ? `${a.street} ${a.area} ${a.city} ${a.name}`.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (!open) return null;

  const getBackView = (): ModalView => {
    if (view === "add") return "pincode";
    return "list";
  };

  const getTitle = () => {
    if (view === "list") return savedAddressesOnly ? "Deliver to" : "Change Location";
    if (view === "pincode") return "Enter Pincode";
    return "Add New Address";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40"
            onClick={() => onOpenChange(false)}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-lg rounded-t-3xl bg-background shadow-2xl"
            style={{ maxHeight: "90dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-12 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                {view !== "list" && (
                  <button
                    type="button"
                    onClick={() => setView(getBackView())}
                    className="mr-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="text-lg font-bold text-foreground">{getTitle()}</h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(90dvh - 90px)" }}>

              {/* === LIST VIEW === */}
              {view === "list" && (
                <div className="space-y-4">
                  {/* Only show detect+add when not in savedAddressesOnly mode */}
                  {!savedAddressesOnly && (
                    <>
                      <div className="flex items-center gap-3">
                        <Button
                          className="flex-1 gap-2 bg-offer-green text-white hover:bg-offer-green/90"
                          onClick={handleDetectLocation}
                          disabled={detecting}
                        >
                          <Navigation className="h-4 w-4" />
                          {detecting ? "Detecting..." : "Detect my location"}
                        </Button>
                        <div className="flex flex-shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="h-px w-5 bg-border" />
                          OR
                          <div className="h-px w-5 bg-border" />
                        </div>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => setView("pincode")}
                        >
                          <Plus className="h-4 w-4" />
                          Add new
                        </Button>
                      </div>

                      {/* Search bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search delivery location"
                          className="h-11 rounded-full border-border pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Saved addresses */}
                  {filteredAddresses.length > 0 ? (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-foreground">Your saved addresses</p>
                      <div className="space-y-2">
                        {filteredAddresses.map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={address.id === selectedAddressId}
                            onSelect={() => {
                              selectAddress(address.id);
                              onOpenChange(false);
                              toast.success(`Delivering to ${address.label}`);
                            }}
                            onRemove={() => removeAddress(address.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MapPin className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No saved addresses yet</p>
                      {!savedAddressesOnly && (
                        <Button
                          variant="outline"
                          className="mt-3 gap-2"
                          onClick={() => setView("pincode")}
                        >
                          <Plus className="h-4 w-4" />
                          Add your first address
                        </Button>
                      )}
                    </div>
                  )}

                  {savedAddressesOnly && (
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 p-3 text-sm font-medium text-primary hover:bg-primary/5"
                      onClick={() => setView("pincode")}
                    >
                      <Plus className="h-4 w-4" />
                      Add new address
                    </button>
                  )}
                </div>
              )}

              {/* === PINCODE VIEW === */}
              {view === "pincode" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your 6-digit pincode to find serviceable addresses in your area (within 2 km)
                  </p>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter 6-digit pincode"
                      className="h-11 flex-1 text-base font-medium tracking-widest"
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      maxLength={6}
                      inputMode="numeric"
                      onKeyDown={(e) => e.key === "Enter" && handleValidatePincode()}
                    />
                    <Button
                      className="bg-offer-green text-white hover:bg-offer-green/90"
                      onClick={handleValidatePincode}
                      disabled={pincode.length !== 6}
                    >
                      Check
                    </Button>
                  </div>

                  {pincodeError && (
                    <p className="text-sm text-destructive">{pincodeError}</p>
                  )}

                  {pincodeValid && nearbyAddresses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        Nearby addresses in {pincode} (within 2 km)
                      </p>
                      {nearbyAddresses.map((item) => (
                        <button
                          key={item.address}
                          type="button"
                          onClick={() => handleSelectNearby(item.address)}
                          className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left hover:border-primary/40 hover:bg-primary/5"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.address}</p>
                              <p className="text-xs text-muted-foreground">{item.distance} away</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        </button>
                      ))}

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 p-3 text-sm font-medium text-primary hover:bg-primary/5"
                        onClick={() => setView("add")}
                      >
                        <Plus className="h-4 w-4" />
                        Enter address manually
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* === ADD ADDRESS VIEW === */}
              {view === "add" && (
                <div className="space-y-4">
                  {/* Address type */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Address type</p>
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
                      <label className="mb-1 block text-xs font-medium text-foreground">Full Name *</label>
                      <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-foreground">Phone Number *</label>
                      <Input
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-foreground">House / Street / Flat *</label>
                      <Input placeholder="Flat 3B, Marine Drive" value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-foreground">Landmark (Optional)</label>
                      <Input placeholder="Near Fish Market" value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Area</label>
                      <Input placeholder="Marine Lines" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">Pincode</label>
                      <Input
                        placeholder="400002"
                        value={form.pincode}
                        readOnly={!!pincode}
                        className={pincode ? "bg-muted" : ""}
                        onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">City</label>
                      <Input placeholder="Mumbai" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-foreground">State</label>
                      <Input placeholder="Maharashtra" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
                    </div>
                  </div>

                  <Button className="w-full bg-offer-green text-white hover:bg-offer-green/90" onClick={handleSaveAddress}>
                    Save Address
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
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
    <div
      className={`relative rounded-xl border p-3 transition-colors ${
        isSelected ? "border-offer-green bg-offer-green/5" : "border-border bg-background"
      }`}
    >
      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={onSelect}>
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
            isSelected ? "bg-offer-green/15 text-offer-green" : "bg-muted text-muted-foreground"
          }`}
        >
          {ADDRESS_TYPE_ICONS[address.label]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{address.label}</p>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-offer-green" />}
          </div>
          <p className="mt-0.5 truncate text-xs leading-relaxed text-muted-foreground">
            {address.name}, {address.street}
            {address.landmark ? `, ${address.landmark}` : ""}, {address.area}, {address.city}
          </p>
        </div>
      </button>
      <div className="mt-2 flex items-center gap-3 pl-[52px]">
        <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  );
}
