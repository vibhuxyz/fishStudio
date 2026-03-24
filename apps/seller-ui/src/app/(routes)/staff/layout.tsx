"use client";
import StaffSidebar from "@/shared/components/staff-sidebar/staff-sidebar";
import React from "react";
import useRequireStaff from "@/hooks/useRequireStaff";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const { staff, isLoading } = useRequireStaff();

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
