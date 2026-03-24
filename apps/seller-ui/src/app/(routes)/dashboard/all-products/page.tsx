"use client";

import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  BarChart,
  Eye,
  PackageSearch,
  Pencil,
  RotateCcw,
  Search,
  Star,
  Trash,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import AnalyticsModal from "@/shared/components/modals/analytics.modal";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";
import { frontendEnv } from "@/config/env";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-owned-products", isProtected);
  return Array.isArray(res.data.products) ? res.data.products : [];
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`, isProtected);
};

const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`, {}, isProtected);
};

const ProductList = () => {
  useRequireAuth("product");
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["seller", "products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      setShowDeleteModal(false);
      setSelectedProduct(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      setShowDeleteModal(false);
      setSelectedProduct(null);
    },
  });

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
            className="h-12 w-12 rounded-md object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const title = row.original.title || "Untitled product";
          const truncatedTitle =
            title.length > 28 ? `${title.substring(0, 28)}...` : title;

          return (
            <Link
              href={`${frontendEnv.userUiUrl}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>₹{row.original.sale_price ?? 0}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span className={row.original.stock < 10 ? "text-red-400" : "text-white"}>
            {row.original.stock ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              row.original.status === "Active"
                ? "bg-emerald-500/20 text-emerald-300"
                : row.original.status === "Draft"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-slate-500/20 text-slate-300"
            }`}
          >
            {row.original.status || "Active"}
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
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`${frontendEnv.userUiUrl}/product/${row.original.slug}`}
              className="text-blue-400 transition hover:text-blue-300"
            >
              <Eye size={18} />
            </Link>
            <button
              className="text-green-400 transition hover:text-green-300"
              onClick={() => openAnalytics(row.original)}
            >
              <BarChart size={18} />
            </button>
            <button
              className="text-amber-400 transition hover:text-amber-300"
              onClick={() => router.push(`/dashboard/products/${row.original.id}`)}
            >
              <Pencil size={18} />
            </button>
            <button
              className={`transition ${
                row.original.isDeleted
                  ? "text-emerald-400 hover:text-emerald-300"
                  : "text-red-400 hover:text-red-300"
              }`}
              onClick={() => openDeleteModal(row.original)}
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
    [router],
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

  const openAnalytics = (product: any) => {
    setAnalyticsData(product);
    setShowAnalytics(true);
  };

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Shop Products</h2>
          <p className="text-sm text-slate-400">
            Manage the products your shop currently offers from the admin
            catalog.
          </p>
        </div>
        <Link
          href="/dashboard/create-product"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PackageSearch size={18} /> Add From Catalog
        </Link>
      </div>

      <div className="mb-2">
        <BreadCrumbs title="All Products" />
      </div>

      <div className="mb-4 flex items-center rounded-md bg-gray-900 p-2">
        <Search size={18} className="mr-2 text-gray-400" />
        <input
          type="text"
          placeholder="Search shop products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg bg-gray-900 p-4">
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
                  className="border-b border-gray-800 transition hover:bg-gray-900"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
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
          <p className="py-3 text-center text-white">
            No shop products found yet. Add products from the admin catalog.
          </p>
        )}

        {showAnalytics && (
          <AnalyticsModal
            product={analyticsData}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showDeleteModal && selectedProduct && (
          <DeleteConfirmationModal
            product={selectedProduct}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
