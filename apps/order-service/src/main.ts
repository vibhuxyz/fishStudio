import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { errorMiddleware } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import router from "./routes/order.route.js";

const app = express();
app.use(
  cors({
    origin: ENV.CORS_ORIGINS
      ? ENV.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type", "x-auth-role", "ngrok-skip-browser-warning"],
    credentials: true,
  }),
);

// Webhook route removed

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
