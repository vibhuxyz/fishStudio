"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye, RefreshCw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useEffect } from "react";

import axiosInstance from "@/utils/axiosInstance";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { SellerOrder } from "@repo/zod-schema";
import useSeller from "@/hooks/useSeller";
import { useWorkerWS } from "@/context/worker-ws-context";
import { displayOrderNumber } from "@repo/shared/order-id";
import { formatIstDate } from "@repo/shared/datetime";
import { PaymentBadge } from "@/shared/components/orders/payment-badge";
import OrderDetailDrawer from "./_components/order-detail-drawer";
import OrderFiltersBar, {
  EMPTY_FILTERS,
  filtersToParams,
  type OrderFilters,
} from "./_components/order-filters";
import BulkStatusBar from "./_components/bulk-status-bar";
import { paymentStateLabel, resolvePaymentState } from "@repo/shared/payment-state";

/** The server's own reason for a failure, when it sent one. */
const errorMessage = (err: unknown): string | null => {
  if (typeof err !== "object" || err === null) return null;
  const response = (err as { response?: { data?: { message?: unknown } } }).response;
  if (typeof response?.data?.message === "string") return response.data.message;
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
};

// Strip leading "#" so searching "#3W5KYD" works the same as "3W5KYD"
const cleanOrderIdSearch = (value: string) =>
  value.startsWith("#") ? value.slice(1) : value;

const fetchOrders = async (page: number, search: string, filters: OrderFilters) => {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) params.set("search", search);
  filtersToParams(filters, params);
  const res = await axiosInstance.get(`/order/api/get-seller-orders?${params.toString()}`);
  return { orders: res.data.orders ?? [], pagination: res.data.pagination };
};

const OrdersTable = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS);
  // Ids only, so a row scrolling out of the fetched page doesn't strand a
  // stale order object in state.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { seller } = useSeller();
  // Shared persistent WS connection — no new socket created per page.
  const { subscribe } = useWorkerWS();

  const cleanSearch = cleanOrderIdSearch(search);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders", page, cleanSearch, filters],
    queryFn: () => fetchOrders(page, cleanSearch, filters),
    staleTime: 1000 * 60 * 5,
  });

  const recheckMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosInstance.get(`/payment/api/recheck-payment/${orderId}`);
      return res.data as { paymentStatus: string; changed: boolean };
    },
    onSuccess: (result) => {
      const label = paymentStateLabel({
        paymentStatus: result.paymentStatus,
        paymentMethod: "RAZORPAY",
      });
      if (result.changed) {
        queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
        toast.success(`Payment status updated: ${label}`);
      } else {
        toast.info(`Still ${label} — Razorpay hasn't reported a change yet`);
      }
    },
    onError: (err: any) => {
      // Surface the server's reason: a bare "couldn't recheck" leaves nothing
      // to act on the next time this fails.
      const reason = err?.response?.data?.message || err?.message;
      toast.error(reason ? `Couldn't recheck payment: ${reason}` : "Couldn't recheck payment status");
    },
  });

  const orderIdsOnPage = (data?.orders ?? []).map((o: SellerOrder) => o.id);

  // Selection is per fetched page: changing page or filters replaces the rows
  // on screen, and keeping ticks for orders the seller can no longer see would
  // make "12 selected" mean something they can't verify before applying it.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, cleanSearch, filters]);

  const toggleRow = (orderId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });

  const allOnPageSelected =
    orderIdsOnPage.length > 0 && orderIdsOnPage.every((id: string) => selectedIds.has(id));

  const toggleAllOnPage = () =>
    setSelectedIds(allOnPageSelected ? new Set() : new Set(orderIdsOnPage));

  const bulkMutation = useMutation({
    mutationFn: async ({ orderIds, status }: { orderIds: string[]; status: string }) => {
      const res = await axiosInstance.put("/order/api/bulk-update-status", {
        orderIds,
        status,
      });
      return res.data as {
        updated: string[];
        skipped: { orderId: string; reason: string }[];
        message: string;
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      setSelectedIds(new Set());

      // Partial success is the normal case, so it is reported rather than
      // hidden behind a blanket "done" — the seller needs to know which of
      // their ticks did not take effect, and why.
      if (result.updated.length === 0) {
        toast.error(
          result.skipped[0]?.reason
            ? `No orders updated — ${result.skipped[0].reason.toLowerCase()}`
            : "No orders were updated",
        );
        return;
      }
      if (result.skipped.length > 0) {
        toast.warning(`${result.message} ${result.skipped.length} skipped.`, {
          description: result.skipped
            .slice(0, 3)
            .map((s) => s.reason)
            .join(" · "),
        });
        return;
      }
      toast.success(result.message);
    },
    onError: (err: unknown) => {
      toast.error(
        errorMessage(err) ? `Bulk update failed: ${errorMessage(err)}` : "Bulk update failed",
      );
    },
  });

  // Subscribe to NEW_ORDER events via the shared connection.
  // This runs once on mount and cleans up on unmount — no connect/disconnect.
  useEffect(() => {
    if (!seller?.store?.id) return;
    return subscribe("NEW_ORDER", (payload) => {
      console.log("📦 New order received via WebSocket:", payload);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    });
  }, [seller?.store?.id, subscribe, queryClient]);

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all orders on this page"
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            checked={allOnPageSelected}
            onChange={toggleAllOnPage}
          />
        ),
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <input
            type="checkbox"
            aria-label={`Select order ${displayOrderNumber(row.original)}`}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleRow(row.original.id)}
          />
        ),
      },
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white text-sm truncate">
            {displayOrderNumber(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-white">
            {row.original.user?.name ?? "Guest"}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Amount",
        cell: ({ row }: { row: { original: SellerOrder } }) => <span>₹{row.original.total}</span>,
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const { id, paymentMethod, paymentStatus, status } = row.original;
          // Whether the gateway is worth asking again is a property of the
          // payment state, not a condition each table re-invents.
          const { canRecheck } = resolvePaymentState({
            paymentStatus,
            paymentMethod,
            orderStatus: status,
          });
          const isRechecking = recheckMutation.isPending && recheckMutation.variables === id;

          return (
            <span className="inline-flex items-center gap-1.5">
              <PaymentBadge
                paymentStatus={paymentStatus}
                paymentMethod={paymentMethod}
                orderStatus={status}
              />
              {canRecheck && (
                <button
                  type="button"
                  title="Recheck payment status with Razorpay"
                  disabled={isRechecking}
                  onClick={() => recheckMutation.mutate(id)}
                  className="text-gray-400 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isRechecking ? "animate-spin" : ""} />
                </button>
              )}
            </span>
          );
        },
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
        accessorKey: "deliverySlot",
        header: "Slot",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <span className="text-gray-300 text-sm">{row.original.deliverySlot ?? "—"}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: { row: { original: SellerOrder } }) => {
          const date = formatIstDate(row.original.createdAt);
          return <span className="text-white text-sm">{date}</span>;
        },
      },
      {
        header: "Detail",
        cell: ({ row }: { row: { original: SellerOrder } }) => (
          <button
            type="button"
            title="View order details"
            onClick={() => setDetailOrderId(row.original.id)}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </button>
        ),
      },
    ],
    // selectedIds/allOnPageSelected are read by the selection column, so the
    // column defs must be rebuilt when they change or the ticks never render.
    [recheckMutation, selectedIds, allOnPageSelected],
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <OrderFiltersBar
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <BulkStatusBar
        selectedCount={selectedIds.size}
        isPending={bulkMutation.isPending}
        onApply={(status) =>
          bulkMutation.mutate({ orderIds: [...selectedIds], status })
        }
        onClear={() => setSelectedIds(new Set())}
      />

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

      {detailOrderId && (
        <OrderDetailDrawer
          orderId={detailOrderId}
          onClose={() => setDetailOrderId(null)}
        />
      )}
    </div>
  );
};

export default OrdersTable;
