"use client";

import React from "react";
import InventoryProductList from "@/shared/components/inventory/product-list";
import useRequireAuth from "@/hooks/useRequiredAuth";

const AllProductsPage = () => {
  useRequireAuth("product");
  return (
    <div className="min-h-screen w-full p-8">
      <InventoryProductList 
        title="All Store Products"
        description="Manage all products in your shop's inventory."
      />
    </div>
  );
};

export default AllProductsPage;
