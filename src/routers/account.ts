import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Account } from "../models/account";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import { isSecure } from "../utils/validateAccount";

export const accountRouter = express.Router();

accountRouter.get("/account", jwt.authenticateToken, async (_, res) => {
  const account = res.locals.auth

  try {
    return res.send({
      username: account.username,
      email: account.email,
      role: account.role,
      receipts: account.receipts,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

// accountRouter.get("/account", jwt.authenticateToken, async (req, res) => {
//   const filter = req.query.username
//     ? { username: req.query.username.toString() }
//     : undefined;

//   if (!filter) {
//     return res.status(400).send({
//       error: "An account name needs to be provided",
//     });
//   }

//   try {
//     const account = await Account.findOne(filter);

//     if (!account) {
//       return res.status(400).send();
//     }

//     return res.send({
//       username: account.username,
//       email: account.email,
//       role: account.role,
//       products: account.products,
//     });
//   } catch (error) {
//     return res.status(400).send(error);
//   }
// });

// accountRouter.get("/account/:id", jwt.authenticateToken, async (req, res) => {
//   try {
//     const account = await Account.findById(req.params.id);

//     if (!account) {
//       return res.status(404).send();
//     }

//     return res.send({
//       username: account.username,
//       email: account.email,
//       role: account.role,
//       products: account.products,
//     });
//   } catch (error) {
//     return res.status(400).send(error);
//   }
// });

accountRouter.post("/signup", async (req, res) => {
  const filter = req.body.username
    ? { username: req.body.username?.toString() }
    : undefined;

  if (!filter) {
    return res.status(400).send({
      error: "An account name needs to be provided",
    });
  }

  const account = await Account.findOne(filter);

  if (account) {
    return res.status(409).send({
      error: "The account name is already in use",
    });
  }

  try {
    let password = req.body.password ? req.body.password.toString() : "";
    if (!isSecure(password)) {
      return res.status(400).send({
        error:
          "A password with at least 8 characters, one uppercase and one lowercase is required",
      });
    }

    const hash = hashPassword(password);
    if (!hash) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    const newAccount = new Account({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      role: req.body.role,
    });

    await newAccount.save();

    return res.status(201).send();
  } catch (error) {
    return res.status(400).send();
  }
});

accountRouter.post("/login", async (req, res) => {
  const filter = req.body.username
    ? { username: req.body.username?.toString() }
    : undefined;

  if (!filter) {
    return res.status(400).send({
      error: "An account name needs to be provided",
    });
  }

  try {
    const account = await Account.findOne(filter);

    if (!account) {
      return res.status(404).send();
    }

    const passwd = req.body.password ? req.body.password.toString() : "";

    if (!comparePassword(passwd, account.password)) {
      return res.status(400).send({
        error: "Incorrect password",
      });
    }

    const accessToken = jwt.generateAccessToken({
      username: account.username,
    });

    return res.status(201).send({
      id: account._id,
      username: account.username,
      email: account.email,
      role: account.role,
      accessToken: accessToken,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

accountRouter.patch("/account", jwt.authenticateToken, async (req, res) => {
  try {
    const updates = req.body.updates ?? {};

    const account = res.locals.auth;

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

    if (updates.password && !isSecure(updates.password.toString())) {
      return res.status(400).send({
        error:
          "A password with at least 8 characters, one uppercase and one lowercase is required",
      });
    }

    const updatesToApply = {
      username: updates.username ?? account.username,
      email: updates.email ?? account.email,
      ...(updates.password && {
        password: hashPassword(updates.password),
      }),
    };

    const updatedAccount = await Account.findOneAndUpdate(
      { username: account.username },
      updatesToApply,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAccount) {
      return res.status(500).send();
    }

    const accessToken = jwt.generateAccessToken({
      username: updatedAccount.username,
    });

    return res.status(200).send({
      username: updatedAccount.username,
      email: updatedAccount.email,
      role: updatedAccount.role,
      accessToken: accessToken,
    });
  } catch (err) {
    return res.status(400).send(err);
  }
});

accountRouter.delete("/account", jwt.authenticateToken, async (req, res) => {
  try {
    const password: string | undefined = req.body.password?.toString();

    const account = res.locals.auth;

    if (!password) {
      return res.status(401).send({ error: "A password needs to be provided" });
    }

    if (!comparePassword(password, account.password)) {
      return res.status(401).send({ error: "Incorrect password" });
    }

    const deletedAccount = await Account.findOneAndDelete({
      username: account.username,
    });

    if (!deletedAccount) {
      return res.status(500).send();
    }

    return res.status(200).send({
      username: account.username,
      email: account.email,
      role: account.role,
      message: "Account successfully deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err });
  }
});
