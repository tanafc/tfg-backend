import * as express from "express";
import mongoose from "mongoose";
import * as jwt from "../middleware/authJwt";
import { Nutrients } from "../models/nutrients";
import { Product } from "../models/product";
import { Shop } from "../models/shop";

export const productRouter = express.Router();

productRouter.get("/products", jwt.authenticateToken, async (req, res) => {
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

    return res.send(product);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.get("/products/:id", jwt.authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send();
    }

    await product.populate("nutrients", "-_id -__v -product");

    return res.send(product);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.get("/products-all", jwt.authenticateToken, async (req, res) => {
  const filter = req.query.name ?? undefined;

  if (!filter) {
    res.status(404).send("A name for products needs to be provided");
  }

  try {
    const products = await Product.find(
      { name: { $regex: filter, $options: "i" } },
      "barcode name brand image"
    );

    return res.send(products);
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.post("/products", jwt.authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.body.barcode });

    if (product) {
      return res.status(409).send({
        error: `A product with barcode ${req.body.barcode} was already found`,
        product,
      });
    }

    const newProductId = new mongoose.Types.ObjectId();

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
      ingredients: req.body.ingredients,
      nutrients: newNutrients,
      beverage: req.body.beverage,
      nutriScore: req.body.nutriScore ?? "",
    });

    await newProduct.save();
    await newNutrients.save();

    await newProduct.populate("nutrients", "-_id -__v -product");

    return res.status(201).send(newProduct);
  } catch (error) {
    return res.status(400).send(error);
  }
});

// productRouter.post(
//   "/products/prices",
//   jwt.authenticateToken,
//   async (req, res) => {
//     const user = res.locals.auth;

//     const filterProduct = { barcode: req.body.barcode };
//     const filterShop = { name: req.body.shop };

//     if (!(filterProduct.barcode && filterShop.name)) {
//       return res
//         .status(400)
//         .send({ error: "A product and shop needs to be provided" });
//     }

//     try {
//       const product = await Product.findOne(filterProduct);
//       const shop = await Shop.findOne(filterShop);

//       if (!(product && shop)) {
//         return res.status(404).send();
//       }

//       const newUpdate = new Update({
//         price: req.body.price,
//         product: product._id,
//         shop: shop._id,
//         user: user._id,
//       });

//       product.record.push(newUpdate._id);

//       if (!user.products.includes(product._id)) {
//         user.products.push(product._id);
//       }

//       if (!shop.products.includes(product._id)) {
//         shop.products.push(product._id);
//       }

//       newUpdate.save();
//       product.save();
//       shop.save();
//       user.save();

//       return res.status(201).send({
//         _id: newUpdate._id,
//         price: newUpdate.price,
//         date: newUpdate.date,
//         product: product.barcode,
//         shop: shop.name,
//         user: user.username,
//       });
//     } catch (error) {
//       return res.status(400).send(error);
//     }
//   }
// );

productRouter.delete("/products", jwt.authenticateToken, async (req, res) => {
  const user = res.locals.auth;

  if (user.role !== "admin") {
    return res.status(401).send();
  }

  if (!req.query.barcode) {
    return res.status(400).send({
      error: "A barcode needs to be provided",
    });
  }

  try {
    const product = await Product.findOneAndDelete({
      barcode: req.query.barcode,
    });

    if (!product) {
      return res.status(404).send();
    }

    await Nutrients.findByIdAndDelete(product.nutrients);

    await Shop.updateMany(
      { products: product._id },
      { $pull: { products: product._id } }
    );

    return res.send(product);
  } catch (error) {
    return res.status(400).send();
  }
});
