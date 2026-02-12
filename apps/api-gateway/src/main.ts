import express from "express";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import initalizeConfig from "./libs/initializeSiteConfig.js";
import { ENV } from "@repo/env-config";

const app = express();

const allowedOrigins = ENV.CORS_ORIGINS
  ? ENV.CORS_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

const authUrl = ENV.AUTH_SERVICE_URL || "http://localhost:6001";
const productUrl = ENV.PRODUCT_SERVICE_URL || "http://localhost:6002";

app.use("/auth", proxy(authUrl));
app.use("/product", proxy(productUrl));

const port = Number(ENV.PORT) || 8080;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Gateway running on port ${port}`);
  try {
    initalizeConfig();
    console.log("Site Config Initialized");
  } catch (error) {
    console.log("Error initializing site config", error);
  }
});

server.on("error", console.error);
