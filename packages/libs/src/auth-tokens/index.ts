import crypto from "node:crypto";
import { redis } from "../redis/index.js";

/**
 * Server-side token blocklist, shared by every process that accepts a JWT.
 *
 * It lives here rather than in @repo/middlewares because worker-service
 * authenticates WebSocket upgrades without going through Express at all, and a
 * second copy of this check is exactly the kind of thing that drifts: a token
 * revoked for HTTP but still good for a socket is a silent hole.
 */

// Fix #13: hash the token before using it as a Redis key so that a Redis
// read-leak does not directly expose valid JWTs.
export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Fix #14: explicit server-side revocation. Logout writes a blocklist entry
// keyed by token hash (optionally jti) so stolen tokens become unusable
// immediately rather than waiting for natural JWT expiry.
export const isTokenRevoked = async (token: string, jti?: string): Promise<boolean> => {
  try {
    const [byHash, byJti] = await Promise.all([
      redis.exists(`auth:revoked:${hashToken(token)}`),
      jti ? redis.exists(`auth:revoked:jti:${jti}`) : Promise.resolve(0),
    ]);
    return byHash > 0 || byJti > 0;
  } catch {
    // If Redis is unreachable, don't block valid tokens. The blocklist is a
    // belt-and-suspenders layer on top of short-lived JWTs.
    return false;
  }
};

/**
 * The blocklist keys for a token, for callers that want to fold this check
 * into a pipeline they are already issuing.
 *
 * `isTokenRevoked` above costs a Redis round trip of its own. On the
 * authentication hot path that round trip is pure overhead, because the caller
 * is about to make one anyway — and against a managed Redis it is a full
 * network hop per request, on every request, in every service. Exposing the
 * keys lets `isAuthenticated` read the session cache and the blocklist in a
 * single pipeline instead of two sequential calls, while keeping the key
 * naming in one place so the two can't drift apart.
 */
export const revocationKeys = (token: string, jti?: string): string[] => {
  const keys = [`auth:revoked:${hashToken(token)}`];
  if (jti) keys.push(`auth:revoked:jti:${jti}`);
  return keys;
};

/** Interprets the EXISTS replies produced for `revocationKeys`. */
export const isRevokedFromExists = (replies: Array<number | null>): boolean =>
  replies.some((n) => (n ?? 0) > 0);
