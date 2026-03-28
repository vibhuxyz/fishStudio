"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Link from "next/link";
import { useEffect } from "react";

import axiosInstance from "@/utils/axiosInstance";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { SellerOrder } from "@repo/zod-schema";
import useSeller from "@/hooks/useSeller";

const fetchOrders = async (page: number) => {
  const res = await axiosInstance.get(`/order/api/get-seller-orders?page=${page}&limit=20`);
  return { orders: res.data.orders ?? [], pagination: res.data.pagination };
};

const OrdersTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { seller } = useSeller();

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders", page],
    queryFn: () => fetchOrders(page),
    staleTime: 1000 * 60 * 5,
  });

  // WebSocket for Real-time Orders — with auto-reconnect
  useEffect(() => {
    const storeId = seller?.store?.id;
    if (!storeId) return;

    const wsBase = process.env.NEXT_PUBLIC_WORKER_WS_URL?.replace(/\?.*$/, "") || "ws://localhost:6006";
    const wsUrl = `${wsBase}?storeId=${storeId}`;

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ Seller: connected to real-time order service");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "NEW_ORDER") {
            console.log("📦 New order received via WebSocket:", data.payload);
            queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
          }
        } catch (err) {
          console.error("Error processing WS message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Seller WS error:", error);
      };

      ws.onclose = () => {
        if (!destroyed) {
          console.log("🔌 Seller WS closed — reconnecting in 3s");
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      destroyed = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [seller?.store?.id, queryClient]);

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

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
          <span className="text-white">
            {row.original.user?.name ?? "Guest"}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: { row: { original: SellerOrder } }) => <span>₹{row.original.total}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const status = row.original.status as string;
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
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-white text-sm">{date}</span>;
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
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">All Orders</h2>

      {/* Breadcrumbs */}
      <BreadCrumbs title="All Orders" />

      {/* Search Bar */}
      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search orders..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
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

        {!isLoading && orders?.length === 0 && (
          <p className="text-center py-3 text-white">No Orders found!</p>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>{pagination.total} total orders</span>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-white disabled:opacity-40 hover:bg-gray-700 transition"
            >
              Prev
            </button>
            <span className="text-white font-medium">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-white disabled:opacity-40 hover:bg-gray-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
