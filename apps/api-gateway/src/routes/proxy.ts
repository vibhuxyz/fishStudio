import { Router } from "express";
import proxy from "express-http-proxy";
import { isProduction, upstreamServices } from "../config/env.js";
import { authRateLimiter, paymentRateLimiter } from "../middleware/rate-limiter.js";

const proxyOptions: proxy.ProxyOptions = {
  parseReqBody: false,
  proxyReqPathResolver: (req) => req.url,
  userResHeaderDecorator: (headers, _userReq, userRes, _proxyReq, proxyRes) => {
    // Forward Set-Cookie headers without merging (prevents cookie loss)
    if (proxyRes.headers["set-cookie"]) {
      userRes.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
    }
    // Add HSTS on every response in production (belt-and-suspenders)
    if (isProduction) {
      headers["strict-transport-security"] =
        "max-age=31536000; includeSubDomains; preload";
    }
    return headers;
  },
  proxyErrorHandler: (err, res, _next) => {
    console.error("[Gateway] Upstream proxy error:", err?.message || err);
    if (res.headersSent) return;
    res.status(502).json({
      success: false,
      message: "Service temporarily unavailable. Please try again.",
    });
  },
};

export const proxyRouter: Router = Router();

// NOTE: The Razorpay webhook sends a raw body that must not be re-parsed.
// parseReqBody is false above so every proxy route streams the raw body
// through as-is.
proxyRouter.use("/auth", authRateLimiter, proxy(upstreamServices.auth, proxyOptions));
proxyRouter.use("/product", proxy(upstreamServices.product, proxyOptions));
proxyRouter.use("/order", proxy(upstreamServices.order, proxyOptions));
proxyRouter.use(
  "/notification",
  proxy(upstreamServices.notification, proxyOptions),
);
proxyRouter.use(
  "/payment",
  paymentRateLimiter,
  proxy(upstreamServices.payment, proxyOptions),
);
