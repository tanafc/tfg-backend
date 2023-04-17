import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Account } from "../models/account";

dotenv.config();

type TokenPayload = {
  username: string;
  iat?: number;
  exp?: number;
};

export function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "2h",
  });
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as jwt.Secret
    ) as TokenPayload;

    const account = await Account.findOne({ username: decoded.username });

    if (!account) {
      throw new Error();
    }

    req.user = account;

    next();
  } catch (err) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

export default {
  authenticateToken,
  generateAccessToken,
};
