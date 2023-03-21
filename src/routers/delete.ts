import * as express from "express";
import * as jwt from "../middleware/authJwt";
import * as bcryptjs from "bcryptjs";
import { Account } from "../models/account";
// import { Commerce } from '../models/commerce';
// import { Product } from '../models/product';

/**
 * Containts the functionality to delete items from the database
 */
export const deleteRouter = express.Router();

deleteRouter.delete("/account", jwt.authenticateToken, async (req, res) => {
  try {
    const username = req.body.username?.toString();
    const password = req.body.password?.toString();
    const email = req.body.email?.toString();

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

    const comparison = await bcryptjs.compare(password, account.password);

    if (!comparison) {
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
