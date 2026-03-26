"use client";

import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Boxes,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { SellerOwnedProduct } from "@repo/zod-schema";

interface Props {
  title: string;
  description: string;
}

const fetchProducts = async (page: number) => {
  const res = await axiosInstance.get(`/product/api/get-owned-products?page=${page}&limit=20`, isProtected);
  return { products: Array.isArray(res.data.products) ? res.data.products : [], pagination: res.data.pagination };
};

const updateStock = async ({ productId, stockAdjustment }: { productId: string, stockAdjustment: number }) => {
  const res = await axiosInstance.put(`/product/api/update-product-stock/${productId}`, { stockAdjustment }, isProtected);
  return res.data;
};

const InventoryManagementList = ({ title, description }: Props) => {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["seller", "products", "inventory", page],
    queryFn: () => fetchProducts(page),
    staleTime: 1000 * 60 * 2,
  });

  const mutation = useMutation({
    mutationFn: updateStock,
    onSuccess: (data, variables) => {
      toast.success(`Stock updated for ${variables.productId}`);
      /*
       * [x] Standardize toast colors with Sonner across all apps
       * [x] Update Cloudinary folder for category images to `fishStudio/categriy/categoryImage/images`
       * [x] Implement Inventory Management & Stock Logic
       *     [x] Automate stock deduction on order placement
       *     [x] Automate stock restoration on order rejection
       *     [x] Create Product Service stock update endpoint
       *     [x] Build Seller Dashboard Inventory Management page
       *     [x] Build Staff Portal Inventory Management page
       *     [x] Add Inventory links to both sidebars
       * [x] Refactor Product Controller into Modular Modules
       *     [x] Create `src/controllers/product/` directory
       *     [x] Extract shared types and helpers into `utils.ts`
       *     [x] Extract Categories, Coupons, Events, Banners, and Image logic
       *     [x] Sanitize core Product CRUD logic
       *     [x] Update `product.routes.ts` with new modular imports
       *     [x] Remove legacy 2,700-line monolithic controller
       * [x] Refactor Order Service into Modular Controllers
       *     [x] Create `src/controllers/order/` directory
       *     [x] Extract shared stats and cache logic into `utils.ts`
       *     [x] Split into User, Seller, and Stats controllers
       *     [x] Update `order.route.ts` with new modular imports
       * [x] Refactor Auth Service (Seller module) into Modular Controllers
       *     [x] Create `src/controller/seller/` directory
       *     [x] Split into Auth, Store, and Admin controllers
       *     [x] Update `auth.router.ts` with new modular imports
       */
      queryClient.invalidateQueries({ queryKey: ["seller", "products", "inventory"] });
      setAdjustments(prev => {
        const next = { ...prev };
        delete next[variables.productId];
        return next;
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update stock");
    }
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  const handleAdjustmentChange = (productId: string, value: string) => {
    const num = parseInt(value);
    setAdjustments(prev => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : num
    }));
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: { row: { original: SellerOwnedProduct } }) => (
          <Image
            src={row.original.images?.[0]?.url || "/placeholder.png"}
            alt={row.original.title}
            width={80}
            height={80}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Product",
        cell: ({ row }: { row: { original: SellerOwnedProduct } }) => (
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm truncate max-w-[200px]">{row.original.title}</span>
            <span className="text-gray-500 text-[10px] uppercase tracking-wider font-mono">#{row.original.id.slice(-6)}</span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: { row: { original: SellerOwnedProduct } }) => (
          <span className="text-gray-400 text-xs">{row.original.category}</span>
        )
      },
      {
        accessorKey: "currentStock",
        header: "Current Stock",
        cell: ({ row }: { row: { original: SellerOwnedProduct } }) => (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${row.original.stock <= 5 ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
            <span className={`font-mono font-bold ${row.original.stock <= 5 ? "text-red-400" : "text-white"}`}>
              {row.original.stock ?? 0}
            </span>
          </div>
        ),
      },
      {
        id: "adjustment",
        header: "Add More Stock",
        cell: ({ row }: { row: { original: SellerOwnedProduct } }) => (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[100px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Plus size={14} />
              </div>
              <input
                type="number"
                min="0"
                placeholder="0"
                className="w-full bg-black/40 border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-sm text-white focus:border-blue-500/50 outline-none transition"
                value={adjustments[row.original.id] || ""}
                onChange={(e) => handleAdjustmentChange(row.original.id, e.target.value)}
              />
            </div>
            <button
              onClick={() => mutation.mutate({ productId: row.original.id, stockAdjustment: adjustments[row.original.id] || 0 })}
              disabled={mutation.isPending || !adjustments[row.original.id]}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition active:scale-95"
              title="Update Stock"
            >
              {mutation.isPending && mutation.variables?.productId === row.original.id ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </button>
          </div>
        ),
      },
    ],
    [adjustments, mutation]
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Boxes className="text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic italic-none">
              {title}
            </h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <RefreshCw size={12} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Auto-Sync Active</span>
          </div>
          <p className="text-[10px] text-gray-600 font-medium">Stock updates on order status changes</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#0f1117] border border-gray-800/60 rounded-2xl px-4 py-3 shadow-xl focus-within:border-blue-500/40 transition-colors">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          className="w-full bg-transparent text-white outline-none placeholder:text-gray-600 text-sm font-medium"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="bg-[#0f1117] border border-gray-800/60 rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
             <RefreshCw size={40} className="text-blue-500 animate-spin opacity-20" />
             <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">Loading Inventory...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-black/20 border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group hover:bg-gray-800/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && products.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-bold uppercase tracking-widest">No products found</p>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <span>{pagination.total} Total Items</span>
          <div className="flex items-center gap-4">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900 transition text-white"
            >
              Previous
            </button>
            <span className="text-blue-400">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900 transition text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagementList;
