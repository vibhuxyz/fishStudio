"use client";
/**
 * WorkerWSContext — ONE persistent WebSocket connection for the entire seller/staff session.
 *
 * Why: Previously every page / hook created its own WebSocket which meant:
 *  - TCP + WS handshake on every navigation (~200-300 ms lag)
 *  - Multiple simultaneous connections per user
 *
 * Now: A single connection is established at app root (provider.tsx) and shared
 * via React Context. Pages and hooks simply call subscribe() to listen for events.
 * The connection is only re-established when the user's identity changes (login/logout),
 * NOT on navigation.
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
  /** Subscribe to a specific WS event type. Returns a cleanup (unsubscribe) function. */
  subscribe: (eventType: string, handler: EventHandler) => Unsubscribe;
  /** Send a raw message to the server (e.g. JOIN_STAFF). */
  send: (message: object) => void;
}

const WorkerWSContext = createContext<WorkerWSContextValue>({
  subscribe: () => () => {},
  send: () => {},
});

export const useWorkerWS = () => useContext(WorkerWSContext);

interface WorkerWSProviderProps {
  children: React.ReactNode;
  /** Seller's own ID — registers this connection in the sellerId room. */
  sellerId?: string;
  /** Seller's store ID — registers in the storeId room for order events. */
  storeId?: string;
  /** Staff member's ID — registers in the staffId room. */
  staffId?: string;
}

export const WorkerWSProvider = ({
  children,
  sellerId,
  storeId,
  staffId,
}: WorkerWSProviderProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  // Map of eventType → Set of handlers. Lives for the lifetime of the context.
  const listenersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const destroyedRef = useRef(false);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const attemptRef = useRef(0);

  /** Dispatch a received event to all registered handlers. */
  const emit = useCallback((type: string, payload: any) => {
    listenersRef.current.get(type)?.forEach((h) => h(payload));
  }, []);

  /** Register a handler for an event type. Returns the unsubscribe function. */
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

  /** Send a message to the server (e.g. to join an extra room). */
  const send = useCallback((message: object) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  // Re-connect only when identity params change (login/logout), NOT on navigation.
  useEffect(() => {
    if (!sellerId && !storeId && !staffId) return;

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

    // Build query string with all available IDs so the server registers
    // this single connection in ALL relevant rooms at once.
    const params = new URLSearchParams();
    if (sellerId) params.set("sellerId", sellerId);
    if (storeId) params.set("storeId", storeId);
    if (staffId) params.set("staffId", staffId);

    const wsUrl = `${wsBase}?${params.toString()}`;

    const connect = () => {
      if (destroyedRef.current) return;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        console.log("✅ WorkerWS connected (persistent seller session)");
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
  }, [sellerId, storeId, staffId, emit]);

  return (
    <WorkerWSContext.Provider value={{ subscribe, send }}>
      {children}
    </WorkerWSContext.Provider>
  );
};
