require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

/**
 * Function to generate JWT tokens
 */
export function generateAccessToken(username: string, email: string, role: string) {
  return jwt.sign(
    {
      username: username,
      email: email,
      role: role
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "2h" }
  );
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
    );
    
    res.locals.auth = decoded;

    next();
  } catch (err) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

export default {
  authenticateToken,
  generateAccessToken,
};
