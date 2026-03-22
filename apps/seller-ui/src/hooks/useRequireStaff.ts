import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

// Redirect staff to /staff/orders if they try to access seller-only routes
const useRequireStaff = () => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.replace("/login");
    } else if (!isLoading && seller && seller.role !== "staff") {
      router.replace("/dashboard");
    }
  }, [seller, isLoading, router]);

  return { staff: seller, isLoading };
};

export default useRequireStaff;
