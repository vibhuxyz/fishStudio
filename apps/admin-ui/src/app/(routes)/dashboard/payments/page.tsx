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
        header: "Customer & Items",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-white font-medium">{row.original.user?.name || "Guest"}</span>
            <span className="text-gray-400 text-[10px] italic truncate max-w-[180px]">
              {row.original.items?.map(i => i.product?.title).join(", ") || "No items"}
            </span>
          </div>
        ),
      },
      {
        header: "Payment Details",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const method = row.original.paymentMethod;
          const ref = row.original.paymentRef;
          return (
            <div className="flex flex-col">
              <span className="text-gray-300 text-[10px] font-black uppercase">
                {method === "COD" ? "Cash on Delivery" : method || "Online"}
              </span>
              {method === "COD" ? (
                <span className="text-lime-500/80 text-[9px] font-bold">COLLECT ON ARRIVAL</span>
              ) : (
                ref ? (
                  <span className="text-sky-400/80 text-[9px] font-mono font-bold tracking-tight">#{ref}</span>
                ) : (
                  <span className="text-amber-500/60 text-[9px] font-bold italic">REF. PENDING</span>
                )
              )}
            </div>
          );
        },
      },
      {
        header: "Seller Earning",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const amount = row.original.totalAmount || row.original.total || 0;
          return (
            <span className="text-emerald-400 font-bold">
              ₹{amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        header: "Payment Status",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const pStatus = row.original.paymentStatus;
          const oStatus = row.original.status;
          
          let color = "bg-gray-800 text-gray-400";
          let label = pStatus || "PENDING";

          if (pStatus === "COMPLETED") {
            color = "bg-emerald-900/40 text-emerald-500 border border-emerald-900/30";
            label = "SUCCESSFUL";
          } else if (pStatus === "REFUNDED") {
            color = "bg-rose-900/40 text-rose-500 border border-rose-900/30";
            label = "REFUNDED";
          } else if (oStatus === "REJECTED" || oStatus === "CANCELLED") {
            color = "bg-amber-900/40 text-amber-500 border border-amber-900/30";
            label = "REFUND PROCESSING";
          } else {
            color = "bg-amber-900/40 text-amber-500 border border-amber-900/30";
            label = "PENDING";
          }

          return (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${color}`}>
              {label}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date & Time",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex flex-col leading-tight">
              <span className="text-white text-[10px] font-bold">{date.toLocaleDateString()}</span>
              <span className="text-gray-500 text-[9px]">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        },
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
