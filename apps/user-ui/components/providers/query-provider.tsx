"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { setQueryClientRef } from "@/lib/auth-store";

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
      })
  );

  // Register queryClient so auth-store can invalidate on logout
  useState(() => { setQueryClientRef(queryClient); });

  // Global WebSocket for system-wide updates (e.g., Stock)
  useState(() => {
    if (typeof window === "undefined") return;

    const wsBase = (process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006").replace(/\?.*$/, "");
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connect = () => {
      ws = new WebSocket(`${wsBase}`); // Generic connection

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "STOCK_UPDATE") {
            // Payload is nested under data.payload (broadcastAll wraps as { type, payload })
            const { productId, catalogProductId, stock, message } = data.payload ?? {};

            if (productId !== undefined && stock !== undefined) {
              // Match by variant id OR catalog id (products may appear with either id
              // depending on whether the user has a matching store location)
              const isMatch = (p: any) =>
                p.id === productId || p.id === catalogProductId;

              // 1. Instantly patch the products list cache (all storeId variants)
              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "products"] },
                (oldData: any) => {
                  if (!Array.isArray(oldData)) return oldData;
                  return oldData.map((p: any) =>
                    isMatch(p) ? { ...p, stock } : p,
                  );
                },
              );

              // 2. Instantly patch the single product detail cache
              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "product"] },
                (oldData: any) => {
                  if (oldData && isMatch(oldData)) {
                    return { ...oldData, stock };
                  }
                  return oldData;
                },
              );
            }

            // 3. Background refetch so data stays consistent after patch
            queryClient.invalidateQueries({ queryKey: ["storefront"] });

            if (message) {
              import("sonner").then(({ toast }) => {
                toast.warning("Stock Update", {
                  description: message,
                  duration: 5000,
                });
              });
            }
          }
        } catch (e) {
          console.error("User WS parse error:", e);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

