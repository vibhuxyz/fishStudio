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
import { type SellerOrder, useSellerOrders } from "@/hooks/useAdminQueries";

const OrdersTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const { data: orders = [], isLoading } = useSellerOrders();

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white text-sm truncate">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Buyer",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white">{row.original.user?.name ?? "Guest"}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span>${Number(row.original.total ?? 0).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const status = row.original.status;
          let color = "bg-yellow-500 text-white"; // default

          if (status === "DELIVERED" || status === "Paid") color = "bg-emerald-600 text-white";
          else if (status === "PENDING") color = "bg-amber-500 text-white";
          else if (status === "REJECTED" || status === "CANCELLED") color = "bg-rose-600 text-white";
          else if (status === "ACCEPTED" || status === "SHIPPED") color = "bg-blue-600 text-white";

          return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white text-sm">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <Link
            href={`/order/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
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
      description="Track every order from one cached dataset shared across the admin dashboard."
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search orders...",
      }}
    >
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
                      {flexRender(
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
