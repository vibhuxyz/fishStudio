import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ENV } from "@repo/env-config";
import { isTokenRevoked } from "@repo/libs/auth-tokens";

/**
 * Resolves the customer behind a public request, without ever rejecting it.
 *
 * Some endpoints are genuinely public but answer differently for a known
 * customer — the coupon endpoints are the case this exists for. Per-user
 * redemption limits, first-order eligibility and personally-issued reward
 * codes all need an identity, but a logged-out shopper must still be able to
 * browse offers. `isAuthenticated` can't do this: it 401s when no token is
 * present.
 *
 * On success `req.user` and `req.role` are set exactly as `isAuthenticated`
 * sets them. On any failure — missing, malformed, expired or revoked token —
 * the request continues anonymously.
 */
const optionalAuth = async (req: any, _res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.["access_token"] ||
      (req.headers.authorization as string | undefined)?.split(" ")[1] ||
      null;

    if (!token) return next();

    const decoded = jwt.verify(
      token,
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string,
    ) as { id: string; role: "admin" | "user" | "seller" | "staff"; jti?: string };

    // Only customer sessions carry meaning here — a seller browsing the
    // storefront must not be resolved as the shopper the offers belong to.
    if (decoded?.role !== "user") return next();

    if (await isTokenRevoked(token, decoded.jti)) return next();

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true },
    });
    if (!user) return next();

    req.user = user;
    req.role = "user";
    return next();
  } catch {
    // Anonymous is a valid outcome here, so a bad token is not an error —
    // the handler simply skips every per-user rule.
    return next();
  }
};

export default optionalAuth;
