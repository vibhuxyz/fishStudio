import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Full saved address (from DB)
export interface Address {
  id: string;
  name: string;
  label: "Home" | "Work" | "Other";
  street: string;
  area?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  phone?: string;
  country: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

// Lightweight selected location (what user-ui uses)
export interface SelectedLocation {
  storeId: string;
  storeName: string;
  pincode: string;
  city: string;
  deliveryTimeMinutes?: number;
  isOpen?: boolean;
  openingHours?: string;
}

interface AddressStore {
  // State
  addresses: Address[];
  selectedAddressId: string | null;
  selectedLocation: SelectedLocation | null;
  locationVersion: number; // Incremented when location changes (triggers re-fetches)

  // Actions
  setAddresses: (addresses: Address[]) => void;
  selectAddress: (id: string) => void;
  setSelectedLocation: (location: SelectedLocation) => void;
  removeAddress: (id: string) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  getSelectedAddress: () => Address | null;
  bumpLocationVersion: () => void;
  clearStore: () => void;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      selectedLocation: null,
      locationVersion: 0,

      setAddresses: (addresses) => set({ addresses }),

      selectAddress: (id) => {
        const address = get().addresses.find((a) => a.id === id);
        if (address) {
          set({
            selectedAddressId: id,
            // Set minimal location immediately; storeId resolved in background
            selectedLocation: {
              storeId: "",
              storeName: "",
              pincode: address.pincode,
              city: address.city,
            },
            locationVersion: get().locationVersion + 1,
          });
        }
      },

      setSelectedLocation: (location) =>
        set({
          selectedLocation: location,
          locationVersion: get().locationVersion + 1,
        }),

      removeAddress: (id) => {
        const newAddresses = get().addresses.filter((a) => a.id !== id);
        set({
          addresses: newAddresses,
          // If removed address was selected, clear selection
          selectedAddressId:
            get().selectedAddressId === id ? null : get().selectedAddressId,
        });
      },

      addAddress: (address) => {
        set({ addresses: [...get().addresses, address] });
      },

      updateAddress: (updated) => {
        set({
          addresses: get().addresses.map((a) =>
            a.id === updated.id ? updated : a
          ),
        });
      },

      getSelectedAddress: () => {
        const { selectedAddressId, addresses } = get();
        return addresses.find((a) => a.id === selectedAddressId) || null;
      },

      bumpLocationVersion: () =>
        set({ locationVersion: get().locationVersion + 1 }),

      clearStore: () =>
        set({
          addresses: [],
          selectedAddressId: null,
          selectedLocation: null,
          locationVersion: 0,
        }),
    }),
    {
      name: "fish-studio-addresses",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist selectedLocation and selectedAddressId (not full addresses list)
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        selectedAddressId: state.selectedAddressId,
        locationVersion: state.locationVersion,
      }),
    }
  )
);
