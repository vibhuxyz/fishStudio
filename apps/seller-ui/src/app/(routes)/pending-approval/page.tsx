"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import useSeller from "@/hooks/useSeller";
import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { seller, isLoading } = useSeller();
  const { setLoggedIn, setRole } = useAuthStore();

  useEffect(() => {
    // If they get approved while on this page, push them back to dashboard
    if (!isLoading && seller && seller.isApprovedByAdmin) {
      router.replace("/dashboard");
    }
  }, [seller, isLoading, router]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/api/logout-seller");
      setLoggedIn(false);
      setRole(null);
      router.replace("/login");
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="max-w-md w-full space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Pending Approval</h2>
          <p className="text-slate-400">
            Your seller account has been registered, but it is currently pending review. 
            An admin must approve your seller profile before you can access the dashboard.
          </p>
          <p className="text-sm text-slate-500">
            Please check back later or contact support if you have any questions.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}
