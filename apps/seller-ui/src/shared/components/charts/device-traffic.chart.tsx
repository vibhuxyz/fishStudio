"use client";
import React, { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { HD_CHART_COLORS } from "@/utils/stats.utils";

interface DeviceDatum {
  name: string;
  value: number;
  fill: string;
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2 group cursor-pointer">
          <div
            className="w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-125 shadow-lg shadow-black/20"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * recharts reads its own children to build a chart (it looks at each child's
 * component type), so the primitives have to be real imports — wrapping Pie,
 * Cell, Tooltip and Legend in next/dynamic individually hid them behind a
 * loader component the library could no longer recognise. The whole chart is
 * lazily loaded as one unit by the dashboard instead.
 */
export const DeviceTrafficChart = ({ data }: { data: DeviceDatum[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={HD_CHART_COLORS.emerald[0]} stopOpacity={1} />
            <stop offset="100%" stopColor={HD_CHART_COLORS.emerald[1]} stopOpacity={1} />
          </linearGradient>
          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={HD_CHART_COLORS.amber[0]} stopOpacity={1} />
            <stop offset="100%" stopColor={HD_CHART_COLORS.amber[1]} stopOpacity={1} />
          </linearGradient>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={HD_CHART_COLORS.sky[0]} stopOpacity={1} />
            <stop offset="100%" stopColor={HD_CHART_COLORS.sky[1]} stopOpacity={1} />
          </linearGradient>
        </defs>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={65}
          outerRadius={90}
          paddingAngle={8}
          stroke="none"
          onMouseEnter={(_, index: number) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.fill}
              style={{
                filter: activeIndex === i ? "drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))" : "none",
                transform: activeIndex === i ? "scale(1.05)" : "scale(1)",
                transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                transformOrigin: "center",
              }}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
          }}
          itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
          cursor={{ fill: "transparent" }}
        />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
};
