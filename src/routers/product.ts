import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Product } from "../models/product";

export const productRouter = express.Router();

productRouter.get("/product", jwt.authenticateToken, (req, res) => {
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
