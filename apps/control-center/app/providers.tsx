"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Panels poll on their own interval (lib/use-metric.ts). Refetching
            // again on every tab focus would put a burst on Prometheus each
            // time someone alt-tabs back to the dashboard.
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 2_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
