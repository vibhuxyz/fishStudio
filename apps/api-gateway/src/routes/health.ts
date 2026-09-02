import { Router } from "express";
import { ENV } from "@repo/env-config";
import { buildHealthHandler } from "@repo/observability";

export const healthRouter: Router = Router();

healthRouter.get("/gateway-health", (_req, res) => {
  res.json({ message: "API Gateway is healthy", env: ENV.NODE_ENV });
});

// No dependency checks: the gateway owns no data store, and probing all five
// upstreams on every poll would turn one health check into five.
healthRouter.get("/internal/health", buildHealthHandler({ service: "api-gateway" }));
