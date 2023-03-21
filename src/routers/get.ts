import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Account } from "../models/account";
import { Commerce } from "../models/commerce";
import { Product } from "../models/product";

/**
 * Containts the functionality to get items from the database
 */
export const getRouter = express.Router();

/**
 * Gets all the info from an account by its account name
 */
getRouter.get("/account", jwt.authenticateToken, (req, res) => {
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

/**
 * Gets all the info from an account by its id
 */
getRouter.get("/account/:id", jwt.authenticateToken, (req, res) => {
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

/**
 * Gets the information of a line of commerces by its name
 */
getRouter.get("/shop", jwt.authenticateToken, (req, res) => {
  const filter = req.query.name
    ? { name: req.query.name.toString() }
    : undefined;
  if (!filter) {
    res.status(404).send("A name for a commerce needs to be provided");
  } else {
    Commerce.find(filter)
      .then(async (shops) => {
        if (shops.length === 0) {
          res.status(404).send({
            error: "No shop was found",
          });
        } else {
          res.send(shops);
        }
      })
      .catch(() => {
        res.status(500).send();
      });
  }
});

/**
 * Gets the information of a line of commerces by its id
 */
getRouter.get("/shop/:id", jwt.authenticateToken, (req, res) => {
  Commerce.findById(req.params.id)
    .then((shop) => {
      if (!shop) {
        res.status(404).send({
          error: "No shop was found",
        });
      } else {
        res.send(shop);
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});

/**
 * Gets the information of a product by its barcode
 */
getRouter.get("/product", jwt.authenticateToken, (req, res) => {
  const filter = req.query.barcode
    ? { name: req.query.barcode.toString() }
    : undefined;
  if (!filter) {
    res.status(404).send("A barcode for a product needs to be provided");
  }
  Product.findOne(filter)
    .then(async (product) => {
      if (!product) {
        res.status(404).send({
          error: "Product not found",
        });
      } else {
        res.send(product);
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});
