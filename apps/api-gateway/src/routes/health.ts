import { Router } from "express";
import { ENV } from "@repo/env-config";

export const healthRouter: Router = Router();

healthRouter.get("/gateway-health", (_req, res) => {
  res.json({ message: "API Gateway is healthy", env: ENV.NODE_ENV });
});
