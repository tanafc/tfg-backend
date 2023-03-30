import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Product } from "../models/product";

export const productRouter = express.Router();

productRouter.get("/product", jwt.authenticateToken, async (req, res) => {
  const filter = req.query.barcode
    ? { name: req.query.barcode.toString() }
    : {};

  if (!filter) {
    res.status(404).send("A barcode for a product needs to be provided");
  }

  try {
    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).send();
    }

    return res.send(product);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.get("/product/:id", jwt.authenticateToken, async (req, res) => {
  const _id = req.params._id;

  try {
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).send();
    }

    return res.send(product);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.post("/product", jwt.authenticateToken, async (req, res) => {
  try {
    const newProduct = new Product(req.body);

    await newProduct.save();

    res.status(201).send(newProduct);
  } catch (error) {
    res.status(400).send(error);
  }
});
