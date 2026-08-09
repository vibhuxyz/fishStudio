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
  useMemo,
  useRef,
  useState,
} from "react";
import { frontendEnv } from "@/config/env";
import { STAFF_SCOPE_HEADER, currentStaffScope } from "@/utils/staffScope";

type EventHandler = (payload: any) => void;
type Unsubscribe = () => void;

interface WorkerWSContextValue {
  /** Subscribe to a specific WS event type. Returns a cleanup (unsubscribe) function. */
  subscribe: (eventType: string, handler: EventHandler) => Unsubscribe;
  /** Send a raw message to the server (e.g. JOIN_STAFF). */
  send: (message: object) => void;
  /** Whether the shared socket is currently open — drives live/offline badges. */
  connected: boolean;
}

const WorkerWSContext = createContext<WorkerWSContextValue>({
  subscribe: () => () => {},
  send: () => {},
  connected: false,
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
  const [connected, setConnected] = useState(false);

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

    // Exponential backoff: 3s → 6s → 12s → 24s → 30s max
    const scheduleReconnect = () => {
      if (destroyedRef.current) return;
      const delay = Math.min(3000 * 2 ** attemptRef.current, 30_000);
      attemptRef.current += 1;
      reconnectRef.current = setTimeout(() => {
        void connect();
      }, delay);
    };

    // The session cookie is first-party to this UI origin, so it is never sent
    // on an upgrade to the worker-service origin. Fetch a short-lived ticket
    // over the authenticated same-origin API path instead; without it the
    // socket connects anonymously and joins no room, so staff receive nothing.
    const connect = async () => {
      if (destroyedRef.current) return;

      let ticket: string | null = null;
      try {
        const scope = currentStaffScope();
        const res = await fetch("/auth/api/ws-ticket", {
          credentials: "include",
          // Be explicit rather than relying on the server's
          // whichever-cookie-is-present fallback: this browser may hold a
          // seller cookie plus all three scoped staff cookies at once, and
          // this tab's socket must authenticate as its own session.
          headers: {
            "x-auth-role": staffId ? "staff" : "seller",
            ...(scope ? { [STAFF_SCOPE_HEADER]: scope } : {}),
          },
        });
        if (res.ok) ticket = ((await res.json()) as { ticket?: string }).ticket ?? null;
      } catch {
        // Handled below — a ticketless socket is treated as a failed connect.
      }

      if (destroyedRef.current) return;

      // Without a ticket the socket authenticates as nobody and the server
      // joins it to no room, so it sits open receiving nothing — and because
      // it never closes, the reconnect path below never runs either. Retry
      // instead: a staff member whose ticket call lost a race at login would
      // otherwise go the whole shift without a single order alert.
      if (!ticket) {
        scheduleReconnect();
        return;
      }

      const query = new URLSearchParams(params);
      query.set("access_token", ticket);
      const ws = new WebSocket(`${wsBase}?${query.toString()}`);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        setConnected(true);
        console.log("✅ WorkerWS connected (persistent seller session)");
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          emit(data.type, data.payload ?? data);
        } catch {}
      };

      ws.onclose = () => {
        setConnected(false);
        scheduleReconnect();
      };

      ws.onerror = () => ws.close();
    };

    void connect();

    return () => {
      destroyedRef.current = true;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [sellerId, storeId, staffId, emit]);

  const value = useMemo(
    () => ({ subscribe, send, connected }),
    [subscribe, send, connected],
  );

  return (
    <WorkerWSContext.Provider value={value}>{children}</WorkerWSContext.Provider>
  );
};
