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
