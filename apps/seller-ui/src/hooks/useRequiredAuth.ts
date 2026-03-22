import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRequireAuth = () => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.replace("/login");
    } else if (!isLoading && seller && seller.role === "staff") {
      // Staff cannot access the seller dashboard — redirect to their own portal
      router.replace("/staff/orders");
    }
  }, [seller, isLoading, router]);

  return { seller, isLoading };
};

export default useRequireAuth;
