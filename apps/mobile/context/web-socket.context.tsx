import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const WebSocketContext = createContext<any>(null);

const getExpoHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    "";

  const host = String(hostUri).split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return host;
};

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

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const setup = async () => {
      // Fix #2: include the access token so the worker-service can verify
      // the connection identity. Without it the server rejects the upgrade.
      const token = await SecureStore.getItemAsync("access_token").catch(() => null);
      if (!token || cancelled) return;

      const expoHost = getExpoHost();
      const wsBase =
        process.env.EXPO_PUBLIC_CHATTING_WEBSOCKET_URI ||
        (expoHost && expoHost !== "localhost" && expoHost !== "127.0.0.1"
          ? `ws://${expoHost}:6006`
          : "ws://localhost:6006");

      const wsUrl = `${wsBase}${wsBase.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(
        token,
      )}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setWsReady(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "UNSEEN_COUNT_UPDATE") {
            const { conversationId, count } = data.payload;
            setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
          }
        } catch {
          // ignore malformed frames
        }
      };
    };

    setup();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [user?.id]);

  return (
    <WebSocketContext.Provider value={{ ws: wsReady ? wsRef.current : null, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
