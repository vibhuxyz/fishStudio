"use client";
import React from "react";
import { LogOut, Scissors, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import useRequireStaffRole from "@/hooks/useRequireStaffRole";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useAuthStore } from "@/store/authStore";
import StaffPwaMeta from "@/shared/components/staff-pwa-meta";
import useOrderAlerts from "@/hooks/useOrderAlerts";

const CuttingLayout = ({ children }: { children: React.ReactNode }) => {
  const { staff, isLoading } = useRequireStaffRole("CUTTING_STAFF");
  useOrderAlerts("CUTTING_STAFF");
  const router = useRouter();
  const { setLoggedIn, setRole } = useAuthStore();
  const isSellerViewing = staff?.role === "seller";

  const handleLogout = async () => {
    // A seller viewing their own cutting-staff dashboard isn't logged in as
    // staff — just send them back, don't tear down their seller session.
    if (isSellerViewing) {
      router.push("/dashboard");
      return;
    }
    try {
      await axiosInstance.post(
        "/auth/api/logout-staff",
        {},
        { ...isProtected, headers: { "x-auth-role": "staff" } } as any,
      );
    } catch {
      // Best-effort — clear local state and redirect regardless.
    }
    setLoggedIn(false);
    setRole(null);
    router.push("/staff/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (staff && !staff.isActive) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center text-white p-6">
        <div className="bg-[#111827] border border-gray-800 p-8 rounded-xl text-center max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-gray-300">Your account has been deactivated. Contact your seller.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <StaffPwaMeta />
      <header className="sticky top-0 z-20 bg-[#0d1117] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center">
            <Scissors size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{staff?.name}</p>
            <p className="text-xs text-gray-500 leading-tight">{isSellerViewing ? "Cutting Staff View" : "Cutting Staff"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          aria-label={isSellerViewing ? "Back to dashboard" : "Logout"}
        >
          {isSellerViewing ? <ArrowLeft size={18} /> : <LogOut size={18} />}
        </button>
      </header>
      <main className="max-w-lg mx-auto pb-8">{children}</main>
    </div>
  );
};

export default CuttingLayout;
