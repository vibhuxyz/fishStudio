"use client";
import StaffSidebar from "@/shared/components/staff-sidebar/staff-sidebar";
import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useRequireStaff from "@/hooks/useRequireStaff";
import { useWorkerWS } from "@/context/worker-ws-context";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { staff, isLoading } = useRequireStaff();
  // Shared persistent WS connection established at app root — no new socket here.
  const { subscribe } = useWorkerWS();

  // Subscribe to STAFF_ACCESS_GRANTED only while the staff member is inactive.
  // When the seller grants access, invalidate the seller query so isActive becomes true.
  useEffect(() => {
    const staffId = staff?.id;
    if (!staffId || staff?.isActive !== false) return;

    return subscribe("STAFF_ACCESS_GRANTED", () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
    });
  }, [staff?.id, staff?.isActive, subscribe, queryClient]);

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
