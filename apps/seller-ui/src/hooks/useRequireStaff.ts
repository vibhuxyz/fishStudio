"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRequireStaff = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      // /staff/* routes (order manager, rider, cutting) have their own
      // staff login — bouncing to the seller /login sends a staff member
      // into a form they have no seller credentials for.
      router.replace(pathname?.startsWith("/staff/") ? "/staff/login" : "/login");
    }
    // Both 'seller' and 'staff' roles can access staff routes
  }, [seller, isLoading, router, pathname]);

  return { staff: seller, isLoading };
};

export default useRequireStaff;
