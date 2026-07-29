import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { getExpoHost, PRODUCTION_WS_BASE_URL } from "@/config/network";

type WebSocketMessage = { type: string; payload?: any; [key: string]: any };
type MessageListener = (data: WebSocketMessage) => void;

interface WebSocketContextValue {
  ws: WebSocket | null;
  isConnected: boolean;
  unreadCounts: Record<string, number>;
  /** Attach a listener for every parsed message on the shared connection — the
   * socket only allows one `onmessage` assignment, so per-screen consumers
   * (chat, live order tracking) subscribe instead of opening their own socket. */
  subscribe: (listener: MessageListener) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  ws: null,
  isConnected: false,
  unreadCounts: {},
  subscribe: () => () => {},
});

export const WebSocketProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => {
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const listenersRef = useRef<Set<MessageListener>>(new Set());
  const queryClient = useQueryClient();

  const subscribe = useCallback((listener: MessageListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const connect = async () => {
      // Fix #2: include the access token so the worker-service can verify
      // the connection identity. Without it the server rejects the upgrade.
      const token = await SecureStore.getItemAsync("access_token").catch(() => null);
      if (!token || cancelled) return;

      const expoHost = getExpoHost();
      // Release builds must never fall back to localhost — use the production
      // endpoint if env injection was missed (mirrors axiosInstance fallback).
      const wsBase =
        process.env.EXPO_PUBLIC_CHATTING_WEBSOCKET_URI ||
        (!__DEV__
          ? PRODUCTION_WS_BASE_URL
          : expoHost && expoHost !== "localhost" && expoHost !== "127.0.0.1"
            ? `ws://${expoHost}:6006`
            : "ws://localhost:6006");

      const wsUrl = `${wsBase}${wsBase.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(
        token,
      )}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        attempt = 0;
        setWsReady(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "UNSEEN_COUNT_UPDATE") {
            const { conversationId, count } = data.payload;
            setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
          } else if (data.type === "ORDER_STATUS_UPDATE") {
            const orderId = data.payload?.orderId;
            if (orderId) {
              queryClient.setQueryData(["order", orderId], (old: any) =>
                old
                  ? {
                      ...old,
                      status: data.payload?.status || old.status,
                      updatedAt: data.payload?.updatedAt || new Date().toISOString(),
                    }
                  : old,
              );
              queryClient.invalidateQueries({ queryKey: ["order", orderId] });
            }
            queryClient.invalidateQueries({ queryKey: ["user-orders"] });
          }

          // Re-broadcast to per-screen subscribers (chat, live order tracking)
          // regardless of type — they filter for what they care about.
          listenersRef.current.forEach((listener) => listener(data));
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setWsReady(false);
        const delay = Math.min(3000 * 2 ** attempt, 30000);
        attempt += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      setWsReady(false);
      wsRef.current?.close();
    };
  }, [user?.id, queryClient]);

  return (
    <WebSocketContext.Provider
      value={{ ws: wsReady ? wsRef.current : null, isConnected: wsReady, unreadCounts, subscribe }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
