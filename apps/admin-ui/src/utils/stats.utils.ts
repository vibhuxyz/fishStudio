/**
 * Calculates the order traffic status counts from the raw stats object.
 * Returns a standardized array with requested terminology: Total, Fulfilled, and Cancelled.
 */
export const calculateAdminOrderTraffic = (stats: any) => {
  return [
    { 
      label: "Total", 
      value: stats?.totalOrders || 0, 
      color: "text-blue-400",
      bg: "bg-blue-500",
      gradient: "url(#skyGradient)"
    },
    { 
      label: "Fulfilled", 
      value: stats?.totalDelivered || 0, 
      color: "text-emerald-400",
      bg: "bg-emerald-500", 
      gradient: "url(#emeraldGradient)"
    },
    { 
      label: "Pending", 
      value: stats?.totalPending || 0, 
      color: "text-amber-400",
      bg: "bg-amber-500",
      gradient: "url(#amberGradient)"
    },
    { 
      label: "Cancelled", 
      value: stats?.totalCancelled || 0, 
      color: "text-rose-400",
      bg: "bg-rose-500",
      gradient: "url(#roseGradient)"
    },
  ];
};

/**
 * Placeholder device traffic for admin dashboard.
 */
export const getAdminDeviceTrafficData = () => [
  { name: "Phone", value: 55, fill: "url(#emeraldGradient)" },
  { name: "Tablet", value: 20, fill: "url(#amberGradient)" },
  { name: "Computer", value: 25, fill: "url(#skyGradient)" },
];

export const HD_ADMIN_CHART_COLORS = {
  emerald: ["#10b981", "#059669"],
  amber: ["#f59e0b", "#d97706"],
  sky: ["#3b82f6", "#2563eb"],
  rose: ["#f43f5e", "#e11d48"],
  violet: ["#8b5cf6", "#7c3aed"]
};

export const ADMIN_CHART_COLORS = ["#10b981", "#f59e0b", "#3b82f6"];
