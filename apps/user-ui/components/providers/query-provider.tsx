"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
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
      }),
  );

  useEffect(() => {
    setQueryClientRef(queryClient);
  }, [queryClient]);

  // Global WebSocket for system-wide updates (e.g., Stock)
  useEffect(() => {
    const wsBase = (
      process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006"
    ).replace(/\?.*$/, "");
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      ws = new WebSocket(`${wsBase}`); // Generic connection

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "STOCK_UPDATE") {
            // Payload is nested under data.payload (broadcastAll wraps as { type, payload })
            const { productId, catalogProductId, stock, message } =
              data.payload ?? {};

            if (productId !== undefined && stock !== undefined) {
              // Match by variant id OR catalog id (products may appear with either id
              // depending on whether the user has a matching store location)
              const isMatch = (p: any) =>
                p.id === productId || p.id === catalogProductId;

              // 1. Instantly patch the products list cache (all storeId variants)
              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "products"] },
                (oldData: any) => {
                  if (Array.isArray(oldData)) {
                    return oldData.map((p: any) =>
                      isMatch(p) ? { ...p, stock } : p,
                    );
                  }

                  if (oldData && Array.isArray(oldData.products)) {
                    return {
                      ...oldData,
                      products: oldData.products.map((p: any) =>
                        isMatch(p) ? { ...p, stock } : p,
                      ),
                    };
                  }

                  return oldData;
                },
              );

              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "product-listing"] },
                (oldData: any) => {
                  if (!oldData || !Array.isArray(oldData.products))
                    return oldData;
                  return {
                    ...oldData,
                    products: oldData.products.map((p: any) =>
                      isMatch(p) ? { ...p, stock } : p,
                    ),
                  };
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
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
