"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "./useSeller";

const useRequireStaff = () => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();
  
  useEffect(() => {
    if (!isLoading && !seller) {
      router.replace("/login");
    }
    // Both 'seller' and 'staff' roles can access staff routes
  }, [seller, isLoading, router]);

  return { staff: seller, isLoading };
};

export default useRequireStaff;
