import {
  useAddressStore,
  type Address,
  type SelectedLocation,
} from "@/lib/address-store";
import { useAddress } from "@/hooks/useAddress";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import { detectCurrentPlace } from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/utils/toast";

const OFFER_GREEN = "#22C55E";


type ModalView = "list" | "pincode";

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  savedAddressesOnly?: boolean;
  onSelect?: (location: SelectedLocation) => void;
  /** "sheet" keeps the cart on screen behind a bottom sheet. */
  presentation?: "page" | "sheet";
}

interface StoreInfo {
  id: string;
  name: string;
  city: string;
  state?: string;
  availableCities: string[];
  cityDeliveryTimes?: Record<string, number>;
  isOpen?: boolean;
  opening_hours?: string;
  closing_hours?: string;
}

export default function AddressModal({
  visible,
  onClose,
  savedAddressesOnly = false,
  onSelect,
  presentation = "page",
}: AddressModalProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { fetchAddresses } = useAddress();
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    setAddresses,
    setSelectedLocation,
  } = useAddressStore();

  const [view, setView] = useState<ModalView>("pincode");

  // Pincode view state
  const [pincode, setPincode] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [serviceablePincodes, setServiceablePincodes] = useState<string[]>([]);
  const [detecting, setDetecting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setView(savedAddressesOnly && addresses.length > 0 ? "list" : "pincode");
      setPincode("");
      setPincodeError("");
      setPincodeLoading(false);
      setStoreInfo(null);
      setServiceablePincodes([]);
    }
  }, [visible]);

  // Saved addresses aren't persisted between launches, so pull them back
  // whenever the picker opens — same fetch cart.tsx already relies on.
  useEffect(() => {
    if (!visible || !user) return;
    fetchAddresses().catch(() => {
      toast.error("Couldn't load your saved addresses");
    });
  }, [visible, user?.id]);

  // ── Pincode check ──────────────────────────────────────────────────────────
  const handleCheckPincode = async (overridePincode?: string) => {
    const pin = overridePincode ?? pincode;
    if (pin.length !== 6) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    setPincodeLoading(true);
    setPincodeError("");
    setStoreInfo(null);
    setServiceablePincodes([]);

    try {
      const res = await axiosInstance.get(
        `/auth/api/check-pincode?pincode=${pin}`,
      );
      const data = res.data;

      if (data.success && data.store) {
        setStoreInfo(data.store);
      } else {
        // Fetch serviceable areas for suggestion
        try {
          const areasRes = await axiosInstance.get(
            "/auth/api/serviceable-areas",
          );
          if (areasRes.data.areas) {
            setServiceablePincodes(
              areasRes.data.areas.map((a: any) => a.pincode),
            );
          }
        } catch {}
        setPincodeError("coming-soon");
      }
    } catch (err: any) {
      setPincodeError(
        err.response?.data?.message || "Failed to check pincode. Try again.",
      );
    } finally {
      setPincodeLoading(false);
    }
  };

  // ── Detect location, then run the same serviceability check as a typed pin ─
  const handleDetectLocation = async () => {
    setDetecting(true);
    setPincodeError("");
    const result = await detectCurrentPlace();
    setDetecting(false);

    if (!result.ok) {
      setPincodeError(
        result.reason === "permission-denied"
          ? "Location permission denied. Please enter your pincode."
          : "Couldn't detect your location. Please enter your pincode.",
      );
      return;
    }

    if (result.place.pincode.length !== 6) {
      setPincodeError("Couldn't read a pincode from your location. Please enter it.");
      return;
    }

    setPincode(result.place.pincode);
    handleCheckPincode(result.place.pincode);
  };

  // ── Select a city from pincode results — close modal immediately ───────────
  const handleSelectCity = (city: string) => {
    if (!storeInfo) return;
    const deliveryMins = storeInfo.cityDeliveryTimes?.[city];
    const location: SelectedLocation = {
      storeId: storeInfo.id,
      storeName: storeInfo.name,
      pincode,
      city,
      deliveryTimeMinutes: deliveryMins,
      isOpen: storeInfo.isOpen,
      openingHours: storeInfo.opening_hours,
      closingHours: storeInfo.closing_hours,
    };
    setSelectedLocation(location);
    queryClient.invalidateQueries({ queryKey: ["store"] });
    queryClient.invalidateQueries({ queryKey: ["storefront"] });
    toast.success(`Delivering to ${city}`);
    onClose();
    onSelect?.(location);
  };

  // ── Enter manually — hand off to the dedicated Add Address screen ─────────
  const handleEnterManually = () => {
    if (storeInfo) {
      const city = storeInfo.availableCities?.[0] || storeInfo.city || "";
      const deliveryMins = storeInfo.cityDeliveryTimes?.[city];
      setSelectedLocation({
        storeId: storeInfo.id,
        storeName: storeInfo.name,
        pincode,
        city,
        deliveryTimeMinutes: deliveryMins,
        isOpen: storeInfo.isOpen,
        openingHours: storeInfo.opening_hours,
        closingHours: storeInfo.closing_hours,
      });
    }
    onClose();
    router.push({
      pathname: "/(routes)/add-address",
      params: {
        pincode,
        city: storeInfo?.city || "",
        state: storeInfo?.state || "",
      },
    });
  };

  // ── Select a saved address — resolve storeId in background ────────────────
  const handleSelectSavedAddress = async (address: Address) => {
    selectAddress(address.id);
    setSelectedLocation({
      storeId: "",
      storeName: "",
      pincode: address.pincode,
      city: address.city,
    });
    queryClient.invalidateQueries({ queryKey: ["store"] });
    queryClient.invalidateQueries({ queryKey: ["storefront"] });
    toast.success(`Delivering to ${address.label}`);
    onClose();
    onSelect?.({
      storeId: "",
      storeName: "",
      pincode: address.pincode,
      city: address.city,
    });

    // Resolve full store info in background
    try {
      const res = await axiosInstance.get(
        `/auth/api/check-pincode?pincode=${address.pincode}`,
      );
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
          openingHours: data.store.opening_hours,
          closingHours: data.store.closing_hours,
        });
        queryClient.invalidateQueries({ queryKey: ["store"] });
      }
    } catch {}
  };

  // ── Delete a saved address ────────────────────────────────────────────────
  const handleDeleteAddress = async (id: string) => {
    try {
      const { data } = await axiosInstance.delete(
        `/auth/api/delete-address/${id}`,
      );
      if (data.success) {
        setAddresses(data.addresses);
        toast.success("Address removed");
      }
    } catch {
      toast.error("Failed to remove address");
    }
  };

  const getTitle = () => {
    if (view === "list")
      return savedAddressesOnly ? "Deliver to" : "My Addresses";
    return "Enter Pincode";
  };

  // ── Address card (used in list + pincode shortcuts) ───────────────────────
  const renderAddressCard = (address: Address) => {
    const isSelected = address.id === selectedAddressId;
    return (
      <TouchableOpacity
        key={address.id}
        onPress={() => handleSelectSavedAddress(address)}
        activeOpacity={0.75}
        style={{
          borderWidth: 1.5,
          borderColor: isSelected ? OFFER_GREEN : "#E2E8F0",
          borderRadius: 14,
          backgroundColor: isSelected ? "#F0FDF4" : "#fff",
          marginBottom: 10,
          padding: 14,
          gap: 12,
        }}
      >
        {/* Main row */}
        <View
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isSelected ? "#DCFCE7" : "#F1F5F9",
            }}
          >
            <Ionicons
              name={
                address.label === "Home"
                  ? "home-outline"
                  : address.label === "Work"
                    ? "briefcase-outline"
                    : "location-outline"
              }
              size={20}
              color={isSelected ? OFFER_GREEN : "#64748B"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 15,
                  color: "#1E293B",
                }}
              >
                {address.label}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={OFFER_GREEN}
                />
              )}
            </View>
            <Text
              style={{
                fontFamily: "Inter-Medium",
                fontSize: 13,
                color: "#64748B",
                lineHeight: 19,
              }}
            >
              {address.name}
              {address.street ? `, ${address.street}` : ""}
              {address.landmark ? `, ${address.landmark}` : ""}
              {address.area ? `, ${address.area}` : ""}
              {address.city ? ` ${address.city}` : ""}
            </Text>
          </View>
        </View>

        {/* Actions row — just pencil + (optional) trash, matching user-ui */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={14} color="#64748B" />
          </TouchableOpacity>
          {!isSelected && (
            <TouchableOpacity
              onPress={() => handleDeleteAddress(address.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── PINCODE VIEW ──────────────────────────────────────────────────────────
  const renderPincodeView = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ padding: 20, gap: 16 }}>
        <Text
          style={{
            fontFamily: "Inter-Medium",
            fontSize: 14,
            color: "#64748B",
            lineHeight: 22,
          }}
        >
          Enter your 6-digit pincode to find serviceable addresses in your area.
        </Text>

        {/* Pincode input + Check button */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={{
              flex: 1,
              borderWidth: pincode.length > 0 ? 2 : 1.5,
              borderColor: pincode.length > 0 ? "#5A2C96" : "#E2E8F0",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: "#fff",
            }}
          >
            <TextInput
              style={{
                fontFamily: "Inter-SemiBold",
                fontSize: 18,
                color: "#1E293B",
                letterSpacing: 4,
              }}
              placeholder="e.g. 843111"
              placeholderTextColor="#94A3B8"
              value={pincode}
              onChangeText={(t) => {
                setPincode(t.replace(/\D/g, "").slice(0, 6));
                setPincodeError("");
                setStoreInfo(null);
                setServiceablePincodes([]);
              }}
              keyboardType="numeric"
              maxLength={6}
              onSubmitEditing={() => handleCheckPincode()}
              autoFocus
            />
          </View>
          <TouchableOpacity
            onPress={() => handleCheckPincode()}
            disabled={pincode.length !== 6 || pincodeLoading}
            style={{
              backgroundColor: pincode.length === 6 ? OFFER_GREEN : "#BBF7D0",
              borderRadius: 12,
              paddingHorizontal: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            {pincodeLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  fontSize: 14,
                  color: "#fff",
                }}
              >
                Check
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Detect / Search buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={handleDetectLocation}
            disabled={detecting}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: OFFER_GREEN,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 12,
              opacity: detecting ? 0.7 : 1,
            }}
            activeOpacity={0.85}
          >
            {detecting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="navigate-outline" size={16} color="#fff" />
            )}
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontSize: 13,
                color: "#fff",
              }}
            >
              {detecting ? "Detecting…" : "Detect my location"}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: "Inter-SemiBold",
              fontSize: 12,
              color: "#94A3B8",
            }}
          >
            OR
          </Text>

          <TouchableOpacity
            onPress={() =>
              toast.info("Please use pincode to search your area.")
            }
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1.5,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 12,
              backgroundColor: "#fff",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={16} color="#64748B" />
            <Text
              style={{
                fontFamily: "Inter-SemiBold",
                fontSize: 13,
                color: "#64748B",
              }}
            >
              Search location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generic error */}
        {pincodeError && pincodeError !== "coming-soon" && (
          <Text
            style={{
              fontFamily: "Inter-Medium",
              fontSize: 13,
              color: "#EF4444",
            }}
          >
            {pincodeError}
          </Text>
        )}

        {/* Coming soon */}
        {pincodeError === "coming-soon" && (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#FDE68A",
              borderRadius: 14,
              backgroundColor: "#FFFBEB",
              padding: 16,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color="#D97706"
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter-SemiBold",
                    fontSize: 13,
                    color: "#92400E",
                  }}
                >
                  Coming Soon to your area!
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter-Medium",
                    fontSize: 12,
                    color: "#B45309",
                    marginTop: 2,
                  }}
                >

                  We don't deliver to{" "}
                  <Text style={{ fontFamily: "Inter-Bold" }}>{pincode}</Text>{" "}
                  yet.
                </Text>
              </View>
            </View>
            {serviceablePincodes.length > 0 && (
              <View>
                <Text
                  style={{
                    fontFamily: "Inter-SemiBold",
                    fontSize: 12,
                    color: "#92400E",
                    marginBottom: 8,
                  }}
                >
                  We currently serve (Pincodes):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                  >
                    {serviceablePincodes.slice(0, 14).map((pin) => (
                      <TouchableOpacity
                        key={pin}
                        onPress={() => {
                          setPincode(pin);
                          setPincodeError("");
                          handleCheckPincode(pin);
                        }}
                        style={{
                          backgroundColor: "#FEF3C7",
                          borderWidth: 1,
                          borderColor: "#FCD34D",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter-SemiBold",
                            fontSize: 12,
                            color: "#92400E",
                          }}
                        >
                          {pin}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {serviceablePincodes.length > 14 && (
                      <Text
                        style={{
                          fontFamily: "Inter-Medium",
                          fontSize: 12,
                          color: "#B45309",
                          alignSelf: "center",
                        }}
                      >
                        +{serviceablePincodes.length - 14} more
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Serviceable cities list */}
        {storeInfo && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontSize: 14,
                color: "#1E293B",
              }}
            >
              Nearby areas in {pincode}
            </Text>
            {storeInfo.availableCities.map((city) => {
              const mins = storeInfo.cityDeliveryTimes?.[city];
              return (
                <TouchableOpacity
                  key={city}
                  onPress={() => handleSelectCity(city)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 12,
                    padding: 14,
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#EEE9FD",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="location" size={18} color="#5A2C96" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter-SemiBold",
                        fontSize: 14,
                        color: "#1E293B",
                      }}
                    >
                      {city}
                    </Text>
                    {mins ? (
                      <Text
                        style={{
                          fontFamily: "Inter-Medium",
                          fontSize: 12,
                          color: "#22C55E",
                          marginTop: 1,
                        }}
                      >
                        ~{mins} min delivery
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}

            {/* Enter manually */}
            <TouchableOpacity
              onPress={handleEnterManually}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: "#C4B5FD",
                borderRadius: 12,
                padding: 14,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#5A2C96" />
              <Text
                style={{
                  fontFamily: "Inter-SemiBold",
                  fontSize: 14,
                  color: "#5A2C96",
                }}
              >
                Enter address manually
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Saved addresses shortcut */}
        {addresses.length > 0 &&
          !storeInfo &&
          pincodeError !== "coming-soon" && (
            <View style={{ gap: 10, paddingTop: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    fontSize: 14,
                    color: "#1E293B",
                  }}
                >
                  Saved Addresses
                </Text>
                <TouchableOpacity onPress={() => setView("list")}>
                  <Text
                    style={{
                      fontFamily: "Inter-SemiBold",
                      fontSize: 12,
                      color: "#5A2C96",
                    }}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
              </View>
              {addresses.slice(0, 2).map(renderAddressCard)}
            </View>
          )}
      </View>
    </ScrollView>
  );

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  const renderListView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: 20, gap: 12 }}>
        {addresses.length > 0 ? (
          <>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontSize: 14,
                color: "#1E293B",
              }}
            >
              Your saved addresses
            </Text>
            {addresses.map(renderAddressCard)}
          </>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Ionicons name="location-outline" size={56} color="#CBD5E1" />
            <Text
              style={{
                fontFamily: "Inter-Medium",
                fontSize: 14,
                color: "#94A3B8",
                marginTop: 12,
              }}
            >
              No saved addresses yet
            </Text>
          </View>
        )}

        {/* Add new */}
        <TouchableOpacity
          onPress={() => setView("pincode")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: "#C4B5FD",
            borderRadius: 12,
            padding: 14,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#5A2C96" />
          <Text
            style={{
              fontFamily: "Inter-SemiBold",
              fontSize: 14,
              color: "#5A2C96",
            }}
          >
            Add new address
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  const body = (
    <>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              gap: 8,
            }}
          >
            {view !== "list" && (
              <TouchableOpacity
                onPress={() => setView("list")}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#1E293B" />
              </TouchableOpacity>
            )}
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontSize: 18,
                color: "#1E293B",
              }}
            >
              {getTitle()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {view === "pincode" && renderPincodeView()}
        {view === "list" && renderListView()}
    </>
  );

  if (presentation === "sheet") {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={onClose}
        >
          {/* Taps inside the sheet must not fall through to the dismiss layer */}
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "88%",
              paddingBottom: 12,
            }}
          >
            {body}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>{body}</SafeAreaView>
    </Modal>
  );
}
