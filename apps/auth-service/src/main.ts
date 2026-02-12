import express from "express";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router.js";
import { connectRabbitMQ } from "@repo/libs";

const port = 6001;
const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API I am auth service" });
});

// IMPORTANT: This matches what your gateway expects
app.use("/api", router);

app.use(errorMiddleware);

// --- NEW STARTUP LOGIC ---
const startServer = async () => {
  try {
    // 1. Connect to dependencies FIRST
    console.log("Connecting to RabbitMQ...");
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    // 2. Start listening ONLY after dependencies are ready
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Auth server fully ready on 0.0.0.0:${port}`);
    });

    server.on("error", (err) => {
      console.error("Critical Server Error:", err);
    });
  } catch (error) {
    console.error("❌ Failed to start Auth Service:", error);
    process.exit(1); // Force container to restart if it fails
  }
};

startServer();
