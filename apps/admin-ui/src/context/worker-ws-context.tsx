"use client";
/**
 * WorkerWSContext (admin-ui) — ONE persistent WebSocket for the entire admin session.
 *
 * Previously each page/hook created its own WebSocket connection which caused:
 *  - Reconnect delays on every navigation
 *  - Multiple simultaneous connections
 *
 * Now: A single connection is established at app root (provider.tsx) and shared
 * via React Context. Components call subscribe() to listen for events without
 * ever touching WebSocket directly.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { frontendEnv } from "@/config/env";

type EventHandler = (payload: any) => void;
type Unsubscribe = () => void;

interface WorkerWSContextValue {
  /** Subscribe to a WS event type. Returns an unsubscribe cleanup function. */
  subscribe: (eventType: string, handler: EventHandler) => Unsubscribe;
}

const WorkerWSContext = createContext<WorkerWSContextValue>({
  subscribe: () => () => {},
});

export const useWorkerWS = () => useContext(WorkerWSContext);

interface WorkerWSProviderProps {
  children: React.ReactNode;
  /** Admin's ID — registers this connection in the adminId room. */
  adminId?: string;
}

export const WorkerWSProvider = ({
  children,
  adminId,
}: WorkerWSProviderProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const destroyedRef = useRef(false);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const attemptRef = useRef(0);

  const emit = useCallback((type: string, payload: any) => {
    listenersRef.current.get(type)?.forEach((h) => h(payload));
  }, []);

  const subscribe = useCallback(
    (eventType: string, handler: EventHandler): Unsubscribe => {
      if (!listenersRef.current.has(eventType)) {
        listenersRef.current.set(eventType, new Set());
      }
      listenersRef.current.get(eventType)!.add(handler);
      return () => {
        listenersRef.current.get(eventType)?.delete(handler);
      };
    },
    [],
  );

  // Re-connect ONLY when adminId changes (login / logout). Navigation is free.
  useEffect(() => {
    if (!adminId) return;

    destroyedRef.current = false;
    attemptRef.current = 0;

    // If the WS env var is missing in production, derive wss:// from the API
    // URL instead of falling back to ws://localhost (which browsers also
    // block as mixed content on an https page).
    const derivedWs = frontendEnv.apiUrl.startsWith("https")
      ? frontendEnv.apiUrl.replace(/^https/, "wss")
      : null;
    const wsBase = (
      process.env.NEXT_PUBLIC_WORKER_WS_URL || derivedWs || "ws://localhost:6006"
    ).replace(/\?.*$/, "");

    const wsUrl = `${wsBase}?adminId=${adminId}`;

    const connect = () => {
      if (destroyedRef.current) return;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        console.log(`✅ Admin WorkerWS connected (persistent | adminId=${adminId})`);
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          emit(data.type, data.payload ?? data);
        } catch {}
      };

      ws.onclose = () => {
        if (destroyedRef.current) return;
        // Exponential backoff: 3s → 6s → 12s → 24s → 30s max
        const delay = Math.min(3000 * 2 ** attemptRef.current, 30_000);
        attemptRef.current += 1;
        reconnectRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      destroyedRef.current = true;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [adminId, emit]);

  return (
    <WorkerWSContext.Provider value={{ subscribe }}>
      {children}
    </WorkerWSContext.Provider>
  );
};
