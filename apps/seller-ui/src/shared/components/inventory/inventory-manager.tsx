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
  Eye,
  LayoutList,
  Loader2,
  PackageSearch,
  Save,
  Search,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { frontendEnv } from "@/config/env";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-owned-products", isProtected);
  return Array.isArray(res.data.products) ? res.data.products : [];
};

const updateProduct = async ({
  productId,
  stock,
  sale_price,
}: {
  productId: string;
  stock: number;
  sale_price: number;
}) => {
  await axiosInstance.put(
    `/product/api/update-product/${productId}`,
    { stock, sale_price },
    isProtected,
  );
};

const InventoryManager = () => {
  useRequireAuth("product");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingRows, setEditingRows] = useState<Record<string, { stock: number; sale_price: number }>>({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["seller", "products", "inventory"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      toast.success("Inventory updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update inventory.");
    },
  });

  const handleInputChange = (productId: string, field: "stock" | "sale_price", value: number) => {
    const currentProduct = products.find((p: any) => p.id === productId);
    if (!currentProduct) return;

    setEditingRows((prev) => {
      const existing = prev[productId] || {
        stock: currentProduct.stock ?? 0,
        sale_price: currentProduct.sale_price ?? 0,
      };
      return {
        ...prev,
        [productId]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleUpdate = (productId: string) => {
    const editData = editingRows[productId];
    if (!editData) return;

    mutation.mutate({ productId, ...editData });
    setEditingRows((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleReset = (productId: string) => {
    setEditingRows((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images?.[0]?.url || "/placeholder.png"}
            alt={row.original.title}
            width={200}
            height={200}
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-800"
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Product Name",
        cell: ({ row }: any) => {
          const title = row.original.title || "Untitled product";
          return (
            <div className="flex flex-col">
              <span className="font-medium text-white truncate max-w-[200px]" title={title}>
                {title}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {row.original.category}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "sale_price",
        header: "Sale Price (₹)",
        cell: ({ row }: any) => {
          const productId = row.original.id;
          const isEditing = !!editingRows[productId];
          const value = isEditing ? editingRows[productId].sale_price : (row.original.sale_price ?? 0);

          return (
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(productId, "sale_price", Number(e.target.value))}
              className={`w-24 rounded-md border bg-slate-900/50 px-2 py-1 text-sm outline-none transition-all ${
                isEditing ? "border-blue-500 ring-1 ring-blue-500/50" : "border-slate-800 focus:border-slate-600"
              }`}
            />
          );
        },
      },
      {
        accessorKey: "stock",
        header: "Stock Level",
        cell: ({ row }: any) => {
          const productId = row.original.id;
          const isEditing = !!editingRows[productId];
          const value = isEditing ? editingRows[productId].stock : (row.original.stock ?? 0);

          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value}
                onChange={(e) => handleInputChange(productId, "stock", Number(e.target.value))}
                className={`w-20 rounded-md border bg-slate-900/50 px-2 py-1 text-sm outline-none transition-all ${
                  isEditing ? "border-blue-500 ring-1 ring-blue-500/50" : "border-slate-800 focus:border-slate-600"
                } ${value < 10 ? "text-red-400" : "text-white"}`}
              />
              {value < 5 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Low Stock" />}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
              row.original.status === "Active"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {row.original.status === "NonActive" ? "Inactive" : (row.original.status || "Active")}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => {
          const productId = row.original.id;
          const isEditing = !!editingRows[productId];

          return (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleUpdate(productId)}
                    disabled={mutation.isPending}
                    className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {mutation.isPending && mutation.variables?.productId === productId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => handleReset(productId)}
                    className="rounded-md border border-slate-700 p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    title="Undo Changes"
                  >
                    <Undo2 size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`${frontendEnv.userUiUrl}/product/${row.original.slug}`}
                    target="_blank"
                    className="rounded-md border border-slate-800 p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-blue-400"
                    title="View Product"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => router.push(`/dashboard/products/${row.original.id}`)}
                    className="rounded-md border border-slate-800 p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
                    title="Edit Full Product"
                  >
                    <LayoutList size={16} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [editingRows, mutation.isPending, mutation.variables, router],
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
    <div className="min-h-screen w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Boxes className="text-blue-500" /> Inventory Manager
          </h2>
          <p className="text-slate-400">Quickly update stock levels and pricing without leaving the dashboard.</p>
        </div>
        <Link
          href="/dashboard/create-product"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <PackageSearch size={20} /> Add New Product
        </Link>
      </div>

      <div className="mb-6">
        <BreadCrumbs title="Inventory Management" />
      </div>

      <div className="mb-6 flex items-center rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 group focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
        <Search size={20} className="mr-3 text-slate-500 group-focus-within:text-blue-500" />
        <input
          type="text"
          placeholder="Search items by name, category..."
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="relative overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-sm p-2 shadow-2xl">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center space-y-4">
             <div className="flex flex-col items-center gap-3">
               <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
               <p className="text-slate-400 font-medium">Crunching your catalog...</p>
             </div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-800/50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-4 font-semibold">
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
            <tbody className="divide-y divide-slate-800/30">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group transition-colors hover:bg-slate-900/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4">
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-slate-900 p-4">
              <Boxes size={40} className="text-slate-700" />
            </div>
            <p className="text-lg font-medium text-white">No items in your inventory</p>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Start by adding products from the catalog to your shop.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
