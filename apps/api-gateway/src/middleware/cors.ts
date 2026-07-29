import cors from "cors";
import { allowedOrigins } from "../config/env.js";

// Built once at startup rather than per-request — the previous version
// constructed a new cors() middleware instance on every single request,
// which is wasteful and non-idiomatic. The `cors` package supports a
// dynamic origin callback natively, so one instance is enough.
export const corsMiddleware = cors({
  credentials: true,
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "x-auth-role",
    "x-idempotency-key",
    "x-razorpay-signature",
    "ngrok-skip-browser-warning",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  maxAge: 86400, // Cache preflight requests for 24 hours
  origin: (requestOrigin, callback) => {
    callback(null, Boolean(requestOrigin && allowedOrigins.includes(requestOrigin)));
  },
});
