import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Product } from "../models/product";
import { Update } from "../models/update";
import { Shop } from "../models/shop";
import { Nutrients } from "../models/nutrients";
import { Account } from "../models/account";

export const productRouter = express.Router();

productRouter.get("/products", jwt.authenticateToken, async (req, res) => {
  const filter = req.query.barcode
    ? { name: req.query.barcode.toString() }
    : undefined;

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
    console.log(products);

    if (!products) {
      return res.status(404).send();
    }

    return res.send(products);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.get("/products/:id", jwt.authenticateToken, async (req, res) => {
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

productRouter.post("/products", jwt.authenticateToken, async (req, res) => {
  const account = res.locals.auth;

  try {
    const shop = Shop.findOne({ name: req.body.shop });

    if (!shop) {
      return res.status(404).send({ error: "Shop not found" });
    }

    const update = new Update({
      price: req.body.price,
      date: Date.now(),
      shop: shop,
      user: account,
    });

    const nutrients = new Nutrients(req.body.nutrients);

    const newProduct = new Product({
      barcode: req.body.barcode,
      name: req.body.name,
      brand: req.body.brand,
      image: req.body.image,
      record: [update],
      shops: [shop],
      ingredients: req.body.ingredients,
      nutrients: nutrients,
      beverage: req.body.beverage,
      nutriScore: req.body.nutriScore ?? "",
    });

    Account.updateOne(account, { $push: { products: newProduct._id } });
    Shop.updateOne(shop, { $push: { products: newProduct._id } });

    await newProduct.save();
    await nutrients.save();

    return res.status(201).send(newProduct);
  } catch (error) {
    return res.status(400).send(error);
  }
});
