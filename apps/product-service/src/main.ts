import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import "./jobs/product.cron.jobs.js"
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes.js";
import { ENV } from "@repo/env-config";
import { initMeilisearchIndex } from "./lib/meilisearch.js";

const port = Number(ENV.PRODUCT_SERVICE_PORT) || 6002;

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(compression() as any);
// 20MB allows base64-encoded images (~15MB raw image → ~20MB base64)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use(cookieParser());
app.set("trust proxy", 1);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
}));

app.get("/", (req, res) => {
  res.send({ message: "Hello API I am product services" });
});

app.use("/api", router);

app.use(errorMiddleware);

// Bind to 0.0.0.0 so the API Gateway can reach it inside Docker
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Product Service server is running on port ${port}`);
  initMeilisearchIndex();
});

server.on("error", (err) => {
  console.log("Server error", err);
});
