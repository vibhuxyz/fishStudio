"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import { type AdminOrder, useAdminOrderList, useAdminOrderPincodes } from "@/hooks/useAdminQueries";
import { displayOrderNumber } from "@repo/shared/order-id";
import { resolvePaymentState, type PaymentTone } from "@repo/shared/payment-state";

const PAY_TONE_CLASS: Record<PaymentTone, string> = {
  paid:     "text-emerald-400",
  due:      "text-amber-400",
  pending:  "text-amber-400",
  refunded: "text-purple-400",
  dead:     "text-gray-500",
  danger:   "text-rose-400",
};

const statusColor = (status: string) => {
  if (status === "DELIVERED")  return "bg-emerald-600 text-white";
  if (status === "PENDING")    return "bg-amber-500 text-white";
  if (status === "ACCEPTED")   return "bg-blue-600 text-white";
  if (status === "SHIPPED")    return "bg-purple-600 text-white";
  if (status === "REJECTED" || status === "CANCELLED") return "bg-rose-600 text-white";
  return "bg-gray-600 text-white";
};

const OrdersTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedPincode, setSelectedPincode] = useState("");
  const [page, setPage] = useState(1);
  const { data: pincodeData } = useAdminOrderPincodes();
  const pincodes: string[] = pincodeData ?? [];
  const { data, isLoading, isFetching } = useAdminOrderList({
    page,
    limit: 50,
    search: globalFilter || undefined,
    pincode: selectedPincode || undefined,
  });
  const orders: AdminOrder[] = data?.orders ?? [];
  const pagination = data?.pagination;

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className="text-white text-sm font-mono">
            {displayOrderNumber(row.original)}
          </span>
        ),
      },
      {
        header: "Buyer",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className="text-white">{row.original.customer?.name ?? "Guest"}</span>
        ),
      },
      {
        header: "Seller",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className="text-gray-300 text-sm">{row.original.seller?.name ?? "—"}</span>
        ),
      },
      {
        header: "Total",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className="text-white">₹{Number(row.original.totalAmount ?? 0).toFixed(0)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColor(row.original.status)}`}>
            {row.original.status}
          </span>
        ),
      },
      {
        header: "Payment",
        cell: ({ row }: { row: { original: AdminOrder } }) => {
          const state = resolvePaymentState({
            paymentStatus: row.original.paymentStatus,
            paymentMethod: row.original.paymentMethod,
            refundStatus: row.original.refundStatus,
            orderStatus: row.original.status,
          });
          return (
            <span className={`text-xs font-semibold ${PAY_TONE_CLASS[state.tone]}`} title={state.detail}>
              {state.label}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className="text-white text-sm">
            {new Date(row.original.createdAt).toLocaleDateString("en-IN")}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <Link href={`/order/${row.original.id}`} className="text-blue-400 hover:text-blue-300 transition">
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <DashboardPageShell
      title="All Orders"
      breadcrumbTitle="All Orders"
      description="Track every order across all sellers on the platform."
      search={{
        value: globalFilter,
        onChange: (value: string) => {
          setGlobalFilter(value);
          setPage(1);
        },
        placeholder: "Search orders...",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-400 whitespace-nowrap">Filter by Pincode:</label>
          <select
            value={selectedPincode}
            onChange={(e) => {
              setSelectedPincode(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="">All Pincodes</option>
            {pincodes.map((pin) => (
              <option key={pin} value={pin}>{pin}</option>
            ))}
          </select>
          {selectedPincode && (
            <button
              onClick={() => {
                setSelectedPincode("");
                setPage(1);
              }}
              className="text-xs text-gray-400 hover:text-white transition underline"
            >
              Clear
            </button>
          )}
        </div>
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading orders...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left text-sm">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && orders.length === 0 && (
          <p className="text-center py-3 text-white">No orders found.</p>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-400">
            Page {pagination.page} of {pagination.totalPages} &mdash; {pagination.total} orders total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage || isFetching}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isFetching}
              className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
};

export default OrdersTable;
