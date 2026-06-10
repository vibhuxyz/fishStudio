"use client";
/**
 * WsContext — ONE persistent WebSocket for the entire user-ui session.
 *
 * Why: Previously query-provider, useNotifications, and orders/page each
 * created their own WebSocket → 3 handshakes on load, reconnect on every
 * page navigation.
 *
 * Now: A single connection is established here at app root.
 *  - Anonymous users  → connects with no params (receives STOCK_UPDATE)
 *  - Authenticated    → connects with ?userId=X (also receives ORDER_STATUS_UPDATE)
 *  - Login / logout   → connection re-established with new params (once)
 *  - Navigation       → connection stays alive, zero reconnect cost
 *
 * STOCK_UPDATE is handled directly here because it needs queryClient.
 * Other events are dispatched via subscribe() to any interested component.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-store";
import { frontendEnv } from "@/lib/env";

type EventHandler = (payload: any) => void;
type Unsubscribe = () => void;

interface WsContextValue {
  /** Subscribe to a WS event type. Returns an unsubscribe cleanup function. */
  subscribe: (eventType: string, handler: EventHandler) => Unsubscribe;
}

const WsContext = createContext<WsContextValue>({ subscribe: () => () => {} });

export const useWs = () => useContext(WsContext);

export function WsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  const userId = user?.id;

  // Re-connect only when userId changes (login / logout). Navigation never triggers this.
  useEffect(() => {
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

    // Authenticated: register for userId room so ORDER_STATUS_UPDATE is delivered.
    // Anonymous: generic connection that still receives broadcast STOCK_UPDATE.
    const wsUrl = userId ? `${wsBase}?userId=${userId}` : wsBase;

    const connect = () => {
      if (destroyedRef.current) return;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        console.log(`✅ User WS connected (persistent${userId ? ` | userId=${userId}` : " | anonymous"})`);
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const payload = data.payload ?? {};

          // Handle STOCK_UPDATE here — needs queryClient to patch caches.
          if (data.type === "STOCK_UPDATE") {
            const { productId, catalogProductId, stock } = payload;

            if (productId !== undefined && stock !== undefined) {
              const isMatch = (p: any) =>
                p.id === productId || p.id === catalogProductId;

              // Patch products list cache
              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "products"] },
                (old: any) => {
                  if (Array.isArray(old))
                    return old.map((p: any) => (isMatch(p) ? { ...p, stock } : p));
                  if (old && Array.isArray(old.products))
                    return {
                      ...old,
                      products: old.products.map((p: any) =>
                        isMatch(p) ? { ...p, stock } : p,
                      ),
                    };
                  return old;
                },
              );

              // Patch product-listing cache
              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "product-listing"] },
                (old: any) => {
                  if (!old || !Array.isArray(old.products)) return old;
                  return {
                    ...old,
                    products: old.products.map((p: any) =>
                      isMatch(p) ? { ...p, stock } : p,
                    ),
                  };
                },
              );

              // Patch single product detail cache
              queryClient.setQueriesData<any>(
                { queryKey: ["storefront", "product"] },
                (old: any) =>
                  old && isMatch(old) ? { ...old, stock } : old,
              );
            }
          }

          // Dispatch to all subscribers (including STOCK_UPDATE for any extra listeners)
          emit(data.type, payload);
        } catch (e) {
          console.error("User WS parse error:", e);
        }
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
  }, [userId, emit, queryClient]);

  return <WsContext.Provider value={{ subscribe }}>{children}</WsContext.Provider>;
}
