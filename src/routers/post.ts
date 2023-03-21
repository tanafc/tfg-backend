require("dotenv").config();

import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Account } from "../models/account";

import { Commerce } from "../models/commerce";
import { isSecure } from "../utils/validateAccount";
import { comparePassword, hashPassword } from "../utils/hashPassword";

/**
 * Contains all the functionality to store items in the database
 */
export const postRouter = express.Router();

/**
 * Stores an account in the database
 */
postRouter.post("/signup", async (req, res) => {
  const filter = { username: req.body.username?.toString() };

  Account.findOne(filter)
    .then(async (account) => {
      if (account != null) {
        res.status(409).send({
          error: "The account name is already in use",
        });
      } else {
        let password = req.body.password?.toString();
        if (!isSecure(password)) {
          res.status(400).send({
            error:
              "A password with at least 8 characters, one uppercase and one lowercase is required",
          });
        } else {
          const hash = hashPassword(password);
          if (!hash) {
            res.status(500).send({ error: "Internal Server Error" });
          } else {
            const newAccount = new Account({
              username: req.body.username,
              email: req.body.email,
              password: hash,
              role: req.body.role,
            });
            newAccount
              .save()
              .then(() => {
                return res.status(201).send({
                  message: "Account successfully created",
                });
              })
              .catch((error) => {
                return res.status(400).send(error);
              });
          }
        }
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send();
    });
});

/**
 * Check if a user is registered and returns the token
 */
postRouter.post("/login", (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send({
      error: "An account name and password must be provided",
    });
  } else {
    const filter = { username: req.body.username?.toString() };
    Account.findOne(filter)
      .then(async (account) => {
        if (!account) {
          res.status(404).send({
            error: "No account found",
          });
        } else {
          const passwd = req.body.password.toString();
          if (!comparePassword(passwd, account.password)) {
            res.status(404).send({
              error: "Incorrect password",
            });
          } else {
            const accessToken = jwt.generateAccessToken(
              account.username,
              account.email
            );
            res.status(201).send({
              id: account._id,
              username: account.username,
              email: account.email,
              role: account.role,
              accessToken: accessToken,
            });
          }
        }
      })
      .catch(() => {
        res.status(500).send();
      });
  }
});

/**
 * Stores a new shop in the database
 */
postRouter.post("/shop", jwt.authenticateToken, (req, res) => {
  const newShop = new Commerce(req.body);
  newShop
    .save()
    .then(() => {
      res.status(201).send({
        message: "Shop sucessfully created",
      });
    })
    .catch(() => {
      res.status(500).send();
    });
});
