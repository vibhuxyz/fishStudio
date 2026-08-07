import { useAddress } from "@/hooks/useAddress";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AddressLabel = "Home" | "Work" | "Other" | "Gift";

const ADDRESS_TYPES: { label: AddressLabel; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Home", icon: "home-outline" },
  { label: "Work", icon: "briefcase-outline" },
  { label: "Other", icon: "star-outline" },
  { label: "Gift", icon: "gift-outline" },
];

function FieldCheck({ filled }: { filled: boolean }) {
  if (!filled) return null;
  return <Ionicons name="checkmark-circle" size={18} color="#22C55E" />;
}

function FormField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  editable = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
  maxLength?: number;
  editable?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: editable ? "#FFFFFF" : "#F9FAFB",
      }}
    >
      <Ionicons name={icon} size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#9CA3AF" }}>
          {label}
        </Text>
        <TextInput
          style={{
            fontFamily: "Inter-SemiBold",
            fontSize: 14,
            color: "#1A1C1C",
            padding: 0,
            marginTop: 2,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C4C4C7"
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
        />
      </View>
      <FieldCheck filled={value.trim().length > 0} />
    </View>
  );
}

export default function AddAddressScreen() {
  const { user } = useUser();
  const { addNewAddress, addresses } = useAddress();
  const params = useLocalSearchParams<{ pincode?: string; city?: string; state?: string; area?: string }>();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [flatBuilding, setFlatBuilding] = useState("");
  const [areaStreet, setAreaStreet] = useState(params.area || "");
  const [city, setCity] = useState(params.city || "");
  const [state, setState] = useState(params.state || "");
  const [pincode, setPincode] = useState(params.pincode || "");
  const [country] = useState("India");
  const [label, setLabel] = useState<AddressLabel>("Home");
  const [savedAs, setSavedAs] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Areas actually pinned to the current pincode, and each area's real city
  // (e.g. "Kavi Nagar" under 201001 is Ghaziabad, not the store's own base
  // city) — lets Area be picked from a list instead of free text, with City
  // auto-filled from the pick instead of being independently editable.
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [areaCitiesMap, setAreaCitiesMap] = useState<Record<string, string>>({});
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  useEffect(() => {
    if (pincode.trim().length !== 6) {
      setAreaOptions([]);
      setAreaCitiesMap({});
      return;
    }
    let cancelled = false;
    axiosInstance
      .get(`/auth/api/check-pincode?pincode=${pincode.trim()}`)
      .then(({ data }) => {
        if (cancelled || !data.success || !data.store) return;
        const matched: string[] =
          data.matchedAreas?.length ? data.matchedAreas : data.store.availableCities || [];
        setAreaOptions(matched);
        setAreaCitiesMap(data.store.areaCities || {});
      })
      .catch(() => {
        if (!cancelled) {
          setAreaOptions([]);
          setAreaCitiesMap({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  const handleUseLocation = async () => {
    setLocating(true);
    setFormError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        toast.error("Location permission denied. Please enter your address manually.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const results = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const place = results[0];
      if (!place) {
        toast.error("Couldn't detect your address. Please enter it manually.");
        return;
      }

      const detectedPincode = place.postalCode || "";
      const detectedCity = place.city || place.subregion || "";
      const detectedState = place.region || "";
      const detectedArea = [place.district, place.street].filter(Boolean).join(", ");

      if (detectedPincode) setPincode(detectedPincode);
      if (detectedCity) setCity(detectedCity);
      if (detectedState) setState(detectedState);
      if (detectedArea) setAreaStreet((prev) => prev || detectedArea);

      toast.success("Location detected");

      // Best-effort serviceability lookup — non-blocking, just refines city.
      // A pincode can span areas in different cities than the store's own
      // base city, so prefer the matched area's real city when available.
      if (detectedPincode.length === 6) {
        try {
          const { data } = await axiosInstance.get(
            `/auth/api/check-pincode?pincode=${detectedPincode}`,
          );
          const matchedArea: string | undefined = data.matchedAreas?.[0];
          const areaCity = matchedArea && data.store?.areaCities?.[matchedArea];
          if (data.success && (areaCity || data.store?.city)) {
            setCity(areaCity || data.store.city);
          }
        } catch {
          // Non-fatal — keep the geocoded value.
        }
      }
    } catch {
      toast.error("Couldn't get your location. Please enter your address manually.");
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    setFormError("");
    if (!name.trim()) {
      setFormError("Full name is required");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError("A valid 10-digit mobile number is required");
      return;
    }
    if (!flatBuilding.trim()) {
      setFormError("Flat / House / Building is required");
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setFormError("A valid 6-digit pincode is required");
      return;
    }
    if (!city.trim()) {
      setFormError("City is required");
      return;
    }

    setSaving(true);
    try {
      await addNewAddress({
        name: name.trim(),
        label,
        savedAs: savedAs.trim() || undefined,
        street: flatBuilding.trim(),
        area: areaStreet.trim() || undefined,
        city: city.trim(),
        state: state.trim() || undefined,
        pincode: pincode.trim(),
        phone: phone.trim(),
        country,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name="arrow-back" size={19} color="#1A1C1C" />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
                fontSize: 20,
                color: "#1A1C1C",
              }}
            >
              Add New Address
            </Text>
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>
              Please add your complete address
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", maxWidth: 110 }}>
          <Ionicons name="flash-outline" size={16} color="#5A2C96" style={{ marginRight: 4 }} />
          <Text style={{ fontFamily: "Inter-Medium", fontSize: 10, color: "#5A2C96", lineHeight: 13 }}>
            Save and deliver faster next time
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Use my current location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 16,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F3EEFB",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="locate-outline" size={20} color="#5A2C96" />
          </View>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: "#1A1C1C" }}>
              Use my current location
            </Text>
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
              Get address from your current location
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleUseLocation}
            disabled={locating}
            style={{
              backgroundColor: "#5A2C96",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              minWidth: 96,
              alignItems: "center",
            }}
            activeOpacity={0.85}
          >
            {locating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#fff" }}>
                Use Location
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Contact Details */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", marginBottom: 10 }}>
          Contact Details
        </Text>
        <View style={{ gap: 10, marginBottom: 20 }}>
          <FormField
            icon="person-outline"
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Nitish Mandal"
          />
          <FormField
            icon="call-outline"
            label="Mobile Number"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
            placeholder="e.g. 85272 40025"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Address Details */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", marginBottom: 10 }}>
          Address Details
        </Text>
        <View style={{ gap: 10, marginBottom: 16 }}>
          <FormField
            icon="home-outline"
            label="Flat, House no., Building, Apartment"
            value={flatBuilding}
            onChangeText={setFlatBuilding}
            placeholder="e.g. A-1201, 12th Floor, Golf Course Road"
          />
          {areaOptions.length > 0 ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAreaPicker(true)}>
              <View pointerEvents="none">
                <FormField
                  icon="map-outline"
                  label="Area, Street, Sector, Landmark"
                  value={areaStreet}
                  placeholder="Select your area"
                  editable={false}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <FormField
              icon="map-outline"
              label="Area, Street, Sector, Landmark"
              value={areaStreet}
              onChangeText={setAreaStreet}
              placeholder="e.g. Sector 57, Near Rapid Metro Station"
            />
          )}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <FormField
                icon="business-outline"
                label="City"
                value={city}
                placeholder="e.g. Gurgaon"
                editable={false}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                icon="location-outline"
                label="State"
                value={state}
                onChangeText={setState}
                placeholder="e.g. Haryana"
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <FormField
                icon="pin-outline"
                label="Pincode"
                value={pincode}
                onChangeText={(t) => setPincode(t.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g. 122011"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                icon="flag-outline"
                label="Country"
                value={country}
                placeholder="India"
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Address Type */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", marginBottom: 10 }}>
          Address Type
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {ADDRESS_TYPES.map((type) => {
            const selected = label === type.label;
            return (
              <TouchableOpacity
                key={type.label}
                onPress={() => setLabel(type.label)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? "#5A2C96" : "#E5E7EB",
                  backgroundColor: selected ? "#F3EEFB" : "#FFFFFF",
                }}
              >
                {selected && (
                  <View
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: "#5A2C96",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderColor: "#fff",
                    }}
                  >
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                )}
                <Ionicons
                  name={type.icon}
                  size={18}
                  color={selected ? "#5A2C96" : "#9CA3AF"}
                />
                <Text
                  style={{
                    fontFamily: selected ? "Inter-SemiBold" : "Inter-Medium",
                    fontSize: 12,
                    color: selected ? "#5A2C96" : "#6B7280",
                    marginTop: 4,
                  }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save as */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", marginBottom: 10 }}>
          Save as
        </Text>
        <View style={{ marginBottom: 20 }}>
          <FormField
            icon="bookmark-outline"
            label="Save address as (optional)"
            value={savedAs}
            onChangeText={setSavedAs}
            placeholder="e.g. Home, Office, Parents Home"
          />
        </View>

        {/* Delivery Instructions */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", marginBottom: 2 }}>
          Delivery Instructions{" "}
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: "#9CA3AF" }}>
            (optional)
          </Text>
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 8,
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="document-text-outline" size={18} color="#9CA3AF" style={{ marginRight: 10, marginTop: 2 }} />
            <TextInput
              style={{
                flex: 1,
                fontFamily: "Inter-Medium",
                fontSize: 14,
                color: "#1A1C1C",
                minHeight: 44,
                textAlignVertical: "top",
              }}
              value={deliveryInstructions}
              onChangeText={(t) => setDeliveryInstructions(t.slice(0, 120))}
              placeholder="Any special instructions for delivery partner"
              placeholderTextColor="#C4C4C7"
              multiline
              maxLength={120}
            />
          </View>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 10, color: "#C4C4C7", textAlign: "right" }}>
            {deliveryInstructions.length}/120
          </Text>
        </View>

        {formError ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FECACA",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          >
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#DC2626", flex: 1 }}>
              {formError}
            </Text>
          </View>
        ) : null}

        {/* Trust footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3EEFB",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#5A2C96" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: "#5A2C96" }}>
              Your information is safe with us
            </Text>
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#7C5CAE", marginTop: 1 }}>
              We do not share your address with any third party.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: saving ? "#A78BC6" : "#5A2C96",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#fff" }}>
              Save Address
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Area picker — areas can span different real cities under one
          pincode, so picking here also fills City from the match. */}
      <Modal
        visible={showAreaPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAreaPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowAreaPicker(false)}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "60%",
              paddingBottom: 24,
            }}
          >
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
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#1A1C1C" }}>
                Select Area
              </Text>
              <TouchableOpacity onPress={() => setShowAreaPicker(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {areaOptions.map((area) => (
                <TouchableOpacity
                  key={area}
                  activeOpacity={0.7}
                  onPress={() => {
                    setAreaStreet(area);
                    setCity(areaCitiesMap[area] || city);
                    setShowAreaPicker(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F8FAFC",
                  }}
                >
                  <Text style={{ fontFamily: "Inter-Medium", fontSize: 14, color: "#1A1C1C" }}>
                    {area}
                  </Text>
                  {areaStreet === area && (
                    <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
