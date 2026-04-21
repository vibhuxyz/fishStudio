"use client";

import React, { useState, useMemo } from "react";
import {
  useSellerInventory,
  type SellerInventoryEntry,
  type InventoryProduct,
} from "@/hooks/useAdminQueries";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Store,
  User,
  RefreshCw,
  Filter,
} from "lucide-react";

// ── Badge helpers ────────────────────────────────────────────────────────────

function StockBadge({ product }: { product: InventoryProduct }) {
  if (product.isOutOfStock)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
        <XCircle size={11} /> Out of Stock
      </span>
    );
  if (product.isLowStock)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
        <AlertTriangle size={11} /> Low ({product.stock})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
      <CheckCircle size={11} /> {product.stock}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${active ? "bg-green-400" : "bg-zinc-500"}`}
    />
  );
}

// ── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: number | string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 border ${warn ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-white/5"}`}
    >
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${warn ? "text-yellow-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({ product }: { product: InventoryProduct }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
      {product.image ? (
        <img
          src={product.image}
          alt={product.title}
          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <Package size={16} className="text-zinc-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{product.title}</p>
        <p className="text-xs text-zinc-500">{product.category || "—"}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm text-white font-semibold">
          ₹{product.salePrice?.toFixed(2) ?? "—"}
        </p>
        <p className="text-xs text-zinc-500">Sold: {product.totalSold}</p>
      </div>
      <div className="flex-shrink-0 w-32 text-right">
        <StockBadge product={product} />
      </div>
      <div className="flex-shrink-0 w-16 text-right">
        <span
          className={`text-xs flex items-center justify-end ${product.status === "Active" ? "text-green-400" : "text-zinc-500"}`}
        >
          <StatusDot status={product.status} />
          {product.status}
        </span>
      </div>
    </div>
  );
}

// ── Seller card ───────────────────────────────────────────────────────────────

function SellerCard({ entry }: { entry: SellerInventoryEntry }) {
  const [open, setOpen] = useState(false);
  const { seller, store, summary, products } = entry;

  const urgentCount = summary.outOfStock + summary.lowStockCount;
  const hasUrgent = urgentCount > 0;

  return (
    <div
      className={`rounded-2xl border ${hasUrgent ? "border-yellow-500/30" : "border-white/10"} bg-[#1a1a2e]/60 overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        {/* Expand icon */}
        <div className="text-zinc-400 flex-shrink-0">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {/* Seller & store info */}
        <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <User size={13} className="text-zinc-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-white truncate">
                {seller?.name ?? "Unknown Seller"}
              </p>
            </div>
            <p className="text-xs text-zinc-500 truncate pl-4">{seller?.email ?? "—"}</p>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Store size={13} className="text-zinc-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-white truncate">{store.name}</p>
            </div>
            <p className="text-xs text-zinc-500 truncate pl-4">
              {[store.city, store.pincode].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full font-medium">
            {summary.totalProducts} products
          </span>
          <span className="text-xs bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
            Stock: {summary.totalStock}
          </span>
          {summary.outOfStock > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
              {summary.outOfStock} OOS
            </span>
          )}
          {summary.lowStockCount > 0 && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
              {summary.lowStockCount} low
            </span>
          )}
        </div>
      </button>

      {/* Expanded product list */}
      {open && (
        <div className="border-t border-white/10 px-5 pb-4 pt-2">
          {/* Store detail row */}
          <div className="flex items-center gap-6 py-2 mb-2 text-xs text-zinc-400 border-b border-white/5 flex-wrap">
            <span>
              Active products:{" "}
              <strong className="text-white">{summary.activeProducts}</strong>
            </span>
            <span>
              Total sold: <strong className="text-white">{summary.totalSold}</strong>
            </span>
            {store.openingHours && (
              <span>
                Hours:{" "}
                <strong className="text-white">
                  {store.openingHours} – {store.closingHours}
                </strong>
              </span>
            )}
            {store.instantDeliveryEnabled && (
              <span className="text-green-400 font-semibold">Instant delivery enabled</span>
            )}
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-2 pb-1 text-xs text-zinc-500 font-medium">
            <div className="w-9 flex-shrink-0" />
            <div className="flex-1">Product</div>
            <div className="flex-shrink-0 w-20 text-right">Price</div>
            <div className="flex-shrink-0 w-32 text-right">Stock</div>
            <div className="flex-shrink-0 w-16 text-right">Status</div>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No products found.</p>
          ) : (
            products.map((p) => <ProductRow key={p.id} product={p} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SellerInventoryPage() {
  const [search, setSearch] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      search: search || undefined,
      sellerId: sellerId || undefined,
      category: category || undefined,
      lowStock: lowStock || undefined,
      page,
      limit: 20,
    }),
    [search, sellerId, category, lowStock, page],
  );

  const { data, isLoading, isError, refetch, isFetching } = useSellerInventory(params);

  const sellers = data?.sellers ?? [];
  const pagination = data?.pagination;

  // Aggregate totals across current page
  const totals = useMemo(() => {
    const totalProducts = sellers.reduce((s, e) => s + e.summary.totalProducts, 0);
    const totalStock = sellers.reduce((s, e) => s + e.summary.totalStock, 0);
    const totalOOS = sellers.reduce((s, e) => s + e.summary.outOfStock, 0);
    const totalLow = sellers.reduce((s, e) => s + e.summary.lowStockCount, 0);
    return { totalProducts, totalStock, totalOOS, totalLow };
  }, [sellers]);

  function applyFilters() {
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setSellerId("");
    setCategory("");
    setLowStock(false);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white px-6 py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Seller Inventory</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            View all sellers' store inventories and stock levels
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Total Products" value={totals.totalProducts} />
          <SummaryCard label="Total Stock" value={totals.totalStock} />
          <SummaryCard label="Out of Stock" value={totals.totalOOS} warn={totals.totalOOS > 0} />
          <SummaryCard label="Low Stock" value={totals.totalLow} warn={totals.totalLow > 0} />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1a2e]/60 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-1">
          <Filter size={15} />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search seller, store, product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Category */}
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50"
          />

          {/* Seller ID */}
          <input
            type="text"
            placeholder="Seller ID (exact)"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50"
          />

          {/* Actions */}
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-1">
              <input
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                className="accent-yellow-400"
              />
              <span className="text-sm text-zinc-300">Low stock only</span>
            </label>
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-zinc-400 transition-colors border border-white/10"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <p className="text-red-400 font-medium">Failed to load inventory.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-zinc-400 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      ) : sellers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <Package size={36} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No sellers found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map((entry) => (
            <SellerCard key={entry.store.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-zinc-400">
            Page {pagination.page} of {pagination.totalPages} &mdash;{" "}
            {pagination.total} stores total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage || isFetching}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isFetching}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
