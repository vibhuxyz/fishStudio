"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
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
  /** When true, only shows saved addresses list (for cart "Change" button) */
  savedAddressesOnly?: boolean;
}

// Views:
// "list"    => saved addresses (used by savedAddressesOnly + main header when addresses exist)
// "pincode" => enter pincode first, then unlock detect/search/nearby
// "add"     => fill address form
type ModalView = "list" | "pincode" | "add";

const ADDRESS_TYPE_ICONS: Record<AddressType, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  Work: <Briefcase className="h-5 w-5" />,
  Other: <MoreHorizontal className="h-5 w-5" />,
};

export function AddressModal({
  open,
  onOpenChange,
  savedAddressesOnly = false,
}: AddressModalProps) {
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress } =
    useAddressStore();

  const [view, setView] = useState<ModalView>("list");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeServiceable, setPincodeServiceable] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [nearbyList, setNearbyList] = useState<{ address: string; distance: string }[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Reset state whenever the modal opens
  useEffect(() => {
    if (open) {
      // For savedAddressesOnly (cart), start on list
      // For normal open, start on pincode (user must check coverage first)
      setView(savedAddressesOnly ? "list" : "pincode");
      setPincode("");
      setPincodeChecked(false);
      setPincodeServiceable(false);
      setPincodeError("");
      setNearbyList([]);
      setSearchQuery("");
      setDetecting(false);
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
    setPincodeChecked(false);
    setPincodeServiceable(false);
    setNearbyList([]);
  };

  const handleCheckPincode = () => {
    if (pincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    const nearby = getNearbyAddresses(pincode);
    setPincodeChecked(true);
    if (nearby.length === 0) {
      setPincodeServiceable(false);
      setPincodeError("Sorry, we don't deliver to this pincode yet.");
      return;
    }
    setPincodeServiceable(true);
    setNearbyList(nearby);
    const areaInfo = PINCODE_AREA_MAP[pincode]?.[0];
    if (areaInfo) {
      setForm((f) => ({
        ...f,
        area: areaInfo.area,
        city: areaInfo.city,
        state: areaInfo.state,
        pincode,
      }));
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
        const detected = "400002";
        toast.success("Location detected!");
        setPincode(detected);
        setPincodeChecked(true);
        setPincodeServiceable(true);
        const nearby = getNearbyAddresses(detected);
        setNearbyList(nearby);
        const areaInfo = PINCODE_AREA_MAP[detected]?.[0];
        if (areaInfo) {
          setForm((f) => ({
            ...f,
            area: areaInfo.area,
            city: areaInfo.city,
            state: areaInfo.state,
            pincode: detected,
          }));
        }
        setDetecting(false);
      },
      () => {
        toast.error("Unable to detect location. Please enter pincode manually.");
        setDetecting(false);
      }
    );
  };

  const handleSelectNearby = (address: string) => {
    const parts = address.split(",");
    setForm((f) => ({ ...f, street: parts[0]?.trim() ?? "" }));
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

  const getTitle = () => {
    if (view === "list") return savedAddressesOnly ? "Deliver to" : "Change Location";
    if (view === "pincode") return "Enter Pincode";
    return "Add New Address";
  };

  const getBackView = (): ModalView => {
    if (view === "add") return "pincode";
    if (view === "pincode") return "list";
    return "list";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Center dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl"
              style={{ maxHeight: "88dvh" }}
              onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  {view !== "list" && (
                    <button
                      type="button"
                      onClick={() => setView(getBackView())}
                      className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
                      aria-label="Back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-foreground">{getTitle()}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable body */}
              <div
                className="overflow-y-auto px-6 py-5"
                style={{ maxHeight: "calc(88dvh - 70px)" }}
              >

                {/* ======= PINCODE VIEW ======= */}
                {view === "pincode" && (
                  <div className="space-y-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Enter your 6-digit pincode to find serviceable addresses in your area (within 2 km)
                    </p>

                    {/* Pincode input */}
                    <div className="flex gap-2">
                      <Input
                        ref={pincodeInputRef}
                        placeholder="e.g. 400002"
                        className="h-12 flex-1 text-base font-semibold tracking-widest"
                        value={pincode}
                        onChange={(e) => handlePincodeInput(e.target.value)}
                        maxLength={6}
                        inputMode="numeric"
                        onKeyDown={(e) => e.key === "Enter" && handleCheckPincode()}
                        autoFocus
                      />
                      <Button
                        className="h-12 bg-offer-green px-5 text-white hover:bg-offer-green/90"
                        onClick={handleCheckPincode}
                        disabled={pincode.length !== 6}
                      >
                        Check
                      </Button>
                    </div>

                    {pincodeError && (
                      <p className="text-sm font-medium text-destructive">{pincodeError}</p>
                    )}

                    {/* After pincode is serviceable: show detect + search + nearby */}
                    {pincodeServiceable && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* Detect + Search row */}
                        <div className="flex items-center gap-3">
                          <Button
                            className="flex-1 gap-2 bg-offer-green text-white hover:bg-offer-green/90"
                            onClick={handleDetectLocation}
                            disabled={detecting}
                          >
                            <Navigation className="h-4 w-4" />
                            {detecting ? "Detecting..." : "Detect my location"}
                          </Button>
                          <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">OR</span>
                          <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search delivery location"
                              className="h-10 rounded-full pl-9 text-sm"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Nearby addresses */}
                        {nearbyList.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">
                              Nearby addresses in {pincode} (within 2 km)
                            </p>
                            {nearbyList
                              .filter((item) =>
                                searchQuery
                                  ? item.address.toLowerCase().includes(searchQuery.toLowerCase())
                                  : true
                              )
                              .map((item) => (
                                <button
                                  key={item.address}
                                  type="button"
                                  onClick={() => handleSelectNearby(item.address)}
                                  className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                                >
                                  <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{item.address}</p>
                                      <p className="mt-0.5 text-xs text-muted-foreground">{item.distance} away</p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Manual entry CTA */}
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 p-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                          onClick={() => setView("add")}
                        >
                          <Plus className="h-4 w-4" />
                          Enter address manually
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ======= LIST VIEW (savedAddressesOnly / header change) ======= */}
                {view === "list" && (
                  <div className="space-y-4">
                    {/* Saved addresses */}
                    {addresses.length > 0 ? (
                      <>
                        <p className="text-sm font-semibold text-foreground">Your saved addresses</p>
                        <div className="space-y-3">
                          {addresses.map((address) => (
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
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No saved addresses yet</p>
                      </div>
                    )}

                    {/* Add new address (check pincode flow) */}
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

                {/* ======= ADD ADDRESS FORM ======= */}
                {view === "add" && (
                  <div className="space-y-5">
                    {/* Address type selector */}
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
                        <Input
                          placeholder="John Doe"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-foreground">Phone Number *</label>
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
                        <label className="mb-1 block text-xs font-medium text-foreground">House / Street / Flat *</label>
                        <Input
                          placeholder="Flat 3B, Marine Drive"
                          value={form.street}
                          onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-foreground">Landmark (Optional)</label>
                        <Input
                          placeholder="Near Fish Market"
                          value={form.landmark}
                          onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">Area</label>
                        <Input
                          placeholder="Marine Lines"
                          value={form.area}
                          onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                        />
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
                        <Input
                          placeholder="Mumbai"
                          value={form.city}
                          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">State</label>
                        <Input
                          placeholder="Maharashtra"
                          value={form.state}
                          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full bg-offer-green text-white hover:bg-offer-green/90"
                      onClick={handleSaveAddress}
                    >
                      Save Address
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
    <div
      className={`relative rounded-xl border transition-colors ${
        isSelected ? "border-offer-green bg-offer-green/5" : "border-border bg-background hover:border-primary/30"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={onSelect}
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            isSelected ? "bg-offer-green/15 text-offer-green" : "bg-muted text-muted-foreground"
          }`}
        >
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

      {/* Edit / Delete actions */}
      <div className="flex gap-2 px-4 pb-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          aria-label="Edit address"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {!isSelected && (
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            onClick={onRemove}
            aria-label="Delete address"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
