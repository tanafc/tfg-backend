require("dotenv").config();

import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Account } from "../models/account";

type TokenPayload = {
  username: string;
  iat?: number;
  exp?: number;
};

/**
 * Function to generate JWT tokens
 */
export function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "2h",
  });
}

/**
 * Function to verify JWT tokens
 */
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
    
    res.locals.auth = account;

    next();
  } catch (err) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

export default {
  authenticateToken,
  generateAccessToken,
};
