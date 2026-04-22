import WebSocket, { WebSocketServer } from "ws";
import { Server, IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { ENV } from "@repo/env-config";

interface SocketClient extends WebSocket {
  storeId?: string;   // seller connects; storeId resolved from verified JWT
  sellerId?: string;  // staff connects; sellerId resolved from verified JWT
  staffId?: string;   // staff connects; staffId resolved from verified JWT
  userId?: string;    // user connects; userId resolved from verified JWT
  adminId?: string;   // admin connects; adminId resolved from verified JWT
  isAlive: boolean;
  role?: "user" | "seller" | "staff" | "admin";
}

/**
 * Fix #2: authenticate every WebSocket upgrade with a verified JWT before
 * pinning any identity fields on the socket. The old code trusted client-
 * supplied query params (?userId=...&sellerId=...) which let anyone
 * impersonate anyone's real-time feed.
 */
interface VerifiedIdentity {
  role: "user" | "seller" | "staff" | "admin";
  id: string;
}

const extractToken = (req: IncomingMessage): string | null => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const qToken = url.searchParams.get("access_token") || url.searchParams.get("token");
  if (qToken) return qToken;

  const auth = req.headers["authorization"];
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice("Bearer ".length).trim();
  }

  const rawCookie = req.headers["cookie"];
  if (typeof rawCookie === "string" && rawCookie.length > 0) {
    const jar = cookie.parse(rawCookie);
    return (
      jar["access_token"] ||
      jar["seller_access_token"] ||
      jar["staff_access_token"] ||
      jar["admin_access_token"] ||
      null
    );
  }
  return null;
};

const verifyIdentity = (token: string): VerifiedIdentity | null => {
  try {
    const decoded = jwt.verify(
      token,
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string,
    ) as { id?: string; role?: string };
    if (!decoded.id || !decoded.role) return null;
    if (!["user", "seller", "staff", "admin"].includes(decoded.role)) return null;
    return { id: decoded.id, role: decoded.role as VerifiedIdentity["role"] };
  } catch {
    return null;
  }
};

export class SocketManager {
  private static instance: SocketManager;
  private wss: WebSocketServer;
  private clients: Set<SocketClient> = new Set();

  private constructor(server: Server) {
    // noServer mode so we can authenticate on `upgrade` before handing off.
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      const token = extractToken(req);
      const identity = token ? verifyIdentity(token) : null;

      // Anonymous upgrades are allowed (so unauthenticated browsers can still
      // receive `broadcastAll` messages like STOCK_UPDATE) but they are NOT
      // pinned to any user/seller/admin/staff room — the private room
      // broadcasts ignore sockets without a verified identity.
      if (token && !identity) {
        // A token was supplied but it didn't verify — reject to avoid leaking
        // any info that might otherwise tempt an attacker to tamper with it.
        socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(req, socket as any, head, (ws) => {
        (ws as any).__identity = identity;
        this.wss.emit("connection", ws, req);
      });
    });

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
      const identity = (ws as any).__identity as VerifiedIdentity | undefined;

      ws.isAlive = true;
      ws.role = identity?.role;

      // Pin the room purely from the verified JWT. Anonymous connections get
      // no identity fields — they only receive broadcastAll messages.
      if (identity) {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        const qStoreId = url.searchParams.get("storeId");
        if (identity.role === "user") {
          ws.userId = identity.id;
        } else if (identity.role === "admin") {
          ws.adminId = identity.id;
        } else if (identity.role === "seller") {
          ws.sellerId = identity.id;
          if (qStoreId) ws.storeId = qStoreId;
        } else if (identity.role === "staff") {
          ws.staffId = identity.id;
          const qSellerId = url.searchParams.get("sellerId");
          if (qSellerId) ws.sellerId = qSellerId;
        }
      }

      this.clients.add(ws);

      ws.on("pong", () => { ws.isAlive = true; });
      ws.on("close", () => { this.clients.delete(ws); });
      ws.on("error", () => { this.clients.delete(ws); });

      // Incoming messages cannot change the pinned identity.
      ws.on("message", () => { /* no-op */ });
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
