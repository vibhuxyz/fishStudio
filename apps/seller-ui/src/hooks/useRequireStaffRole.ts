"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

/**
 * Gate a Rider/Cutting-Staff route to its own operational role only.
 * A seller is always let through — they own every staff view under their
 * shop and shouldn't need a second, separate staff login.
 */
const useRequireStaffRole = (role: "RIDER" | "CUTTING_STAFF") => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (isLoading) return;
    if (!seller) {
      router.replace("/staff/login");
      return;
    }
    if (seller.role === "seller") return;
    if (seller.role !== "staff" || seller.staffRole !== role) {
      router.replace("/staff/login");
    }
  }, [seller, isLoading, router, role]);

  return { staff: seller, isLoading };
};

export default useRequireStaffRole;
