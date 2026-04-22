import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs";

// Longest access-token lifetime in the system (user: 7d). We keep blocklist
// entries for this long so revoked tokens can't be replayed until they expire.
const MAX_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const computeSecondsUntilExpiry = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      const ttl = Math.floor(decoded.exp - Date.now() / 1000);
      return ttl > 0 ? ttl : 60;
    }
  } catch {
    // fall through
  }
  return MAX_TOKEN_TTL_SECONDS;
};

/**
 * Add a token to the revocation blocklist so that isAuthenticated rejects it
 * immediately, regardless of whether it has expired naturally.
 *
 * We record both the token hash (for tokens that were issued without a jti)
 * and the jti (so rotating refresh-token families can be invalidated by jti
 * alone). Entries auto-expire at the token's own exp time.
 */
export const revokeToken = async (token: string | null | undefined) => {
  if (!token) return;
  const ttl = computeSecondsUntilExpiry(token);
  const tasks: Promise<unknown>[] = [
    redis.set(`auth:revoked:${hashToken(token)}`, "1", "EX", ttl),
    redis.del(`auth:${hashToken(token)}`),
  ];
  try {
    const decoded = jwt.decode(token) as { jti?: string } | null;
    if (decoded?.jti) {
      tasks.push(redis.set(`auth:revoked:jti:${decoded.jti}`, "1", "EX", ttl));
    }
  } catch {
    // ignore
  }
  try {
    await Promise.allSettled(tasks);
  } catch {
    // non-fatal
  }
};

// Per-user refresh-token "family" generation counter. When the user logs out
// or a refresh-token reuse is detected we bump the generation so all
// previously-issued refresh tokens for that user become invalid.
const refreshFamilyKey = (role: string, id: string) => `auth:rt_family:${role}:${id}`;

export const getRefreshFamily = async (role: string, id: string): Promise<number> => {
  try {
    const v = await redis.get(refreshFamilyKey(role, id));
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
};

export const bumpRefreshFamily = async (role: string, id: string): Promise<number> => {
  try {
    const v = await redis.incr(refreshFamilyKey(role, id));
    await redis.expire(refreshFamilyKey(role, id), MAX_TOKEN_TTL_SECONDS);
    return v;
  } catch {
    return 0;
  }
};

/** Sign an access token with a jti (used by the blocklist for targeted revocation). */
export const signAccessToken = (
  payload: { id: string; role: "admin" | "seller" | "user" | "staff" },
  expiresIn: string | number,
) =>
  jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string,
    { expiresIn: expiresIn as any },
  );

/** Sign a refresh token carrying a family generation so we can mass-revoke. */
export const signRefreshToken = async (
  payload: { id: string; role: "admin" | "seller" | "user" | "staff" },
  expiresIn: string | number,
) => {
  const gen = await getRefreshFamily(payload.role, payload.id);
  return jwt.sign(
    { ...payload, gen, jti: crypto.randomUUID() },
    ENV.REFRESH_TOKEN_JWT_SECRET_KEY as string,
    { expiresIn: expiresIn as any },
  );
};

export { hashToken };
