"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import React from "react";
import { isProtected } from "../utils/protected";

// Fetch logged-in account — tries seller first, then staff
const fetchSeller = async () => {
  try {
    const response = await axiosInstance.get("/auth/api/logged-in-seller", {
      ...isProtected,
      headers: { "x-auth-role": "seller" },
    } as any);
    return { ...response.data.seller, role: "seller" };
  } catch {
    // Fallback to staff
    const staffResponse = await axiosInstance.get("/auth/api/logged-in-staff", {
      ...isProtected,
      headers: { "x-auth-role": "staff" },
    } as any);
    const staff = staffResponse.data.staff;
    return { ...staff, role: "staff" };
  }
};

const useSeller = () => {
  const { setLoggedIn, isLoggedIn, setRole } = useAuthStore();

  const {
    data: seller,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: isLoggedIn,
  });

  React.useEffect(() => {
    if (seller) {
      setLoggedIn(true);
      setRole(seller.role ?? null);
    } else if (isError) {
      setLoggedIn(false);
      setRole(null);
    }
  }, [seller, isError, setLoggedIn, setRole]);

  return { seller: seller as any, isLoading: isPending, isError };
};

export default useSeller;
