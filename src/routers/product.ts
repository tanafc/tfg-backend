import * as express from "express";
import mongoose from "mongoose";
import { authenticateToken } from "../middleware/authJwt";
import { authenticateRole } from "../middleware/authRole";
import { Nutrients } from "../models/nutrients";
import { Product } from "../models/product";
import { Receipt } from "../models/receipt";
import { Shop } from "../models/shop";
import ROLE from "../models/role";

export const productRouter = express.Router();

productRouter.get("/products", authenticateToken, async (req, res) => {
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

productRouter.get("/products/:id", authenticateToken, async (req, res) => {
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

productRouter.get("/products-all", authenticateToken, async (req, res) => {
  const filter = req.query.name?.toString() ?? undefined;

  if (!filter) {
    return res
      .status(404)
      .send({ error: "A name for products needs to be provided" });
  }

  try {
    const products = await Product.find(
      { name: { $regex: filter, $options: "i" } },
      "barcode name brand image"
    );

    return res.send({ products });
  } catch (error) {
    return res.status(500).send();
  }
});

productRouter.post("/products", authenticateToken, async (req, res) => {
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

productRouter.delete(
  "/products",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
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

      await Receipt.deleteMany({ product: product._id });

      await Shop.updateMany(
        { products: product._id },
        { $pull: { products: product._id } }
      );

      return res.send(product);
    } catch (error) {
      return res.status(400).send();
    }
  }
);

productRouter.patch(
  "/products",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
    if (!req.query.barcode) {
      return res.status(400).send({
        error: "A barcode needs to be provided",
      });
    }

    const updates = req.body.updates ?? {};
    const allowedUpdates = [
      "name",
      "brand",
      "image",
      "ingredients",
      "nutrients",
      "beverage",
      "nutriScore",
    ];
    const actualUpdates = Object.keys(updates);

    if (actualUpdates.length === 0) {
      return res.status(400).send({
        error: "No updates were found.",
      });
    }

    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).send({
        error:
          "Invalid update: name, brand, image, ingredients, nutrients, beverage and nutriScore are the only changes allowed.",
      });
    }

    try {
      const product = await Product.findOne({
        barcode: req.query.barcode.toString(),
      });

      if (!product) {
        return res.status(404).send();
      }

      const { nutrients, ...restUpdates } = updates;

      if (nutrients) {
        await Nutrients.findByIdAndUpdate(
          product.nutrients,
          {
            ...nutrients,
            product: product._id,
            _id: product.nutrients,
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { barcode: req.query.barcode.toString() },
        restUpdates,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.send(updatedProduct);
    } catch (error) {
      return res.status(400).send();
    }
  }
);
