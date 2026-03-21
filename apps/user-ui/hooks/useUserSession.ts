"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { setAuthenticatedUser, type User } from "@/lib/auth-store";
import { storefrontKeys } from "@/lib/storefront";

const fetchLoggedInUser = async (): Promise<User | null> => {
  const response = await axiosInstance.get("/auth/api/logged-in-user");
  const user = response?.data?.user;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    phone: user.phone_number,
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
      setAuthenticatedUser(query.data);
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
