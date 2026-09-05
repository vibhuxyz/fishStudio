"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
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
  useAdminSellers,
} from "@/hooks/useAdminQueries";
import { frontendEnv } from "@/config/env";
import axiosInstance from "@/utils/axiosInstance";

const PAGE_SIZE = 20;

const ProductList = () => {
  const [analyticsData, setAnalyticsData] = useState<AdminProduct | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [productScope, setProductScope] = useState<"catalog" | "store">("catalog");
  const [storeFilter, setStoreFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: sellers = [] } = useAdminSellers();
  const stores = useMemo(() => {
    const seen = new Set<string>();
    return sellers
      .map((seller) => seller.store)
      .filter((store): store is NonNullable<typeof store> => {
        if (!store || seen.has(store.id)) return false;
        seen.add(store.id);
        return true;
      });
  }, [sellers]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(globalFilter.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  const { data, isLoading, isFetching } = useAdminProducts({
    scope: productScope,
    storeId: productScope === "store" ? storeFilter || undefined : undefined,
    search: searchTerm || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const products = data?.products ?? [];
  const pagination = data?.pagination;
  const isCatalogScope = productScope === "catalog";

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
      ...(!isCatalogScope
        ? [
            {
              accessorKey: "store",
              header: "Store",
              cell: ({ row }: { row: { original: AdminProduct } }) => (
                <span>{row.original.store?.name || "—"}</span>
              ),
            },
            {
              accessorKey: "status",
              header: "Status",
              cell: ({ row }: { row: { original: AdminProduct } }) => (
                <span
                  className={
                    row.original.status === "Active" ? "text-green-400" : "text-gray-500"
                  }
                >
                  {row.original.status || "Active"}
                </span>
              ),
            },
          ]
        : []),
      {
        id: "merchandising",
        header: "Rank",
        cell: ({ row }: { row: { original: AdminProduct } }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                defaultValue={product.sortOrder ?? ""}
                placeholder="—"
                title="Display rank. Lower shows first; blank is unranked."
                // Committed on blur rather than per keystroke: this writes to
                // the product and triggers a Meilisearch reindex, which is not
                // something to do on every digit typed.
                onBlur={(e) => {
                  const raw = e.target.value.trim();
                  const next = raw === "" ? null : Number(raw);
                  if (next === (product.sortOrder ?? null)) return;
                  updateMutation.mutate({ productId: product.id, sortOrder: next });
                }}
                className="w-16 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                title={product.isFeatured ? "Featured — click to unfeature" : "Mark as featured"}
                onClick={() =>
                  updateMutation.mutate({
                    productId: product.id,
                    isFeatured: !product.isFeatured,
                  })
                }
                className={`transition ${
                  product.isFeatured ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"
                }`}
              >
                <Star fill={product.isFeatured ? "#facc15" : "none"} size={18} />
              </button>
            </div>
          );
        },
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
              className="text-green-400 hover:text-green-300 transition"
              onClick={() => {
                setAnalyticsData(row.original);
                setShowAnalytics(true);
              }}
            >
              <BarChart size={18} />
            </button>
            {/* Store products are owned by the seller — this page's edit/delete
                mutations only authorize against admin-owned catalog products. */}
            {isCatalogScope && (
              <>
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
              </>
            )}
          </div>
        ),
      },
    ],
    [isCatalogScope],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DashboardPageShell
      title={isCatalogScope ? "Catalog Products" : "Store Products"}
      breadcrumbTitle={isCatalogScope ? "Catalog Products" : "Store Products"}
      description={
        isCatalogScope
          ? "The master catalog every seller adopts from. Editing one here updates it for every store that already sells it."
          : "The live listings sellers sell from. Pricing, stock and availability belong to the seller who owns them."
      }
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
        placeholder: "Search by name, slug or category...",
      }}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex bg-gray-900 rounded-lg p-1 gap-1">
          <button
            onClick={() => {
              setProductScope("catalog");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition ${
              productScope === "catalog"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Catalog Products
          </button>
          <button
            onClick={() => {
              setProductScope("store");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition ${
              productScope === "store"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Store Products
          </button>
        </div>

        {productScope === "store" && (
          <select
            value={storeFilter}
            onChange={(event) => {
              setStoreFilter(event.target.value);
              setPage(1);
            }}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

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
          <p className="text-center py-3 text-white">
            {searchTerm
              ? `No products match “${searchTerm}”.`
              : "No products found."}
          </p>
        )}

        {pagination && pagination.total > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-4 text-sm text-gray-400">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {(pagination.page - 1) * pagination.limit + products.length} of{" "}
              {pagination.total}
              {isFetching && <span className="ml-2 text-gray-500">updating…</span>}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-white transition hover:bg-gray-700 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-medium text-white">
                {pagination.page} / {Math.max(1, pagination.totalPages)}
              </span>
              <button
                type="button"
                disabled={!pagination.hasNextPage || isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-white transition hover:bg-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
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
