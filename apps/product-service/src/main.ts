import express from "express";
import cors from "cors";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes.js";

const port =  6002;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API i am product services" });
});

app.use("/api", router);

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(
    `Product Service server is running at http://localhost:${port}/api`,
  );
});

server.on("error", (err) => {
  console.log("Server error", err);
});
