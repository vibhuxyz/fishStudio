import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "@repo/env-config";
import { errorMiddleware } from "@repo/error-handlers";
import { connectRabbitMQ } from "@repo/libs";
import notificationRouter from "./routes/notification.router.js";
import { startNotificationConsumer } from "./consumers/notification.consumer.js";

const app = express();
const port = Number(ENV.NOTIFICATION_SERVICE_PORT) || 6005;

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
    origin: "*", // Adjust as needed
    credentials: true
}));

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Notification Service is running" });
});

app.use("/api/notifications", notificationRouter);

// Error handling
app.use(errorMiddleware);

// Start server
const start = async () => {
    try {
        await connectRabbitMQ();
        console.log("✅ Connected to RabbitMQ");

        await startNotificationConsumer();
        console.log("✅ Notification Consumer started");

        app.listen(port, () => {
            console.log(`🚀 Notification Service listening on port ${port}`);
        });
    } catch (error) {
        console.error("❌ Service failed to start:", error);
        process.exit(1);
    }
};

start();
