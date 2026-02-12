"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

/* ===========================
   Dynamic imports (NO SSR)
=========================== */

const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});

const GeographicalMap = dynamic(
  () => import("@/shared/components/charts/geographicalMap"),
  { ssr: false },
);

const SalesChart = dynamic(
  () =>
    import("@/shared/components/charts/sales.chart").then((m) => m.SalesChart),
  { ssr: false },
);

/* ===========================
   Data
=========================== */

const deviceData = [
  { name: "Phone", value: 55 },
  { name: "Tablet", value: 20 },
  { name: "Computer", value: 25 },
];

const COLORS = ["#4ade80", "#facc15", "#60a5fa"];

const orders = [
  {
    id: "ORD-001",
    customer: "Nitesh",
    amount: "₹250",
    status: "Paid",
  },
];

const columns = [
  { accessorKey: "id", header: "Order ID" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "amount", header: "Amount" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }: any) => {
      const value = getValue();
      const color =
        value === "Paid"
          ? "text-green-400"
          : value === "Pending"
            ? "text-yellow-400"
            : "text-red-400";

      return <span className={`font-medium ${color}`}>{value}</span>;
    },
  },
];

/* ===========================
   Orders Table
=========================== */

const OrdersTable = () => {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-6">
      <h2 className="text-white text-xl font-semibold mb-4">
        Recent Orders
        <span className="block text-sm text-slate-400 font-normal">
          Latest transactions
        </span>
      </h2>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-slate-900">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
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
                className="border-t border-slate-700 hover:bg-slate-800"
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
      </div>
    </div>
  );
};

/* ===========================
   Dashboard Page
=========================== */

export default function DashboardClient() {
  return (
    <div className="p-8">
      {/* Top charts */}
      <div className="flex gap-8">
        <div className="w-[65%]">
          <h2 className="text-white text-xl font-semibold mb-2">
            Revenue
            <span className="block text-sm text-slate-400 font-normal">
              Last 6 months
            </span>
          </h2>
          <SalesChart />
        </div>

        <div className="w-[35%]">
          <h2 className="text-white text-xl font-semibold mb-2">
            Device Usage
            <span className="block text-sm text-slate-400 font-normal">
              Visitors by device
            </span>
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
              >
                {deviceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map + orders */}
      <div className="flex gap-8 mt-8">
        <div className="w-[60%]">
          <h2 className="text-white text-xl font-semibold mb-2">
            Visitor Distribution
          </h2>
          <GeographicalMap />
        </div>

        <div className="w-[40%]">
          <OrdersTable />
        </div>
      </div>
    </div>
  );
}
