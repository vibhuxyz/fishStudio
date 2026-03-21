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

const SellerPayments = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const { data: orders = [], isLoading } = useSellerOrders();

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white text-sm">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Buyer",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white">{row.original.user?.name || "Guest"}</span>
        ),
      },
      {
        header: "Seller Earning",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const sellerShare = Number(row.original.total ?? 0) * 0.9;
          return (
            <span className="text-green-400 font-medium">
              ${sellerShare.toFixed(2)}
            </span>
          );
        },
      },
      {
        header: "Admin Fee",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const adminFee = Number(row.original.total ?? 0) * 0.1;
          return <span className="text-yellow-400">${adminFee.toFixed(2)}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.status === "Paid"
                ? "bg-green-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {row.original.status}
          </span>
        ),
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
      title="Payments"
      breadcrumbTitle="Payments"
      description="Reuse the shared orders query instead of hitting the backend again for payment reporting."
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search payments...",
      }}
    >
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading payments...</p>
        ) : (
          <table className="w-full text-white text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
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
                    <td key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && orders.length === 0 && (
          <p className="text-center py-3 text-white">No payments found.</p>
        )}
      </div>
    </DashboardPageShell>
  );
};

export default SellerPayments;
