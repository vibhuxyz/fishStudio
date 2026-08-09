"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

type OperationalRole = "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";

const STAFF_ROLE_HOME: Record<OperationalRole, string> = {
  ORDER_MANAGER: "/staff/orders",
  RIDER: "/staff/rider",
  CUTTING_STAFF: "/staff/cutting",
};

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
    if (seller.role !== "staff") {
      router.replace("/staff/login");
      return;
    }
    if (seller.staffRole !== role) {
      // A signed-in staff member on the wrong subtree belongs on their own
      // screen, not back at the login form — sending them to /staff/login
      // while they hold a valid session reads as "login didn't work" and
      // leaves them with no way forward.
      const home = STAFF_ROLE_HOME[seller.staffRole as OperationalRole];
      router.replace(home ?? "/staff/login");
    }
  }, [seller, isLoading, router, role]);

  return { staff: seller, isLoading };
};

export default useRequireStaffRole;
