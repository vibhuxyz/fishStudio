import express from "express";
import cors from "cors";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router.js";
import { connectRabbitMQ } from "@repo/libs";

const port = 6001;

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
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

const server = app.listen(port, async () => {
  await connectRabbitMQ();

  console.log(`Auth server is running at http://localhost:${port}/api`);
});

server.on("error", (err) => {
  console.log("Server error", err);
});
