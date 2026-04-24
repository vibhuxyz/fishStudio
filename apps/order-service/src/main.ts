import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { errorMiddleware } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import router from "./routes/order.route.js";

const app = express();
// Fix #21: trust gateway's X-Forwarded-* so req.ip is the real client IP.
app.set("trust proxy", 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(compression() as any);
app.use(
  cors({
    origin: ENV.CORS_ORIGINS
      ? ENV.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type", "x-auth-role", "ngrok-skip-browser-warning"],
    credentials: true,
  }),
);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

// Routes
app.use("/api", router);

app.use(errorMiddleware);

const port = Number(ENV.ORDER_SERVICE_PORT) || 6004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
