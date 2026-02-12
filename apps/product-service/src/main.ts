import express from "express";

import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes.js";

const port = 6002;

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

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
