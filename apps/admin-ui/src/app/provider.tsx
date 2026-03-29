"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "sonner";
import { WorkerWSProvider } from "../context/worker-ws-context";
import { useAdminAccount } from "../hooks/useAdminQueries";

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: FIVE_MINUTES,
            gcTime: THIRTY_MINUTES,
            retry: 1,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * WorkerWSBridge must sit INSIDE QueryClientProvider so it can call
       * useAdminAccount() (which uses useQuery internally).
       * It establishes ONE persistent WebSocket for the whole session.
       */}
      <WorkerWSBridge>{children}</WorkerWSBridge>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
};

/**
 * Inner component: reads admin identity, passes adminId to WorkerWSProvider.
 * The connection is re-created ONLY when adminId changes (login/logout).
 * Normal page navigation never causes a reconnect.
 */
const WorkerWSBridge = ({ children }: { children: React.ReactNode }) => {
  const { data: admin } = useAdminAccount();

  return (
    <WorkerWSProvider adminId={admin?.id}>
      {children}
    </WorkerWSProvider>
  );
};

export default Providers;
