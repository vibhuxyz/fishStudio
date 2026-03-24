"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { setAuthenticatedUser, type User } from "@/lib/auth-store";
import { useAddressStore, type Address } from "@/lib/address-store";
import { storefrontKeys } from "@/lib/storefront";

interface UserWithAddresses extends User {
  addresses?: Address[];
}

const fetchLoggedInUser = async (): Promise<UserWithAddresses | null> => {
  const response = await axiosInstance.get("/auth/api/logged-in-user");
  const user = response?.data?.user;

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    phone: user.phone_number,
    email: user.email,
    addresses: (user.addresses as Address[]) || [],
  };
};

export function useUserSession() {
  const query = useQuery({
    queryKey: storefrontKeys.userSession,
    queryFn: fetchLoggedInUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setAuthenticatedUser({
        id: query.data.id,
        name: query.data.name,
        phone: query.data.phone,
        email: query.data.email,
      });
      // Hydrate address store from DB on login
      useAddressStore.getState().setAddresses(query.data.addresses ?? []);
      return;
    }

    if (query.isError) {
      setAuthenticatedUser(null);
    }
  }, [query.data, query.isError]);

  return {
    ...query,
    user: query.data ?? null,
  };
}
