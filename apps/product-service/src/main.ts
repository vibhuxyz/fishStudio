import express from "express";
import cors from "cors";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes.js";
import { ENV } from "@repo/env-config";

const port = 6002;

const app = express();

// Use the same dynamic CORS logic as Auth Service
const allowedOrigins = ENV.CORS_ORIGINS
  ? ENV.CORS_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API I am product services" });
});

app.use("/api", router);

app.use(errorMiddleware);

// Bind to 0.0.0.0 so the API Gateway can reach it inside Docker
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Product Service server is running on port ${port}`);
});

server.on("error", (err) => {
  console.log("Server error", err);
});
