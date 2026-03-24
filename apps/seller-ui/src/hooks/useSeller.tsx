"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import React from "react";
import { isProtected } from "../utils/protected";

const useSeller = () => {
  const { setLoggedIn, isLoggedIn, role, setRole } = useAuthStore();

  const {
    data: seller,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller", role],
    queryFn: async () => {
      // If we already know the user is a staff member, skip the seller fetch to avoid 401s
      if (role === "staff") {
        const staffResponse = await axiosInstance.get("/auth/api/logged-in-staff", {
          ...isProtected,
          headers: { "x-auth-role": "staff" },
        } as any);
        return { ...staffResponse.data.staff, role: "staff" };
      }

      try {
        const response = await axiosInstance.get("/auth/api/logged-in-seller", {
          ...isProtected,
          headers: { "x-auth-role": "seller" },
        } as any);
        return { ...response.data.seller, role: "seller" };
      } catch {
        // Fallback to staff if role is unknown or seller failed
        const staffResponse = await axiosInstance.get("/auth/api/logged-in-staff", {
          ...isProtected,
          headers: { "x-auth-role": "staff" },
        } as any);
        return { ...staffResponse.data.staff, role: "staff" };
      }
    },
    staleTime: 1000 * 60 * 5,   // 5 min — don't refetch while cached
    gcTime: 1000 * 60 * 5,      // 5 min — keep error cached, prevent loop on remount
    retry: false,
  });

  React.useEffect(() => {
    if (seller) {
      setLoggedIn(true);
      setRole(seller.role ?? null);
    }
    // Don't call setLoggedIn(false) on error — that causes an
    // infinite loop because the store resets to true on next mount.
  }, [seller, setLoggedIn, setRole]);

  return { seller: seller as any, isLoading: isPending, isError };
};

export default useSeller;
