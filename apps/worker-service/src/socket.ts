import WebSocket, { WebSocketServer } from "ws";
import { Server, IncomingMessage } from "http";
import { ENV } from "@repo/env-config";

interface SocketClient extends WebSocket {
  storeId?: string;   // seller connects with ?storeId=xxx
  sellerId?: string;  // staff connects with ?sellerId=xxx
  staffId?: string;   // staff connects with ?staffId=xxx (access-granted events)
  userId?: string;    // user connects with ?userId=xxx (order status updates)
  adminId?: string;   // admin connects with ?adminId=xxx (admin alerts)
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
      const sellerId = url.searchParams.get("sellerId");
      const staffId = url.searchParams.get("staffId");
      const userId = url.searchParams.get("userId");
      const adminId = url.searchParams.get("adminId");

      if (storeId) {
        ws.storeId = storeId;
        console.log(`🏠 Seller client joined store room: ${storeId}`);
      }
      if (sellerId) {
        ws.sellerId = sellerId;
        console.log(`👤 Staff client joined seller room: ${sellerId}`);
      }
      if (staffId) {
        ws.staffId = staffId;
        console.log(`🪪 Staff client joined staff room: ${staffId}`);
      }
      if (userId) {
        ws.userId = userId;
        console.log(`🙋 User client joined user room: ${userId}`);
      }
      if (adminId) {
        ws.adminId = adminId;
        console.log(`🔑 Admin client joined admin room: ${adminId}`);
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
            console.log(`🏠 Client re-joined store room: ${ws.storeId}`);
          }
          if (message.type === "JOIN_SELLER") {
            ws.sellerId = message.sellerId;
            console.log(`👤 Client re-joined seller room: ${ws.sellerId}`);
          }
          if (message.type === "JOIN_STAFF") {
            ws.staffId = message.staffId;
            console.log(`🪪 Client re-joined staff room: ${ws.staffId}`);
          }
          if (message.type === "JOIN_USER") {
            ws.userId = message.userId;
            console.log(`🙋 Client re-joined user room: ${ws.userId}`);
          }
          if (message.type === "JOIN_ADMIN") {
            ws.adminId = message.adminId;
            console.log(`🔑 Client re-joined admin room: ${ws.adminId}`);
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

  /** Broadcast to staff clients connected with their own ?staffId=xxx */
  public broadcastToStaff(staffId: string, type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    let count = 0;
    this.clients.forEach((client) => {
      if (client.staffId === staffId && client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });
    console.log(`📢 Broadcasted ${type} to ${count} clients in staff room ${staffId}`);
  }

  /** Broadcast to staff clients connected with ?sellerId=xxx */
  public broadcastToSeller(sellerId: string, type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    let count = 0;
    this.clients.forEach((client) => {
      if (client.sellerId === sellerId && client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });
    console.log(`📢 Broadcasted ${type} to ${count} staff clients for seller ${sellerId}`);
  }

  /** Broadcast to user clients connected with ?userId=xxx */
  public broadcastToUser(userId: string, type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    let count = 0;
    this.clients.forEach((client) => {
      if (client.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });
    console.log(`📢 Broadcasted ${type} to ${count} user clients for user ${userId}`);
  }

  /** Broadcast to admin clients connected with ?adminId=xxx */
  public broadcastToAdmin(adminId: string, type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    let count = 0;
    this.clients.forEach((client) => {
      if (client.adminId === adminId && client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });
    console.log(`📢 Broadcasted ${type} to ${count} admin clients for admin ${adminId}`);
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
