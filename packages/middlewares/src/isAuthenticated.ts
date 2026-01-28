import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.path.includes("seller")) {
      token = req.cookies["seller_access_token"];
    } else if (req.path.includes("user")) {
      token = req.cookies["access_token"];
    } else {
      // fallback: use whichever exists
      token =
        req.cookies["seller_access_token"] ||
        req.cookies["access_token"] ||
        req.headers.authorization?.split(" ")[1];
    }
    if (!token) {
      return res.status(404).json({
        message: "Unauthorized! Token missing.",
      });
    }
    // verify it
    const decode = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_JWT_SECRET_KEY as string,
    ) as {
      id: string;
      role: "user" | "seller";
    };
    if (!decode) {
      return res.status(401).json({
        message: "Anauthorized! Invalid token",
      });
    }
    let account;

    if (decode.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decode.id },
      });
      req.user = account;
    } else if (decode.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decode.id },
        include: { store: true },
      });
      req.seller = account;
    }

    if (!account) {
      return res.status(401).json({
        message: "Account not found!",
      });
    }
    req.role = decode.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Anauthorized! Invalid token or expired",
    });
  }
};

export default isAuthenticated;
