"use client";
import StaffSidebar from "@/shared/components/staff-sidebar/staff-sidebar";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useSeller from "@/hooks/useSeller";
import { useWorkerWS } from "@/context/worker-ws-context";
import StaffPwaMeta from "@/shared/components/staff-pwa-meta";

// This layout wraps every route under /staff/* in Next.js's nesting model,
// but /staff/login and the Rider/Cutting-Staff subtrees are fully
// self-contained (their own auth gate + chrome) — this layout's
// ORDER_MANAGER gate and StaffSidebar must not wrap them, and its redirect
// must not fire for them either (hence useSeller directly instead of the
// auto-redirecting useRequireStaff).
const SELF_CONTAINED_PREFIXES = ["/staff/login", "/staff/rider", "/staff/cutting"];

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller: staff, isLoading } = useSeller();
  // Shared persistent WS connection established at app root — no new socket here.
  const { subscribe } = useWorkerWS();

  const isSelfContained = SELF_CONTAINED_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (!isSelfContained && !isLoading && !staff) {
      router.replace("/login");
    }
  }, [isSelfContained, isLoading, staff, router]);

  // Subscribe to STAFF_ACCESS_GRANTED only while the staff member is inactive.
  // When the seller grants access, invalidate the seller query so isActive becomes true.
  useEffect(() => {
    const staffId = staff?.id;
    if (!staffId || staff?.isActive !== false) return;

    return subscribe("STAFF_ACCESS_GRANTED", () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    });
  }, [staff?.id, staff?.isActive, subscribe, queryClient]);

  if (isSelfContained) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#080b12] flex items-center justify-center text-white">Loading...</div>;
  }

  // If role is staff but they are not active (and not a seller with full access)
  if (staff && staff.role === "staff" && !staff.isActive) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center text-white">
        <div className="bg-[#111827] border border-gray-800 p-8 rounded-xl text-center max-w-md">
           <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
           <p className="text-gray-300">Seller is not allow you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#080b12] min-h-screen">
      <StaffPwaMeta />
      <aside className="w-[260px] min-w-[240px] max-w-[280px] border-r border-gray-800/60 text-white">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <StaffSidebar />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;
