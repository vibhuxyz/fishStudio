import WebSocket, { WebSocketServer } from "ws";
import { Server, IncomingMessage } from "http";
import { ENV } from "@repo/env-config";

interface SocketClient extends WebSocket {
  storeId?: string;
  isAlive: boolean;
}

export class SocketManager {
  private static instance: SocketManager;
  private wss: WebSocketServer;
  private clients: Set<SocketClient> = new Set();

  private constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWss();
    this.setupHeartbeat();
  }

  public static getInstance(server?: Server): SocketManager {
    if (!SocketManager.instance && server) {
      SocketManager.instance = new SocketManager(server);
    }
    return SocketManager.instance;
  }

  private setupWss() {
    this.wss.on("connection", (ws: SocketClient, req: IncomingMessage) => {
      console.log("🔌 New WebSocket connection");
      ws.isAlive = true;

      // Extract storeId from URL query params: ws://host:port?storeId=123
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const storeId = url.searchParams.get("storeId");
      
      if (storeId) {
        ws.storeId = storeId;
        console.log(`🏠 Client joined room for store: ${storeId}`);
      }

      this.clients.add(ws);

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("close", () => {
        console.log("🔌 Connection closed");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("❌ Socket error:", error);
        this.clients.delete(ws);
      });

      // Handle custom messages if needed
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "JOIN_STORE") {
            ws.storeId = message.storeId;
            console.log(`🏠 Client re-joined room for store: ${ws.storeId}`);
          }
        } catch (e) {
          // Ignore invalid messages
        }
      });
    });
  }

  private setupHeartbeat() {
    const interval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on("close", () => {
      clearInterval(interval);
    });
  }

  public broadcastToStore(storeId: string, type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    let count = 0;

    this.clients.forEach((client) => {
      if (client.storeId === storeId && client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });

    console.log(`📢 Broadcasted ${type} to ${count} clients in store ${storeId}`);
  }

  public broadcastAll(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
