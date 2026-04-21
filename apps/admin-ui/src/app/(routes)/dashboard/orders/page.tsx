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
  const { data: pincodeData } = useAdminOrderPincodes();
  const pincodes: string[] = pincodeData ?? [];
  const { data, isLoading } = useAdminOrderList({
    page: 1,
    limit: 50,
    search: globalFilter || undefined,
    pincode: selectedPincode || undefined,
  });
  const orders: AdminOrder[] = data?.orders ?? [];

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className="text-white text-sm font-mono">
            #{row.original.id.slice(-6).toUpperCase()}
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
        cell: ({ row }: { row: { original: AdminOrder } }) => (
          <span className={`text-xs font-semibold ${row.original.paymentStatus === "COMPLETED" ? "text-emerald-400" : "text-amber-400"}`}>
            {row.original.paymentStatus}
          </span>
        ),
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
        onChange: setGlobalFilter,
        placeholder: "Search orders...",
      }}
    >
      {pincodes.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-400 whitespace-nowrap">Filter by Pincode:</label>
          <select
            value={selectedPincode}
            onChange={(e) => setSelectedPincode(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="">All Pincodes</option>
            {pincodes.map((pin) => (
              <option key={pin} value={pin}>{pin}</option>
            ))}
          </select>
          {selectedPincode && (
            <button
              onClick={() => setSelectedPincode("")}
              className="text-xs text-gray-400 hover:text-white transition underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
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
    </DashboardPageShell>
  );
};

export default OrdersTable;
