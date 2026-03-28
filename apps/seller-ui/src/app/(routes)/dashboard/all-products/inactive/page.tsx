"use client";

import React from "react";
import InventoryProductList from "@/shared/components/inventory/product-list";
import useRequireAuth from "@/hooks/useRequiredAuth";

const InactiveProductsPage = () => {
  useRequireAuth("product");
  return (
    <div className="min-h-screen w-full p-8">
      <InventoryProductList 
        statusFilter="NonActive"
        title="Inactive Products"
        description="View and manage products that are currently inactive/hidden from your shop."
      />
    </div>
  );
};

export default InactiveProductsPage;
