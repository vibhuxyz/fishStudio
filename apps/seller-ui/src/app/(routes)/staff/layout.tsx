import StaffSidebar from "@/shared/components/staff-sidebar/staff-sidebar";
import React from "react";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
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
