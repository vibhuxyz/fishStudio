import express from "express";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import initalizeConfig from "./libs/initializeSiteConfig.js";
import { ENV } from "@repo/env-config";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// API rate limit

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => ipKeyGenerator(req),
});

app.use(limiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

app.use("/auth", proxy("http://localhost:6001"));
app.use("/product", proxy("http://localhost:6002"));

const port = ENV.PORT;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);

  try {
    initalizeConfig();
    console.log("Site Config Initialized successfully");
  } catch (error) {
    console.log("Error initializing site config", error);
  }
});

server.on("error", console.error);
