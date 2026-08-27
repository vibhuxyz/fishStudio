"use client";

import React, { useMemo, useState } from "react";

import { SizePricingRow } from "@repo/zod-schema";

type SizePricingEditorProps = {
  rows: SizePricingRow[];
  trackStockPerSize?: boolean;
  onChange: (rows: SizePricingRow[]) => void;
};

const DISCOUNT_PRESETS = [0, 5, 10, 15, 20, 25];

const roundPrice = (value: number) => Math.round(value);

const deriveInitialRegularPerKg = (rows: SizePricingRow[]) => {
  const pricedRow = rows.find((row) => row.weightGrams > 0 && row.regularPrice > 0);
  if (!pricedRow) return "";

  return String(roundPrice((pricedRow.regularPrice / pricedRow.weightGrams) * 1000));
};

const deriveInitialDiscount = (rows: SizePricingRow[]) => {
  const pricedRow = rows.find(
    (row) => row.regularPrice > 0 && row.salePrice > 0 && row.salePrice <= row.regularPrice,
  );
  if (!pricedRow) return 0;

  return Math.round(((pricedRow.regularPrice - pricedRow.salePrice) / pricedRow.regularPrice) * 100);
};

const formatKg = (grams: number) => {
  const kg = grams / 1000;
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
};

const SizePricingEditor = ({ rows, trackStockPerSize, onChange }: SizePricingEditorProps) => {
  const [regularPerKg, setRegularPerKg] = useState(() => deriveInitialRegularPerKg(rows));
  const [discountPercent, setDiscountPercent] = useState(() => deriveInitialDiscount(rows));

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          units: acc.units + (row.stockQty ?? 0),
          grams: acc.grams + (row.totalInventoryGrams ?? 0),
        }),
        { units: 0, grams: 0 },
      ),
    [rows],
  );

  const applyPricing = (nextRegularPerKg: string, nextDiscountPercent: number) => {
    const perKg = Number(nextRegularPerKg || 0);
    const discount = Math.min(100, Math.max(0, Number(nextDiscountPercent || 0)));

    onChange(
      rows.map((row) => {
        const regularPrice = perKg > 0 && row.weightGrams > 0
          ? roundPrice((perKg * row.weightGrams) / 1000)
          : 0;
        const salePrice = regularPrice > 0
          ? roundPrice(regularPrice * (1 - discount / 100))
          : 0;

        return {
          ...row,
          regularPrice,
          salePrice,
        };
      }),
    );
  };

  const updateRegularPerKg = (value: string) => {
    setRegularPerKg(value);
    applyPricing(value, discountPercent);
  };

  const updateDiscountPercent = (value: number) => {
    const nextDiscount = Math.min(100, Math.max(0, value));
    setDiscountPercent(nextDiscount);
    applyPricing(regularPerKg, nextDiscount);
  };

  const updateRow = (index: number, nextRow: SizePricingRow) => {
    const nextRows = [...rows];
    nextRows[index] = nextRow;
    onChange(nextRows);
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-[1fr_1fr]">
        <div>
          <label className="mb-1 block text-xs text-slate-400">
            Regular price per kg
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={regularPerKg}
            onChange={(event) => updateRegularPerKg(event.target.value)}
            placeholder="Enter once, applies to all sizes"
            className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-400">
            Sale discount
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {DISCOUNT_PRESETS.map((discount) => (
              <button
                key={discount}
                type="button"
                onClick={() => updateDiscountPercent(discount)}
                className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
                  discountPercent === discount
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
                }`}
              >
                {discount}%
              </button>
            ))}
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={discountPercent}
              onChange={(event) => updateDiscountPercent(Number(event.target.value || 0))}
              className="w-20 rounded-md border border-slate-700 bg-transparent px-3 py-1.5 text-white outline-none"
            />
          </div>
        </div>
      </div>

      {trackStockPerSize && (
        <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-500">Total stock</p>
            <p className="mt-1 font-semibold text-white">
              {totals.units} unit{totals.units === 1 ? "" : "s"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Total inventory weight</p>
            <p className="mt-1 font-semibold text-white">{formatKg(totals.grams)} kg</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((entry, index) => (
          <div
            key={entry.size}
            className={`grid gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 ${
              trackStockPerSize
                ? "md:grid-cols-[1.15fr_1fr_1fr_1.05fr]"
                : "md:grid-cols-[1.15fr_1fr_1fr]"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-white">{entry.size}</p>
              <p className="text-xs text-slate-500">{entry.weightGrams || 0} gm</p>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Regular Price
              </label>
              <input
                type="number"
                min="0"
                value={entry.regularPrice ?? 0}
                onChange={(event) =>
                  updateRow(index, {
                    ...entry,
                    regularPrice: Number(event.target.value || 0),
                  })
                }
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Sale Price
              </label>
              <input
                type="number"
                min="0"
                value={entry.salePrice ?? 0}
                onChange={(event) =>
                  updateRow(index, {
                    ...entry,
                    salePrice: Number(event.target.value || 0),
                  })
                }
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              />
            </div>

            {trackStockPerSize && (
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Stock for this size (units)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={entry.stockQty ?? 0}
                  onChange={(event) => {
                    const stockQty = Math.max(0, Math.round(Number(event.target.value || 0)));
                    const totalInventoryGrams = stockQty * (entry.weightGrams || 0);
                    updateRow(index, {
                      ...entry,
                      totalInventoryGrams,
                      stockQty,
                    });
                  }}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formatKg(entry.totalInventoryGrams ?? 0)} kg total
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizePricingEditor;
