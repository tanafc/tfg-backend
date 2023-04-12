import * as express from "express";
import mongoose from "mongoose";
import * as jwt from "../middleware/authJwt";
import { Account } from "../models/account";
import { Nutrients } from "../models/nutrients";
import { Product } from "../models/product";
import { Shop } from "../models/shop";
import { Update } from "../models/update";

export const productRouter = express.Router();

productRouter.get("/product", jwt.authenticateToken, async (req, res) => {
  const filter = req.query.barcode
    ? { barcode: req.query.barcode.toString() }
    : undefined;

  if (!filter) {
    res.status(404).send("A barcode for a product needs to be provided");
  }

  try {
    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).send();
    }

    await product.populate("nutrients", "-_id -__v -product");
    await product.populate("record", "price date shop");
    await Shop.populate(product, { path: "record.shop", select: "name" });

    return res.send(product);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.get("/product/:id", jwt.authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send();
    }

    await product.populate("nutrients", "-_id -__v -product");
    await product.populate("record", "price date shop");
    await Shop.populate(product, { path: "record.shop", select: "name" });

    return res.send(product);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.get("/products", jwt.authenticateToken, async (req, res) => {
  const filter = req.query.name
    ? { name: req.query.name.toString() }
    : undefined;

  if (!filter) {
    res.status(404).send("A name for products needs to be provided");
  }

  try {
    const products = await Product.find(
      { name: `/${filter}/i` },
      "barcode name brand image"
    );

    if (!products) {
      return res.status(404).send();
    }

    return res.send(products);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.post("/products", jwt.authenticateToken, async (req, res) => {
  const account = res.locals.auth;

  try {
    const shop = await Shop.findOne({ name: req.body.shop });

    if (!shop) {
      return res.status(404).send({ error: "Shop not found" });
    }

    const product = await Product.findOne({ barcode: req.body.barcode });

    if (product) {
      return res.status(409).send({
        error: `A product with barcode ${req.body.barcode} was already found`,
        product,
      });
    }

    const newProductId = new mongoose.Types.ObjectId();

    const newUpdate = new Update({
      price: req.body.price,
      date: Date.now(),
      product: newProductId,
      shop: shop,
      user: account,
    });

    const newNutrients = new Nutrients({
      product: newProductId,
      ...req.body.nutrients,
    });

    const newProduct = new Product({
      _id: newProductId,
      barcode: req.body.barcode,
      name: req.body.name,
      brand: req.body.brand,
      image: req.body.image,
      record: [newUpdate],
      shops: [shop],
      ingredients: req.body.ingredients,
      nutrients: newNutrients,
      beverage: req.body.beverage,
      nutriScore: req.body.nutriScore ?? "",
    });

    await Account.updateOne(
      { username: account.username },
      { $push: { products: newProduct._id } }
    );

    await Shop.updateOne(
      { name: shop.name },
      { $push: { products: newProduct._id } }
    );

    await newProduct.save();
    await newNutrients.save();
    await newUpdate.save();

    return res.status(201).send(newProduct);
  } catch (error) {
    return res.status(400).send(error);
  }
});
