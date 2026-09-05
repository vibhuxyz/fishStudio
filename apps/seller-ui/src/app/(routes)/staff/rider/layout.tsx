"use client";
import React from "react";
import { LogOut, Bike, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useRequireStaffRole from "@/hooks/useRequireStaffRole";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useAuthStore } from "@/store/authStore";
import StaffPwaMeta from "@/shared/components/staff-pwa-meta";
import useOrderAlerts from "@/hooks/useOrderAlerts";

const RiderLayout = ({ children }: { children: React.ReactNode }) => {
  const { staff, isLoading } = useRequireStaffRole("RIDER");
  useOrderAlerts("RIDER");
  const router = useRouter();
  const pathname = usePathname();
  const { setLoggedIn, setRole } = useAuthStore();
  const isSellerViewing = staff?.role === "seller";

  const handleLogout = async () => {
    // A seller viewing their own rider dashboard isn't logged in as staff —
    // just send them back, don't tear down their seller session.
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
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Bike size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{staff?.name}</p>
            <p className="text-xs text-gray-500 leading-tight">{isSellerViewing ? "Rider View" : "Rider"}</p>
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
      <nav className="sticky top-[57px] z-10 flex border-b border-gray-800 bg-[#0d1117]">
        {[
          { href: "/staff/rider/orders", label: "Orders" },
          { href: "/staff/rider/shift", label: "My Shift" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              pathname === tab.href
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <main className="max-w-lg mx-auto pb-8">{children}</main>
    </div>
  );
};

export default RiderLayout;
