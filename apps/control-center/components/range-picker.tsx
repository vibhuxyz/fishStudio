"use client";

import { RANGE_KEYS, RANGES, type RangeKey } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function RangePicker({
  value,
  onChange,
  options = RANGE_KEYS,
}: {
  value: RangeKey;
  onChange: (next: RangeKey) => void;
  /** Not every page offers every window; the caller narrows the set. */
  options?: readonly RangeKey[];
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5" role="group">
      {options.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={key === value}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            key === value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {RANGES[key].label}
        </button>
      ))}
    </div>
  );
}
