import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs";

const AUTH_CACHE_TTL = 300; // 5 minutes — reduces DB lookups per authenticated user

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;
    const requestedRole = req.headers["x-auth-role"];

    if (requestedRole === "admin" || req.path.includes("admin")) {
      token = req.cookies["admin_access_token"];
    } else if (requestedRole === "staff") {
      token = req.cookies["staff_access_token"];
    } else if (requestedRole === "seller" || req.path.includes("seller")) {
      token =
        req.cookies["seller_access_token"] || req.cookies["staff_access_token"];
    } else if (requestedRole === "user" || req.path.includes("user")) {
      token = req.cookies["access_token"];
    } else {
      // fallback: use whichever exists
      token =
        req.cookies["staff_access_token"] ||
        req.cookies["seller_access_token"] ||
        req.cookies["admin_access_token"] ||
        req.cookies["access_token"] ||
        req.headers.authorization?.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized! Token missing.",
      });
    }

    // ── Redis cache check ──────────────────────────────────────────────────
    const cacheKey = `auth:${token}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);

        // Check for a force-bypass flag — set when seller is approved or staff gets access
        let bypassCache = false;
        if (data.role === "seller" && data.seller?.id) {
          bypassCache = (await redis.exists(`cache:bypass:seller:${data.seller.id}`)) > 0;
        } else if (data.role === "staff" && data.staff?.id) {
          bypassCache = (await redis.exists(`cache:bypass:staff:${data.staff.id}`)) > 0;
        }

        if (!bypassCache) {
          req.role = data.role;
          if (data.seller) req.seller = data.seller;
          if (data.staff) req.staff = data.staff;
          if (data.admin) req.admin = data.admin;
          if (data.user) req.user = data.user;
          return next();
        }
      }
    } catch {
      // Redis unavailable — fall through to DB
    }
    // ──────────────────────────────────────────────────────────────────────

    // verify it
    const decode = jwt.verify(
      token,
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string,
    ) as {
      id: string;
      role: "admin" | "user" | "seller" | "staff";
    };
    if (!decode) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token",
      });
    }
    let account;

    if (decode.role === "admin") {
      account = await prisma.admins.findUnique({
        where: { id: decode.id },
      });
      req.admin = account;
    } else if (decode.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decode.id },
      });
      req.user = account;
    } else if (decode.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decode.id },
        include: { store: true },
      });
      req.seller = account;
    } else if (decode.role === "staff") {
      //@ts-ignore
      account = await prisma.staffs.findUnique({
        where: { id: decode.id },
        include: { seller: { include: { store: true } } },
      });
      req.staff = account;
      // expose seller context for routes that use req.seller
      if (account && (account as any).seller) {
        req.seller = (account as any).seller;
      }
    }

    if (!account) {
      return res.status(401).json({
        message: "Account not found!",
      });
    }
    req.role = decode.role;

    // ── Write to cache ─────────────────────────────────────────────────────
    try {
      const cacheData = {
        role: decode.role,
        seller: req.seller ?? null,
        staff: req.staff ?? null,
        admin: req.admin ?? null,
        user: req.user ?? null,
      };
      await redis.set(cacheKey, JSON.stringify(cacheData), "EX", AUTH_CACHE_TTL);

      // Clear bypass flag now that we've cached fresh DB data
      if (decode.role === "seller" && req.seller?.id) {
        await redis.del(`cache:bypass:seller:${req.seller.id}`);
      } else if (decode.role === "staff" && req.staff?.id) {
        await redis.del(`cache:bypass:staff:${req.staff.id}`);
      }
    } catch {
      // Non-fatal: cache write failure doesn't block the request
    }
    // ──────────────────────────────────────────────────────────────────────

    return next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      message: "Unauthorized! Invalid token or expired",
      error: error.message,
    });
  }
};

export default isAuthenticated;
