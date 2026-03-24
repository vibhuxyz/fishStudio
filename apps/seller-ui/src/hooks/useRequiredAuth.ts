import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRequireAuth = (requiredPermission?: string) => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.replace("/login");
    } else if (!isLoading && seller && seller.role === "staff") {
      // Staff cannot access the seller dashboard — redirect to their own portal
      router.replace("/staff/orders");
    } else if (!isLoading && seller && seller.role === "seller" && !seller.isApprovedByAdmin) {
      // Sellers must be approved by admin to access the full dashboard
      router.replace("/pending-approval");
    } else if (!isLoading && seller && seller.role === "seller" && requiredPermission) {
      const perms = seller.permissions || [];
      if (!perms.includes("full_access") && !perms.includes(requiredPermission)) {
        router.replace("/dashboard");
      }
    }
  }, [seller, isLoading, router, requiredPermission]);

  return { seller, isLoading };
};

export default useRequireAuth;
