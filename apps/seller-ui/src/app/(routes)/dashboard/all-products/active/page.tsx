"use client";

import React from "react";
import InventoryProductList from "@/shared/components/inventory/product-list";

const ActiveProductsPage = () => {
  return (
    <div className="min-h-screen w-full p-8">
      <InventoryProductList 
        statusFilter="Active"
        title="Active Products"
        description="View and manage products that are currently active in your shop."
      />
    </div>
  );
};

export default ActiveProductsPage;
