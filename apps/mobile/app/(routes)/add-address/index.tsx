import { useAddress } from "@/hooks/useAddress";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LocationPickerMap, { type LocationPickerMapHandle } from "@/components/location-picker-map";
import { geocodingProvider, type GeoBounds, type PlaceResult } from "@/lib/geocoding-provider";

const DEFAULT_MAP_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi fallback

// ~5.5km at the equator, tighter at higher latitudes — plenty for a single
// serviceable area/pincode without being so tight that a legitimate search
// result just outside it gets rejected.
const AREA_RADIUS_DEG = 0.05;

function areaBounds(center: { lat: number; lng: number }, radius = AREA_RADIUS_DEG): GeoBounds {
  return {
    south: center.lat - radius,
    north: center.lat + radius,
    west: center.lng - radius,
    east: center.lng + radius,
  };
}


function shortLabel(label: string): string {
  return label.split(",").slice(0, 2).join(",").trim();
}

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
  const { addNewAddress, updateAddress, addresses } = useAddress();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    pincode?: string;
    city?: string;
    state?: string;
    area?: string;
    addressId?: string;
  }>();

  const editingAddress = params.addressId
    ? addresses.find((a) => a.id === params.addressId)
    : undefined;
  const isEditing = !!params.addressId;

  const [name, setName] = useState(editingAddress?.name || user?.name || "");
  const [phone, setPhone] = useState(editingAddress?.phone || user?.phone || "");
  const [flatBuilding, setFlatBuilding] = useState(editingAddress?.street || "");
  const [areaStreet, setAreaStreet] = useState(editingAddress?.area || params.area || "");
  const [city, setCity] = useState(editingAddress?.city || params.city || "");
  const [state, setState] = useState(editingAddress?.state || params.state || "");
  const [pincode, setPincode] = useState(editingAddress?.pincode || params.pincode || "");
  const [country] = useState("India");
  const [label, setLabel] = useState<AddressLabel>((editingAddress?.label as AddressLabel) || "Home");
  const [savedAs, setSavedAs] = useState(editingAddress?.savedAs || "");
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    editingAddress?.deliveryInstructions || "",
  );

  const [locating, setLocating] = useState(false);
  // While a finger is down on the map, the outer ScrollView must give up
  // scrolling entirely — Android's ScrollView still wins the gesture
  // negotiation for vertical drags over a nested WebView (horizontal drags
  // pass through fine since the ScrollView only cares about vertical), so
  // "touch-action: none" inside the WebView's own page isn't enough on its
  // own to let the map pan freely in every direction.
  const [mapTouchActive, setMapTouchActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // The exact map pin — this is what the rider actually navigates to, so it's
  // tracked separately from the reverse-geocoded text fields above (which
  // stay editable and can drift from the pin).
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [pinLabel, setPinLabel] = useState("");
  const [resolvingPinLabel, setResolvingPinLabel] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState<PlaceResult[]>([]);
  const [mapSearching, setMapSearching] = useState(false);
  // Set only once a search has genuinely come up empty (not "no results yet
  // because nothing was typed") — shows nearby landmarks as a fallback.
  const [mapNoResultsFor, setMapNoResultsFor] = useState<string | null>(null);
  const [nearbyLandmarks, setNearbyLandmarks] = useState<PlaceResult[]>([]);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);
  const mapRef = useRef<LocationPickerMapHandle>(null);
  const mapSearchDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Approximate center of the pincode/area already chosen on the previous
  // screen — resolved once on mount, so the map opens scoped to that area
  // instead of a generic default. `undefined` = still resolving, `null` =
  // resolved but nothing found (falls back to the generic default).
  const [areaCenter, setAreaCenter] = useState<{ lat: number; lng: number } | null | undefined>(
    params.pincode ? undefined : null,
  );

  useEffect(() => {
    if (!params.pincode) return;
    let cancelled = false;

    (async () => {
      // Nominatim's exact "area, city, pincode" combo can fail to match if
      // the area name is informal (a sub-locality Nominatim doesn't know by
      // that spelling) — falling back to just the pincode is much more
      // reliably geocodable and still gets us into the right neighborhood.
      const attempts = [
        [params.area, params.city, params.pincode, "India"],
        [params.city, params.pincode, "India"],
        [params.pincode, "India"],
      ]
        .map((parts) => parts.filter(Boolean).join(", "))
        .filter((q, i, arr) => q && arr.indexOf(q) === i);

      for (const query of attempts) {
        if (cancelled) return;
        try {
          const result = await geocodingProvider.geocode(query);
          if (result) {
            if (!cancelled) setAreaCenter(result);
            return;
          }
        } catch {
          // Try the next, looser query.
        }
      }
      if (!cancelled) setAreaCenter(null);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      mapRef.current?.setMarker(position.coords.latitude, position.coords.longitude);

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
      setPinLabel([detectedArea, detectedCity].filter(Boolean).join(", "));

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

  // Reverse-geocode via the provider (not expo-location) so the label
  // matches exactly what the map shows — expo-location's OS-level geocoder
  // can disagree slightly with what the pin visually sits on.
  const reverseGeocodePin = async (nextLat: number, nextLng: number) => {
    setResolvingPinLabel(true);
    try {
      const label = await geocodingProvider.reverseGeocode({ lat: nextLat, lng: nextLng });
      if (label) setPinLabel(label);
    } finally {
      setResolvingPinLabel(false);
    }
  };

  const handleMapLocationSelected = (nextLat: number, nextLng: number) => {
    setLat(nextLat);
    setLng(nextLng);
    reverseGeocodePin(nextLat, nextLng);
  };

  const handleMapSearchChange = (text: string) => {
    setMapSearchQuery(text);
    clearTimeout(mapSearchDebounce.current);
    setMapNoResultsFor(null);
    setNearbyLandmarks([]);
    if (text.trim().length < 3) {
      setMapSearchResults([]);
      return;
    }
    // Debounced — Nominatim's public instance asks for at most ~1 request/sec.
    mapSearchDebounce.current = setTimeout(async () => {
      setMapSearching(true);
      try {
        // Biased (not restricted) to the already-chosen pincode/area — a
        // bounds hint just ranks nearby matches first, it doesn't hide
        // anything further away. A hard filter was here before and meant a
        // wrong/failed area lookup could hide every real result.
        const bounds = areaCenter ? areaBounds(areaCenter) : undefined;
        const results = await geocodingProvider.search(text, bounds);
        setMapSearchResults(results);

        if (results.length === 0) {
          setMapNoResultsFor(text);
          if (areaCenter) {
            setLoadingLandmarks(true);
            try {
              setNearbyLandmarks(await geocodingProvider.nearbyLandmarks(areaCenter, areaBounds(areaCenter)));
            } finally {
              setLoadingLandmarks(false);
            }
          }
        }
      } catch {
        setMapSearchResults([]);
      } finally {
        setMapSearching(false);
      }
    }, 500);
  };

  const handleSelectMapResult = (result: PlaceResult) => {
    setLat(result.lat);
    setLng(result.lng);
    setPinLabel(result.label);
    setMapSearchQuery("");
    setMapSearchResults([]);
    mapRef.current?.setMarker(result.lat, result.lng);
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
    if (!deliveryInstructions.trim()) {
      setFormError("Delivery instructions are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
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
        deliveryInstructions: deliveryInstructions.trim(),
        ...(lat != null && lng != null ? { lat, lng } : {}),
      };
      if (isEditing && params.addressId) {
        await updateAddress(params.addressId, {
          ...payload,
          isDefault: editingAddress?.isDefault,
        });
      } else {
        await addNewAddress(payload);
      }
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
              {isEditing ? "Edit Address" : "Add New Address"}
            </Text>
            <Text style={{ fontFamily: "Inter-Medium", fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>
              {isEditing ? "Update your address details" : "Please add your complete address"}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // Android already resizes the window on keyboard show (adjustResize).
        // "height" behavior duplicates that resize at the RN layer, and the
        // WebView map's own internal layout passes turn the resulting
        // double-adjustment into a visible jitter loop on the footer button —
        // undefined here just lets Android's native resize handle it alone.
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        scrollEnabled={!mapTouchActive}
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

        {/* Pin exact location */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#1A1C1C", marginBottom: 2 }}>
          Pin your exact location
        </Text>
        <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>
          This is what your delivery partner will navigate to — drag the map in any
          direction, search, or use your current location to be precise.
        </Text>

        <View style={{ position: "relative", marginBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 14,
              paddingHorizontal: 14,
              height: 44,
            }}
          >
            <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontFamily: "Inter-Medium", fontSize: 14, color: "#1A1C1C" }}
              value={mapSearchQuery}
              onChangeText={handleMapSearchChange}
              placeholder="Search for a place or landmark..."
              placeholderTextColor="#C4C4C7"
            />
            {mapSearching && <ActivityIndicator size="small" color="#9CA3AF" />}
          </View>
          {mapSearchResults.length > 0 && (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 14,
                marginTop: 4,
                overflow: "hidden",
              }}
            >
              {mapSearchResults.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => handleSelectMapResult(r)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}
                >
                  <Text
                    style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "#1A1C1C" }}
                    numberOfLines={1}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {mapNoResultsFor === mapSearchQuery && mapSearchResults.length === 0 && (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 14,
                marginTop: 4,
                padding: 14,
              }}
            >
              <Text style={{ fontFamily: "Inter-Medium", fontSize: 13, color: "#1A1C1C" }}>
                Couldn&apos;t find &quot;{mapNoResultsFor}&quot;. Try searching for a well-known
                place nearby instead.
              </Text>
              {loadingLandmarks ? (
                <ActivityIndicator size="small" color="#9CA3AF" style={{ marginTop: 10 }} />
              ) : (
                nearbyLandmarks.length > 0 && (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {nearbyLandmarks.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => handleSelectMapResult(r)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      >
                        <Ionicons name="location-outline" size={14} color="#5A2C96" style={{ marginRight: 6 }} />
                        <Text
                          style={{ flex: 1, fontFamily: "Inter-Regular", fontSize: 12, color: "#1A1C1C" }}
                          numberOfLines={1}
                        >
                          {r.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              )}
            </View>
          )}
        </View>

        <View
          style={{
            height: 220,
            borderRadius: 14,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            marginBottom: 6,
          }}
          onTouchStart={() => setMapTouchActive(true)}
          onTouchEnd={() => setMapTouchActive(false)}
          onTouchCancel={() => setMapTouchActive(false)}
        >
          {areaCenter === undefined ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color="#5A2C96" />
            </View>
          ) : (
            <>
              <LocationPickerMap
                ref={mapRef}
                initialLat={lat ?? areaCenter?.lat ?? DEFAULT_MAP_CENTER.lat}
                initialLng={lng ?? areaCenter?.lng ?? DEFAULT_MAP_CENTER.lng}
                onLocationSelected={handleMapLocationSelected}
              />
              {/* Rides just above the map's fixed center pin, matching where
                  it sits inside the WebView — shows what's actually there,
                  not just in the caption below. */}
              {(resolvingPinLabel || pinLabel) && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: "50%",
                    marginBottom: 54,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      maxWidth: "100%",
                      backgroundColor: "#fff",
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      shadowColor: "#000",
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 2,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ fontFamily: "Inter-Medium", fontSize: 11, color: "#1A1C1C" }}
                    >
                      {resolvingPinLabel ? "Locating..." : shortLabel(pinLabel)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
        <Text
          style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#9CA3AF", marginBottom: 20 }}
          numberOfLines={2}
        >
          {pinLabel ? `Pinned: ${pinLabel}` : "No pin set yet — drag the map or search above."}
        </Text>

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

        {/* Delivery Instructions — required, so it's called out larger than
            the other section headers on this screen. */}
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 17, color: "#5A2C96", marginBottom: 2 }}>
          Delivery Instructions
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
              {isEditing ? "Update Address" : "Save Address"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>

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
              paddingBottom: insets.bottom + 24,
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
