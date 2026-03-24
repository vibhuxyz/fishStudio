"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth, setAuthenticatedUser } from "@/lib/auth-store";

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type?: "Home" | "Work" | "Other";
}

export function useAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // We can just use the user object from auth store, but for fresh data:
  const query = useQuery({
    queryKey: ["user-addresses"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/api/logged-in-user");
      if (data.success) {
        // Sync auth store if addresses changed
        setAuthenticatedUser(data.user);
        return (data.user.addresses || []) as Address[];
      }
      return [] as Address[];
    },
    enabled: !!user,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (address: Omit<Address, "id">) => {
      const { data } = await axiosInstance.post("/auth/api/add-address", { address });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-addresses"], data.addresses);
      // Sync auth store
      if (user) {
        setAuthenticatedUser({ ...user, addresses: data.addresses } as any);
      }
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const { data } = await axiosInstance.delete(`/auth/api/delete-address/${addressId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-addresses"], data.addresses);
      // Sync auth store
      if (user) {
        setAuthenticatedUser({ ...user, addresses: data.addresses } as any);
      }
    },
  });

  return {
    addresses: query.data || [],
    isLoading: query.isLoading,
    addAddress: addAddressMutation.mutateAsync,
    isAdding: addAddressMutation.isPending,
    deleteAddress: deleteAddressMutation.mutateAsync,
    isDeleting: deleteAddressMutation.isPending,
  };
}
