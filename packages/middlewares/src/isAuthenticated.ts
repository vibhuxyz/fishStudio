import crypto from "node:crypto";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs";

const AUTH_CACHE_TTL = 300; // 5 minutes — reduces DB lookups per authenticated user

// Fix #13: hash the token before using it as a Redis key so that a Redis
// read-leak does not directly expose valid JWTs.
const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Fix #14: explicit server-side revocation. Logout writes a blocklist entry
// keyed by token hash (optionally jti) so stolen tokens become unusable
// immediately rather than waiting for natural JWT expiry.
const isTokenRevoked = async (token: string, jti?: string): Promise<boolean> => {
  try {
    const [byHash, byJti] = await Promise.all([
      redis.exists(`auth:revoked:${hashToken(token)}`),
      jti ? redis.exists(`auth:revoked:jti:${jti}`) : Promise.resolve(0),
    ]);
    return byHash > 0 || byJti > 0;
  } catch {
    // If Redis is unreachable, don't block valid tokens. Logout blocklist is
    // a belt-and-suspenders layer on top of short-lived JWTs.
    return false;
  }
};

// Fix #12: role detection is driven purely by the `x-auth-role` header. If
// it's missing, we try each cookie in a fixed order — the JWT payload's
// signed `role` is still the authoritative source downstream.
const pickToken = (req: any): { token: string | null; requestedRole: string | null } => {
  const requestedRole = (req.headers["x-auth-role"] as string | undefined)?.trim() || null;
  const bearer = (req.headers.authorization as string | undefined)?.split(" ")[1] || null;

  if (requestedRole === "admin") return { token: req.cookies["admin_access_token"] || bearer, requestedRole };
  if (requestedRole === "staff") return { token: req.cookies["staff_access_token"] || bearer, requestedRole };
  if (requestedRole === "seller")
    return {
      token: req.cookies["seller_access_token"] || req.cookies["staff_access_token"] || bearer,
      requestedRole,
    };
  if (requestedRole === "user") return { token: req.cookies["access_token"] || bearer, requestedRole };

  // No explicit role header — use whichever cookie is present.
  const token =
    req.cookies["staff_access_token"] ||
    req.cookies["seller_access_token"] ||
    req.cookies["admin_access_token"] ||
    req.cookies["access_token"] ||
    bearer ||
    null;
  return { token, requestedRole };
};

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { token } = pickToken(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    const tokenHash = hashToken(token);
    const cacheKey = `auth:${tokenHash}`;

    // ── Redis cache check (hashed key) ────────────────────────────────────
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);

        let bypassCache = false;
        if (data.role === "seller" && data.seller?.id) {
          bypassCache = (await redis.exists(`cache:bypass:seller:${data.seller.id}`)) > 0;
        } else if (data.role === "staff" && data.staff?.id) {
          bypassCache = (await redis.exists(`cache:bypass:staff:${data.staff.id}`)) > 0;
        }

        if (!bypassCache) {
          // Honour revocation before serving cached data.
          if (await isTokenRevoked(token, data.jti)) {
            await redis.del(cacheKey).catch(() => {});
            return res.status(401).json({ message: "Unauthorized! Session revoked." });
          }

          req.role = data.role;
          if (data.seller) req.seller = data.seller;
          if (data.staff) req.staff = data.staff;
          if (data.admin) req.admin = data.admin;
          if (data.user) req.user = data.user;
          return next();
        }
      }
    } catch {
      // Redis unavailable — fall through to DB path.
    }
    // ──────────────────────────────────────────────────────────────────────

    const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string) as {
      id: string;
      role: "admin" | "user" | "seller" | "staff";
      jti?: string;
    };

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid token" });
    }

    if (await isTokenRevoked(token, decoded.jti)) {
      return res.status(401).json({ message: "Unauthorized! Session revoked." });
    }

    let account: any;
    if (decoded.role === "admin") {
      account = await prisma.admins.findUnique({ where: { id: decoded.id } });
      req.admin = account;
    } else if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { store: true },
      });
      req.seller = account;
    } else if (decoded.role === "staff") {
      //@ts-ignore
      account = await prisma.staffs.findUnique({
        where: { id: decoded.id },
        include: { seller: { include: { store: true } } },
      });
      req.staff = account;
      if (account && (account as any).seller) {
        req.seller = (account as any).seller;
      }
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }

    // Fix #24 follow-through: inactive staff cannot use their session even if
    // their JWT is valid — a seller who revokes access must immediately kick
    // the staff out of every request in flight.
    if (decoded.role === "staff" && account.isActive === false) {
      return res.status(401).json({ message: "Staff account is not active." });
    }

    req.role = decoded.role;

    // ── Write to cache ────────────────────────────────────────────────────
    try {
      const cacheData = {
        role: decoded.role,
        jti: decoded.jti,
        seller: req.seller ?? null,
        staff: req.staff ?? null,
        admin: req.admin ?? null,
        user: req.user ?? null,
      };
      await redis.set(cacheKey, JSON.stringify(cacheData), "EX", AUTH_CACHE_TTL);

      if (decoded.role === "seller" && req.seller?.id) {
        await redis.del(`cache:bypass:seller:${req.seller.id}`);
      } else if (decoded.role === "staff" && req.staff?.id) {
        await redis.del(`cache:bypass:staff:${req.staff.id}`);
      }
    } catch {
      // Non-fatal: cache write failure doesn't block the request.
    }

    return next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      message: "Unauthorized! Invalid token or expired",
    });
  }
};

export default isAuthenticated;
