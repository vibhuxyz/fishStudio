"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Eye, Plus, BarChart, Pencil, RotateCcw, Star, Trash, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";
import EditProductModal from "@/shared/components/modals/edit-product.modal";
import AnalyticsModal from "@/shared/components/modals/analytics.modal";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  adminQueryKeys,
  deleteAdminProduct,
  restoreAdminProduct,
  type AdminProduct,
  updateAdminProduct,
  useAdminProducts,
} from "@/hooks/useAdminQueries";
import { frontendEnv } from "@/config/env";
import axiosInstance from "@/utils/axiosInstance";

const ProductList = () => {
  const [analyticsData, setAnalyticsData] = useState<AdminProduct | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const queryClient = useQueryClient();

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const { data } = await axiosInstance.post("/product/api/admin/reindex-search");
      toast.success(data.message || "Search index rebuilt");
    } catch {
      toast.error("Reindex failed");
    } finally {
      setReindexing(false);
    }
  };

  const { data: products = [], isLoading } = useAdminProducts();

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products });
      setShowDeleteModal(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products });
      setShowDeleteModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.products });
      setShowEditModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: { row: { original: AdminProduct } }) => {
          const imageUrl = row.original.images?.[0]?.url || "/file.svg";
          return (
            <Image
              src={imageUrl}
              alt={row.original.title}
              width={48}
              height={48}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: { row: { original: AdminProduct } }) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${frontendEnv.userUiUrl}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: { row: { original: AdminProduct } }) => (
          <span>₹{row.original.sale_price}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: { row: { original: AdminProduct } }) => (
          <span className={row.original.stock < 10 ? "text-red-500" : "text-white"}>
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: { row: { original: AdminProduct } }) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: { row: { original: AdminProduct } }) => (
          <div className="flex gap-3">
            <Link
              href={`${frontendEnv.userUiUrl}/product/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
            <button
              className="text-purple-400 hover:text-purple-300 transition"
              onClick={() => {
                setSelectedProduct(row.original);
                setShowEditModal(true);
              }}
            >
              <Pencil size={18} />
            </button>
            <button
              className="text-green-400 hover:text-green-300 transition"
              onClick={() => {
                setAnalyticsData(row.original);
                setShowAnalytics(true);
              }}
            >
              <BarChart size={18} />
            </button>
            <button
              className={`transition cursor-pointer ${
                row.original.isDeleted
                  ? "text-emerald-400 hover:text-emerald-300"
                  : "text-red-400 hover:text-red-300"
              }`}
              onClick={() => {
                setSelectedProduct(row.original);
                setShowDeleteModal(true);
              }}
            >
              {row.original.isDeleted ? (
                <RotateCcw size={18} />
              ) : (
                <Trash size={18} />
              )}
            </button>
          </div>
        ),
      },
    ],
    [],
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
    <DashboardPageShell
      title="All Products"
      breadcrumbTitle="All Products"
      description="Products, analytics, and destructive actions now share one source of truth for cache invalidation."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={handleReindex}
            disabled={reindexing}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            title="Rebuild Meilisearch index from database"
          >
            <RefreshCw size={16} className={reindexing ? "animate-spin" : ""} />
            {reindexing ? "Reindexing…" : "Rebuild Search"}
          </button>
          <Link
            href="/dashboard/create-product"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>
      }
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search products...",
      }}
    >
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && products.length === 0 && (
          <p className="text-center py-3 text-white">No products found.</p>
        )}

        {showAnalytics && analyticsData && (
          <AnalyticsModal
            product={analyticsData}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showDeleteModal && selectedProduct && (
          <DeleteConfirmationModal
            product={selectedProduct}
            isLoading={deleteMutation.isPending || restoreMutation.isPending}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct.id)}
          />
        )}

        {showEditModal && selectedProduct && (
          <EditProductModal
            product={selectedProduct}
            isSaving={updateMutation.isPending}
            onClose={() => setShowEditModal(false)}
            onSave={(values) => updateMutation.mutate(values)}
          />
        )}
      </div>
    </DashboardPageShell>
  );
};

export default ProductList;
