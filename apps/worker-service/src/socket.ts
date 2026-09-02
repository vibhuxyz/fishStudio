import WebSocket, { WebSocketServer } from "ws";
import { Server, IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { ENV } from "@repo/env-config";
import { isTokenRevoked } from "@repo/libs/auth-tokens";
import { logger } from "@repo/libs/logger";

interface SocketClient extends WebSocket {
  storeId?: string;   // seller connects; storeId resolved from verified JWT
  sellerId?: string;  // staff connects; sellerId resolved from verified JWT
  staffId?: string;   // staff connects; staffId resolved from verified JWT
  userId?: string;    // user connects; userId resolved from verified JWT
  adminId?: string;   // admin connects; adminId resolved from verified JWT
  isAlive: boolean;
  identity?: VerifiedIdentity;
  /** Connection-limit bookkeeping — released when the socket closes. */
  ipKey?: string;
  identityKey?: string;
}

/**
 * Fix #2: authenticate every WebSocket upgrade with a verified JWT before
 * pinning any identity fields on the socket. The old code trusted client-
 * supplied query params (?userId=...&sellerId=...) which let anyone
 * impersonate anyone's real-time feed.
 *
 * The store/seller rooms are signed into the ticket by auth-service for the
 * same reason: they decide which *tenant's* order stream this socket may see,
 * and an id read off the URL is a claim the client makes about itself.
 */
interface VerifiedIdentity {
  role: "user" | "seller" | "staff" | "admin";
  id: string;
  storeId?: string;
  sellerId?: string;
}

// Browsers do not apply CORS to WebSocket upgrades, and extractToken accepts a
// cookie, so without this check any page on the internet could open an
// authenticated socket in a logged-in visitor's browser and read their feed.
// Non-browser clients send no Origin at all and are left to the JWT check.
const ALLOWED_ORIGINS = (ENV.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin: string) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (req: IncomingMessage): boolean => {
  const origin = req.headers.origin;
  if (!origin) return true;
  return ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin);
};

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
    // Staff access cookies are scoped per operational role. This cookie path
    // is only a same-origin fallback — the browser authenticates with a
    // ?access_token= ticket — so any staff cookie present is good enough here.
    return (
      jar["access_token"] ||
      jar["seller_access_token"] ||
      jar["staff_order_manager_access_token"] ||
      jar["staff_rider_access_token"] ||
      jar["staff_cutting_staff_access_token"] ||
      jar["staff_access_token"] ||
      jar["admin_access_token"] ||
      null
    );
  }
  return null;
};

const asClaim = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const verifyIdentity = async (token: string): Promise<VerifiedIdentity | null> => {
  try {
    const decoded = jwt.verify(
      token,
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string,
    ) as { id?: string; role?: string; jti?: string; storeId?: unknown; sellerId?: unknown };
    if (!decoded.id || !decoded.role) return null;
    if (!["user", "seller", "staff", "admin"].includes(decoded.role)) return null;
    if (await isTokenRevoked(token, decoded.jti)) return null;
    return {
      id: decoded.id,
      role: decoded.role as VerifiedIdentity["role"],
      storeId: asClaim(decoded.storeId),
      sellerId: asClaim(decoded.sellerId),
    };
  } catch {
    return null;
  }
};

// Anonymous sockets are open to the whole internet (they carry the public
// STOCK_UPDATE feed), so they are the cheap way to exhaust this process's file
// descriptors. Authenticated sockets are capped too, per identity rather than
// per IP: a shop behind one NAT can legitimately have many staff devices, but
// no single account needs dozens of tabs.
const MAX_CONNECTIONS_PER_IP = 20;
const MAX_CONNECTIONS_PER_IDENTITY = 10;

const clientIp = (req: IncomingMessage): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.socket.remoteAddress ?? "unknown";
};

export class SocketManager {
  private static instance: SocketManager;
  private wss: WebSocketServer;
  private clients: Set<SocketClient> = new Set();
  private connectionsPerIp = new Map<string, number>();
  private connectionsPerIdentity = new Map<string, number>();

  private constructor(server: Server) {
    // noServer mode so we can authenticate on `upgrade` before handing off.
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      const reject = (status: string) => {
        socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\n\r\n`);
        socket.destroy();
      };

      if (!isAllowedOrigin(req)) {
        logger.warn(`Rejected WS upgrade from disallowed origin: ${req.headers.origin}`);
        return reject("403 Forbidden");
      }

      const token = extractToken(req);

      void (async () => {
        const identity = token ? await verifyIdentity(token) : null;

        // Anonymous upgrades are allowed (so unauthenticated browsers can still
        // receive `broadcastAll` messages like STOCK_UPDATE) but they are NOT
        // pinned to any user/seller/admin/staff room — the private room
        // broadcasts ignore sockets without a verified identity.
        if (token && !identity) {
          // A token was supplied but it didn't verify — reject to avoid leaking
          // any info that might otherwise tempt an attacker to tamper with it.
          return reject("401 Unauthorized");
        }

        // Verification is async now (Redis blocklist lookup), so the client may
        // have gone away in the meantime — handleUpgrade on a dead socket throws.
        if (socket.destroyed) return;

        const ipKey = clientIp(req);
        const identityKey = identity ? `${identity.role}:${identity.id}` : null;

        if (!this.hasCapacity(ipKey, identityKey)) {
          logger.warn(`Rejected WS upgrade over connection limit (ip=${ipKey})`);
          return reject("429 Too Many Requests");
        }

        this.wss.handleUpgrade(req, socket as any, head, (ws) => {
          const client = ws as SocketClient;
          client.identity = identity ?? undefined;
          client.ipKey = ipKey;
          client.identityKey = identityKey ?? undefined;
          this.retainSlot(ipKey, identityKey);
          this.wss.emit("connection", ws, req);
        });
      })();
    });

    this.setupWss();
    this.setupHeartbeat();
  }

  private hasCapacity(ipKey: string, identityKey: string | null): boolean {
    if ((this.connectionsPerIp.get(ipKey) ?? 0) >= MAX_CONNECTIONS_PER_IP) return false;
    if (identityKey && (this.connectionsPerIdentity.get(identityKey) ?? 0) >= MAX_CONNECTIONS_PER_IDENTITY) {
      return false;
    }
    return true;
  }

  private retainSlot(ipKey: string, identityKey: string | null) {
    this.connectionsPerIp.set(ipKey, (this.connectionsPerIp.get(ipKey) ?? 0) + 1);
    if (identityKey) {
      this.connectionsPerIdentity.set(
        identityKey,
        (this.connectionsPerIdentity.get(identityKey) ?? 0) + 1,
      );
    }
  }

  // Counters must be deleted at zero, not left sitting at 0 — this map is keyed
  // by client IP, so keeping every key seen would grow without bound.
  private releaseSlot(ws: SocketClient) {
    const decrement = (map: Map<string, number>, key?: string) => {
      if (!key) return;
      const next = (map.get(key) ?? 0) - 1;
      if (next > 0) map.set(key, next);
      else map.delete(key);
    };
    decrement(this.connectionsPerIp, ws.ipKey);
    decrement(this.connectionsPerIdentity, ws.identityKey);
  }

  /**
   * Live connection counts, keyed by role ("anonymous" for sockets that carry
   * no JWT). Read at Prometheus scrape time rather than maintained by
   * inc/dec calls on connect and disconnect — a gauge derived from the set
   * that actually holds the sockets cannot drift out of step with it.
   */
  public getConnectionCountsByRole(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.clients.forEach((ws) => {
      const role = ws.identity?.role ?? "anonymous";
      counts[role] = (counts[role] ?? 0) + 1;
    });
    return counts;
  }

  public static getInstance(server?: Server): SocketManager {
    if (!SocketManager.instance && server) {
      SocketManager.instance = new SocketManager(server);
    }
    return SocketManager.instance;
  }

  private setupWss() {
    this.wss.on("connection", (ws: SocketClient) => {
      const identity = ws.identity;

      ws.isAlive = true;

      // Pin every room purely from the verified JWT — the ?userId=/?storeId=/
      // ?sellerId= query params the clients still send are ignored entirely.
      // Anonymous connections get no identity fields, so they only receive
      // broadcastAll messages.
      if (identity) {
        if (identity.role === "user") {
          ws.userId = identity.id;
        } else if (identity.role === "admin") {
          ws.adminId = identity.id;
        } else if (identity.role === "seller") {
          ws.sellerId = identity.id;
          ws.storeId = identity.storeId;
        } else if (identity.role === "staff") {
          ws.staffId = identity.id;
          ws.sellerId = identity.sellerId;
        }
      }

      this.clients.add(ws);

      ws.on("pong", () => { ws.isAlive = true; });
      // `close` always fires after `error`, so releasing the slot here alone
      // keeps the counters from being decremented twice for one socket.
      ws.on("close", () => {
        this.clients.delete(ws);
        this.releaseSlot(ws);
      });
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

  private broadcastToRoom(
    field: "storeId" | "staffId" | "sellerId" | "userId" | "adminId",
    id: string,
    type: string,
    payload: unknown,
  ) {
    const message = JSON.stringify({ type, payload });
    let count = 0;

    this.clients.forEach((client) => {
      if (client[field] === id && client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });

    logger.info(` Broadcasted ${type} to ${count} clients (${field}=${id})`);
  }

  public broadcastToStore(storeId: string, type: string, payload: unknown) {
    this.broadcastToRoom("storeId", storeId, type, payload);
  }

  /** Broadcast to staff clients connected with their own ?staffId=xxx */
  public broadcastToStaff(staffId: string, type: string, payload: unknown) {
    this.broadcastToRoom("staffId", staffId, type, payload);
  }

  /** Broadcast to staff clients connected with ?sellerId=xxx */
  public broadcastToSeller(sellerId: string, type: string, payload: unknown) {
    this.broadcastToRoom("sellerId", sellerId, type, payload);
  }

  /** Broadcast to user clients connected with ?userId=xxx */
  public broadcastToUser(userId: string, type: string, payload: unknown) {
    this.broadcastToRoom("userId", userId, type, payload);
  }

  /** Broadcast to admin clients connected with ?adminId=xxx */
  public broadcastToAdmin(adminId: string, type: string, payload: unknown) {
    this.broadcastToRoom("adminId", adminId, type, payload);
  }

  public broadcastAll(type: string, payload: unknown) {
    const message = JSON.stringify({ type, payload });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
