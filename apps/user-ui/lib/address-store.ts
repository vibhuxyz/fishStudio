import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AddressType = "Home" | "Work" | "Other";

export interface Address {
  id: string;
  label: AddressType;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface SelectedLocation {
  storeId: string;
  storeName: string;
  pincode: string;
  city: string;
  deliveryTimeMinutes?: number;
}

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  selectedLocation: SelectedLocation | null;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  getSelectedAddress: () => Address | null;
  setSelectedLocation: (location: SelectedLocation | null) => void;
  setAddresses: (addresses: Address[]) => void;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      selectedLocation: null,

      setSelectedLocation: (location: SelectedLocation | null) => set({ selectedLocation: location }),

      setAddresses: (addresses: Address[]) =>
        set((state) => {
          const stillExists = addresses.some((a) => a.id === state.selectedAddressId);
          return {
            addresses,
            selectedAddressId: stillExists
              ? state.selectedAddressId
              : (addresses[0]?.id ?? null),
          };
        }),

      addAddress: (address: Omit<Address, "id">) => {
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`,
        };
        set((state) => ({
          addresses: [...state.addresses, newAddress],
          selectedAddressId: newAddress.id,
        }));
      },

      updateAddress: (id: string, updated: Partial<Address>) => {
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          ),
        }));
      },

      removeAddress: (id: string) => {
        set((state) => {
          const filtered = state.addresses.filter((a) => a.id !== id);
          return {
            addresses: filtered,
            selectedAddressId:
              state.selectedAddressId === id
                ? (filtered[0]?.id ?? null)
                : state.selectedAddressId,
          };
        });
      },

      selectAddress: (id: string) => set({ selectedAddressId: id }),

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return addresses.find((a) => a.id === selectedAddressId) ?? null;
      },

      clearAddresses: () =>
        set({ addresses: [], selectedAddressId: null, selectedLocation: null }),
    }),
    {
      name: "fish-studio-addresses",
      // Only persist selected location and selected ID — addresses come from DB on login
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        selectedAddressId: state.selectedAddressId,
      }),
    }
  )
);
