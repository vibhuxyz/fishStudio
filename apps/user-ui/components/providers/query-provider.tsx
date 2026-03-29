"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { setQueryClientRef } from "@/lib/auth-store";
import { useEffect } from "react";
import { WsProvider } from "@/context/ws-context";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 15 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      }),
  );

  useEffect(() => {
    setQueryClientRef(queryClient);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * WsProvider sits inside QueryClientProvider so it can call useQueryClient()
       * to patch caches on STOCK_UPDATE. It creates exactly ONE persistent WS
       * connection per session (re-connects only on login/logout, not navigation).
       */}
      <WsProvider>{children}</WsProvider>
    </QueryClientProvider>
  );
}
