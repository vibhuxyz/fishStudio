import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Constants from "expo-constants";

const WebSocketContext = createContext<any>(null);

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

    const expoHost = (Constants.expoConfig?.hostUri ?? "").split(":")[0];
    const wsBase = process.env.EXPO_PUBLIC_CHATTING_WEBSOCKET_URI ||
      (expoHost && expoHost !== "localhost" && expoHost !== "127.0.0.1"
        ? `ws://${expoHost}:6006`
        : "ws://localhost:6006");

    const ws = new WebSocket(wsBase);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(`user_${user.id}`);
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
      }
    };

    return () => {
      ws.close();
    };
  }, [user?.id]);

  return (
    <WebSocketContext.Provider value={{ ws: wsReady ? wsRef.current : null, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
