import express from "express";
import cors from "cors";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router.js";
import { connectRabbitMQ } from "@repo/libs";
import { ENV } from "@repo/env-config";

const port = 6001;

const app = express();

app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ENV.CORS_ORIGINS
  ? ENV.CORS_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or internal docker calls)
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
  res.send({ message: "Hello API i am auth services" });
});

app.use("/api", router);

app.use(errorMiddleware);

const server = app.listen(port, "0.0.0.0", async () => {
  await connectRabbitMQ();
  // Change localhost to 0.0.0.0 or just a generic message
  console.log(`Auth server is running on port ${port}`);
});

server.on("error", (err) => {
  console.log("Server error", err);
});
