import { NextFunction, Request, Response } from "express";
import ROLE from "../models/role";

export const authenticateRole = (role: ROLE) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      res.status(401).send({ error: "Role not valid" });
    } else {
      next();
    }
  };
};
