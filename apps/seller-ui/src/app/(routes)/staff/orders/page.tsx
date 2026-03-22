"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import useRequireStaff from "@/hooks/useRequireStaff";
import { MOCK_ORDERS } from "@/shared/mocks/staffMockData";

// TODO: replace MOCK_ORDERS with real fetch once backend is ready:
// const fetchOrders = async () => {
//   const res = await axiosInstance.get("/order/api/get-seller-orders", {
//     headers: { "x-auth-role": "staff" },
//   });
//   return res.data.orders;
// };

const StaffOrdersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const { staff, isLoading: authLoading } = useRequireStaff();

  // TODO: swap with real useQuery once backend is ready
  const orders = MOCK_ORDERS;
  const isLoading = false;

  const sellerNotLinked =
    !authLoading && staff && (!staff.isActive || !staff.sellerId);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: any) => (
          <span className="text-white text-sm truncate font-mono">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        cell: ({ row }: any) => (
          <span className="text-white">{row.original.user?.name ?? "Guest"}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: any) => (
          <span className="text-white font-medium">${row.original.total.toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => {
          const status = row.original.status;
          const colorMap: Record<string, string> = {
            Paid: "bg-blue-600",
            Accepted: "bg-green-600",
            Rejected: "bg-red-600",
            Pending: "bg-yellow-500",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                colorMap[status] ?? "bg-gray-500"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-gray-300 text-sm">{date}</span>;
        },
      },
      {
        header: "Action",
        cell: ({ row }: any) => (
          <Link
            href={`/staff/orders/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1 text-sm"
          >
            <Eye size={16} />
            View
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

  if (sellerNotLinked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <ShieldAlert size={56} className="text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          Access Not Granted
        </h2>
        <p className="text-gray-400 max-w-md">
          Your account has not been activated by a seller yet. Please ask your
          seller to search for your email and grant you access from their Staff
          Management dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Shop Orders</h2>
      <BreadCrumbs title="All Orders" />

      <div className="my-4 flex items-center bg-[#1a1a2e] border border-gray-800 p-2.5 rounded-lg gap-2">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by customer, status or order ID..."
          className="w-full bg-transparent text-white outline-none text-sm placeholder-gray-500"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-[#111827] border border-gray-800 rounded-xl">
        {isLoading ? (
          <p className="text-center text-white py-8">Loading orders...</p>
        ) : (
          <table className="w-full text-white">
            <thead className="bg-[#1a1a2e]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800"
                    >
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
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-800 hover:bg-[#1e2433] transition ${
                    idx % 2 === 0 ? "bg-[#111827]" : "bg-[#131b2e]"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
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
        {!isLoading && orders.length === 0 && (
          <p className="text-center py-8 text-gray-400">No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default StaffOrdersPage;

