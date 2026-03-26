"use client";

import React from "react";
import InventoryManagementList from "@/shared/components/inventory/management-list";
import useRequireAuth from "@/hooks/useRequiredAuth";

const InventoryPage = () => {
  useRequireAuth("product");
  return (
    <div className="min-h-screen w-full p-8 bg-[#08090d]">
      <InventoryManagementList 
        title="Inventory Management"
        description="Quickly adjust stock levels and track inventory automatically."
      />
    </div>
  );
};

export default InventoryPage;
