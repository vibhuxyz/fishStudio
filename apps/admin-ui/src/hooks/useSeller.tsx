"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  adminQueryKeys,
  fetchAdminProfile,
  type AdminProfile,
} from "./useAdminQueries";

const useSeller = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const {
    data: seller,
    isPending,
    isError,
  } = useQuery<AdminProfile | null>({
    queryKey: adminQueryKeys.account,
    queryFn: fetchAdminProfile,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: isLoggedIn,
  });

  React.useEffect(() => {
    if (seller) {
      setLoggedIn(true);
    } else if (isError) {
      setLoggedIn(false);
    }
  }, [seller, isError, setLoggedIn]);

  return { seller: seller as any, isLoading: isPending, isError };
};

export default useSeller;
