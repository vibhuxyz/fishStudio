import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/utils/toast";

// Pincode check response type
interface PincodeCheckResponse {
  success: boolean;
  store?: {
    id: string;
    name: string;
    city: string;
    pincode: string;
    availableCities: string[];
    cityDeliveryTimes: Record<string, number>;
    isOpen: boolean;
    openingHours: string;
  };
  message?: string;
}

// Serviceable areas response type
interface ServiceableArea {
  pincode: string;
  city: string;
  state: string;
}

/**
 * Hook to check if a pincode is serviceable and get store info.
 * Matches user-ui's GET /auth/api/check-pincode?pincode={pincode}
 */
export function usePincodeCheck(pincode: string) {
  return useQuery({
    queryKey: ["pincode-check", pincode],
    queryFn: async (): Promise<PincodeCheckResponse> => {
      const response = await axiosInstance.get(
        `/auth/api/check-pincode?pincode=${pincode}`
      );
      return response.data;
    },
    enabled: pincode.length === 6,
    retry: false,
  });
}

/**
 * Hook to fetch all serviceable pincodes/areas.
 * Matches user-ui's GET /auth/api/serviceable-areas
 */
export function useServiceableAreas() {
  return useQuery({
    queryKey: ["serviceable-areas"],
    queryFn: async (): Promise<ServiceableArea[]> => {
      const response = await axiosInstance.get("/auth/api/serviceable-areas");
      return response.data.areas || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook for address CRUD operations.
 * Matches user-ui's useAddress hook.
 */
export function useAddress() {
  const {
    addresses,
    setAddresses,
    selectAddress,
    setSelectedLocation,
  } = useAddressStore();

  // Fetch addresses from logged-in-user (matches user-ui pattern)
  // Throws on error so callers can show appropriate UI state.
  const fetchAddresses = async () => {
    const response = await axiosInstance.get("/auth/api/logged-in-user");
    const fetchedAddresses = response.data.user?.addresses || [];
    setAddresses(fetchedAddresses);
    return fetchedAddresses;
  };

  // Add new address
  const addNewAddress = async (data: {
    name: string;
    label: "Home" | "Work" | "Other";
    street: string;
    area?: string;
    city: string;
    state?: string;
    pincode: string;
    phone?: string;
    country: string;
  }) => {
    const response = await axiosInstance.post("/auth/api/add-address", {
      address: {
        ...data,
        isDefault: addresses.length === 0, // First address becomes default
      },
    });
    // Update local store with fresh address list from API
    setAddresses(response.data.addresses || []);
    toast.success("Address added successfully!");
    return response.data;
  };

  // Delete address
  const deleteAddress = async (id: string) => {
    if (addresses.length <= 1) {
      toast.error("Cannot delete the last address. Please add another address first.");
      return;
    }
    const response = await axiosInstance.delete(`/auth/api/delete-address/${id}`);
    // Sync store with the authoritative list returned by the server
    setAddresses(response.data.addresses || []);
    toast.success("Address deleted successfully!");
  };

  // Set default address — local store only (no dedicated backend endpoint)
  const setDefaultAddress = (id: string) => {
    selectAddress(id);
    toast.success("Default address updated!");
  };

  return {
    addresses,
    fetchAddresses,
    addNewAddress,
    deleteAddress,
    setDefaultAddress,
    selectAddress,
    setSelectedLocation,
  };
}
