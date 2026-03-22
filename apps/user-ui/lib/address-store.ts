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

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  getSelectedAddress: () => Address | null;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    name: "Rahul Sharma",
    phone: "9876543210",
    street: "42, Marine Drive, Flat 3B",
    landmark: "Near Fish Market",
    area: "Marine Lines",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400002",
    lat: 18.9438,
    lng: 72.8232,
  },
  {
    id: "addr-2",
    label: "Work",
    name: "Rahul Sharma",
    phone: "9876543210",
    street: "BKC, Bandra Kurla Complex, Tower 1",
    landmark: "HDFC Bank Building",
    area: "Bandra East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    lat: 19.0596,
    lng: 72.8656,
  },
];

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: MOCK_ADDRESSES,
      selectedAddressId: "addr-1",

      addAddress: (address) => {
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`,
        };
        set((state) => ({
          addresses: [...state.addresses, newAddress],
          selectedAddressId: newAddress.id,
        }));
      },

      updateAddress: (id, updated) => {
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          ),
        }));
      },

      removeAddress: (id) => {
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

      selectAddress: (id) => set({ selectedAddressId: id }),

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        return addresses.find((a) => a.id === selectedAddressId) ?? null;
      },
    }),
    { name: "fish-studio-addresses" }
  )
);

// Nearby address mock data for pincode search (2km radius simulation)
export const PINCODE_AREA_MAP: Record<string, { area: string; city: string; state: string }[]> = {
  "400002": [
    { area: "Marine Lines", city: "Mumbai", state: "Maharashtra" },
    { area: "Churchgate", city: "Mumbai", state: "Maharashtra" },
    { area: "Nariman Point", city: "Mumbai", state: "Maharashtra" },
  ],
  "400051": [
    { area: "Bandra East", city: "Mumbai", state: "Maharashtra" },
    { area: "BKC", city: "Mumbai", state: "Maharashtra" },
    { area: "Kalina", city: "Mumbai", state: "Maharashtra" },
  ],
  "400001": [
    { area: "Fort", city: "Mumbai", state: "Maharashtra" },
    { area: "CST", city: "Mumbai", state: "Maharashtra" },
    { area: "Ballard Estate", city: "Mumbai", state: "Maharashtra" },
  ],
  "110001": [
    { area: "Connaught Place", city: "New Delhi", state: "Delhi" },
    { area: "Janpath", city: "New Delhi", state: "Delhi" },
    { area: "Patel Chowk", city: "New Delhi", state: "Delhi" },
  ],
  "600001": [
    { area: "George Town", city: "Chennai", state: "Tamil Nadu" },
    { area: "Rajaji Salai", city: "Chennai", state: "Tamil Nadu" },
    { area: "Parry's Corner", city: "Chennai", state: "Tamil Nadu" },
  ],
};

// Mock nearby addresses within 2km of selected pincode
export function getNearbyAddresses(pincode: string): { address: string; distance: string }[] {
  const areas = PINCODE_AREA_MAP[pincode];
  if (!areas) return [];
  return areas.map((a, i) => ({
    address: `${a.area}, ${a.city}, ${a.state} - ${pincode}`,
    distance: `${(0.3 + i * 0.6).toFixed(1)} km`,
  }));
}
