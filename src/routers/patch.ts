import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Account } from "../models/account";
import {
  isSecure,
  isValidEmail,
  isValidUsername,
} from "../utils/validateAccount";
import { comparePassword, hashPassword } from "../utils/hashPassword";

/**
 * Containts the functionality to patch items from the database
 */
export const patchRouter = express.Router();

patchRouter.patch("/account", jwt.authenticateToken, async (req, res) => {
  try {
    const username = req.body.username?.toString();
    const password = req.body.password?.toString();
    const email = req.body.email?.toString();
    const updates = req.body.updates ?? {};

    if (!(username && email && password)) {
      return res
        .status(404)
        .send({ error: "A username, email and password needs to be provided" });
    }

    const account = await Account.findOne({ username: username });

    if (!account) {
      return res
        .status(404)
        .send({ error: `No account was found by username: ${username}` });
    }

    if (!comparePassword(password, account.password)) {
      return res.status(401).send({ error: "Incorrect password" });
    }

    if (email !== account.email) {
      return res.status(404).send({ error: "Incorrect email" });
    }

    const allowedUpdates = ["username", "password", "email"];
    const actualUpdates = Object.keys(updates);
    const isValidUpdates = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdates) {
      return res.status(400).send({
        error:
          "Invalid update: username, email and password are the only changes allowed.",
      });
    }

    if (updates.username && !isValidUsername(updates.username.toString())) {
      return res.status(400).send({
        error: "Username not valid",
      });
    }

    if (updates.email && !isValidEmail(updates.email.toString())) {
      return res.status(400).send({
        error: "Email not valid",
      });
    }

    if (updates.password && !isSecure(updates.password.toString())) {
      return res.status(400).send({
        error:
          "A password with at least 8 characters, one uppercase and one lowercase is required",
      });
    }

    const updatesToApply = {
      username: updates.username ?? username,
      email: updates.email ?? email,
      ...(updates.password &&
        isSecure(updates.password) && {
          password: hashPassword(updates.password),
        }),
    };

    Account.findOneAndUpdate({ username: username }, updatesToApply, {
      new: true,
    }).then((account) => {
      if (account) {
        const accessToken = jwt.generateAccessToken(
          account.username,
          account.email
        );
        return res.status(200).send({
          username: account.username,
          email: account.email,
          role: account.role,
          accessToken: accessToken,
        });
      } else {
        return res.status(500).send({ error: "Internal Server Error" });
      }
    });
    return;
    
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});
