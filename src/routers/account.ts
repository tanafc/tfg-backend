import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Account } from "../models/account";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import {
  isSecure,
  isValidEmail,
  isValidUsername,
} from "../utils/validateAccount";

export const accountRouter = express.Router();

accountRouter.get("/account", jwt.authenticateToken, (req, res) => {
  const filter = req.query.username
    ? { username: req.query.username.toString() }
    : undefined;
  if (!filter) {
    res.status(404).send("An account name needs to be provided");
  } else {
    Account.findOne(filter)
      .then((account) => {
        if (account === null) {
          res.status(404).send("No account found");
        } else {
          res.send({
            username: account.username,
            email: account.email,
            role: account.role,
            products: account.products,
          });
        }
      })
      .catch(() => {
        res.status(500).send();
      });
  }
});

accountRouter.get("/account/:id", jwt.authenticateToken, (req, res) => {
  Account.findById(req.params.id)
    .then((account) => {
      if (!account) {
        res.status(404).send("No account was found");
      } else {
        res.send({
          username: account.username,
          email: account.email,
          role: account.role,
          products: account.products,
        });
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});

accountRouter.post("/signup", async (req, res) => {
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

accountRouter.post("/login", (req, res) => {
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

accountRouter.patch("/account", jwt.authenticateToken, async (req, res) => {
  try {
    const username: string | undefined = req.body.username?.toString();
    const password: string | undefined = req.body.password?.toString();
    const email: string | undefined = req.body.email?.toString();
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

accountRouter.delete("/account", jwt.authenticateToken, async (req, res) => {
  try {
    const username: string | undefined = req.body.username?.toString();
    const password: string | undefined = req.body.password?.toString();
    const email: string | undefined = req.body.email?.toString();

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

    Account.deleteOne({ username: username }).then(() => {
      return res.status(200).send("Account successfully deleted");
    });

    return;
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});