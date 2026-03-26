"use client";

import React from "react";
import InventoryManagementList from "@/shared/components/inventory/management-list";
import useRequireStaff from "@/hooks/useRequireStaff";

const StaffInventoryPage = () => {
  useRequireStaff();
  return (
    <div className="min-h-screen w-full p-8 bg-[#08090d]">
      <InventoryManagementList 
        title="Inventory Tracking"
        description="Monitor fish stock and update availability for the shop."
      />
    </div>
  );
};

export default StaffInventoryPage;
