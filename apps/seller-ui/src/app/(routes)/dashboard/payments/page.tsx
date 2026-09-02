"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Link from "next/link";

import axiosInstance from "@/utils/axiosInstance";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { displayOrderNumber } from "@repo/shared/order-id";
import { formatPaymentRef } from "@repo/shared/payment-id";
import { formatIstDate, formatIstDateTime } from "@repo/shared/datetime";
import { PaymentBadge } from "@/shared/components/orders/payment-badge";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders;
};

const SellerPayments = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  // COD orders only appear here once delivered (money collected on arrival).
  // Online/prepaid orders always appear.
  const orders = rawOrders.filter((o: any) =>
    o.paymentMethod === "COD" ? o.status === "DELIVERED" : true,
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: any) => (
          <span className="text-white text-sm">
            {displayOrderNumber(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer & Items",
        cell: ({ row }: any) => (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="text-white font-medium">{row.original.user?.name || "Guest"}</span>
            <span className="text-gray-400 text-[10px] italic truncate max-w-[150px]">
              {row.original.orderItems?.map((i: any) => i.product?.title).join(", ") || "No items"}
            </span>
          </div>
        ),
      },
      {
        header: "Payment Details",
        cell: ({ row }: any) => {
          const method = row.original.paymentMethod;
          const ref = row.original.paymentRef;
          return (
            <div className="flex flex-col">
              <span className="text-gray-300 text-[10px] font-black uppercase">
                {method === "COD" ? "Cash on Delivery" : method || "Online"}
              </span>
              {method === "COD" ? (
                <span className="text-emerald-400/90 text-[9px] font-bold">CASH COLLECTED</span>
              ) : (
                ref ? (
                  <span className="text-sky-400/80 text-[9px] font-mono font-bold tracking-tight">{formatPaymentRef(ref)}</span>
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
        cell: ({ row }: any) => {
          const amount = row.original.totalAmount || 0;
          return (
            <span className="text-emerald-400 font-bold">
              ₹{amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        header: "Payment Status",
        cell: ({ row }: any) => (
          <PaymentBadge
            variant="pill"
            paymentStatus={row.original.paymentStatus}
            paymentMethod={row.original.paymentMethod}
            orderStatus={row.original.status}
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date & Time",
        cell: ({ row }: any) => {
          const createdAt = row.original.createdAt;
          return (
            <div className="flex flex-col leading-tight text-xs">
              <span className="text-white font-bold">{formatIstDate(createdAt)}</span>
              <span className="text-gray-500 text-[9px]">{formatIstDateTime(createdAt, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
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
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Payments</h2>
      <BreadCrumbs title="Payments" />

      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search payments..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

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
      </div>
    </div>
  );
};

export default SellerPayments;
