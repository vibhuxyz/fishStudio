"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import useSeller from "../hooks/useSeller";
import { WorkerWSProvider } from "../context/worker-ws-context";
import { Toaster } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * WorkerWSBridge must sit INSIDE QueryClientProvider so it can call
       * useSeller() (which uses useQuery internally).
       * It establishes ONE persistent WebSocket for the whole session and
       * exposes subscribe() via WorkerWSContext to all children.
       */}
      <WorkerWSBridge>{children}</WorkerWSBridge>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
};

/**
 * Inner component: reads seller/staff identity from the cache, then passes
 * the correct IDs to WorkerWSProvider. This means:
 *  - Seller → connects with ?sellerId=X&storeId=Y
 *  - Staff  → connects with ?staffId=X
 *
 * The connection is re-created ONLY when the identity changes (login/logout).
 * Normal page navigation never causes a reconnect.
 */
const WorkerWSBridge = ({ children }: { children: React.ReactNode }) => {
  const { seller } = useSeller();

  const isStaff = seller?.role === "staff";

  const sellerId = !isStaff ? seller?.id : undefined;
  const storeId = !isStaff ? seller?.store?.id : undefined;
  const staffId = isStaff ? seller?.id : undefined;

  return (
    <WorkerWSProvider sellerId={sellerId} storeId={storeId} staffId={staffId}>
      {children}
    </WorkerWSProvider>
  );
};

export default Providers;
