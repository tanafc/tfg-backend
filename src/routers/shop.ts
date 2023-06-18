import * as express from "express";
import mongoose, { Types } from "mongoose";
import { authenticateToken } from "../middleware/authJwt";
import { authenticateRole } from "../middleware/authRole";
import { Location } from "../models/location";
import { Product } from "../models/product";
import { Receipt } from "../models/receipt";
import { Shop } from "../models/shop";
import ROLE from "../models/role";

export const shopRouter = express.Router();

shopRouter.get("/shops", authenticateToken, async (req, res) => {
  const filter = req.query.name
    ? { name: req.query.name.toString() }
    : undefined;

  if (!filter) {
    return res.status(400).send({
      error: "A name for a shop needs to be provided",
    });
  }

  try {
    const shop = await Shop.findOne(filter);

    if (!shop) {
      return res.status(404).send();
    }

    await shop.populate("products", "-_id name barcode brand");
    await shop.populate("location", "-shop");

    return res.send(shop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.get("/shops/:id", authenticateToken, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).send();
    }

    await shop.populate("products", "-_id name barcode brand");
    await shop.populate("location", "-shop");

    return res.send(shop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.get("/shops-all", authenticateToken, async (req, res) => {
  const filter = req.query.name?.toString() ?? '';

  try {
    const shops = await Shop.find(
      { name: { $regex: filter, $options: "i" } },
      "name location"
    );

    return res.send({ shops: shops });
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.post("/shops", authenticateToken, async (req, res) => {
  const filter = req.body.name ? { name: req.body.name.toString() } : undefined;

  if (!filter) {
    return res.status(400).send({
      error: "A name for a shop needs to be provided.",
    });
  }

  try {
    const shop = await Shop.findOne(filter);

    if (shop) {
      return res.status(409).send({
        error: `The supermarket ${shop.name} already exists.`,
      });
    }

    const newShopId = new mongoose.Types.ObjectId();

    const newLocation = new Location({
      ...req.body.location,
      shop: newShopId,
    });

    const newShop = new Shop({
      _id: newShopId,
      name: req.body.name,
      location: newLocation._id,
    });

    await newLocation.save();
    await newShop.save();

    return res.status(201).send(newShop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.post("/shops/products", authenticateToken, async (req, res) => {
  const user = req.user;

  const filterShop = req.query.name
    ? { name: req.query.name.toString() }
    : undefined;

  const filterProduct = req.body.barcode
    ? { barcode: req.body.barcode.toString() }
    : undefined;

  if (!(filterShop && filterProduct && req.body.price)) {
    return res.status(400).send({
      error: "A shop, barcode of a product, and price needs to be provided.",
    });
  }

  try {
    const shop = await Shop.findOne(filterShop);
    const product = await Product.findOne(filterProduct);

    if (!(shop && product)) {
      return res.status(404).send();
    }

    if (!shop.products.includes(product._id)) {
      shop.products.push(product._id);
    }

    const receipt = new Receipt({
      price: req.body.price,
      product: product._id,
      shop: shop._id,
      user: user._id,
      date: Date.now()
    });

    await receipt.save();
    await shop.save();

    return res.status(201).send(shop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.delete(
  "/shops",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
    if (!req.query.name) {
      return res.status(400).send({
        error: "A name needs to be provided",
      });
    }

    try {
      const shop = await Shop.findOneAndDelete({
        name: req.query.name.toString(),
      });

      if (!shop) {
        return res.status(404).send();
      }

      await Location.findByIdAndDelete(shop.location);
      await Receipt.deleteMany({ shop: shop._id });

      return res.send(shop);
    } catch (error) {
      return res.status(400).send();
    }
  }
);

shopRouter.delete(
  "/shops/products",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
    const filter = req.query.name
      ? { name: req.query.name.toString() }
      : undefined;

    if (!filter) {
      return res.status(400).send({
        error: "A name for a shop needs to be provided",
      });
    }

    if (!req.body.products) {
      return res.status(400).send({
        error: "Barcodes of products needs to be provided",
      });
    }

    try {
      const barcodes = req.body.products;

      const products = await Product.find({ barcode: { $in: barcodes } });

      const productsIds = products.map((product) => product._id);

      const shop = await Shop.findOneAndUpdate(filter, {
        $pullAll: { products: productsIds },
      });

      if (!shop) {
        return res.status(404).send();
      }

      await Receipt.deleteMany({
        product: { $in: productsIds },
        shop: shop._id,
      });

      return res.send(shop);
    } catch (error) {
      return res.status(400).send();
    }
  }
);

shopRouter.patch(
  "/shops",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
    if (!req.query.name) {
      return res.status(400).send({
        error: "A name needs to be provided",
      });
    }

    const updates = req.body.updates ?? {};
    const allowedUpdates = ["name"];
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
        error: "Update is not permitted",
      });
    }

    try {
      const shop = await Shop.findOneAndUpdate(
        { name: req.query.name.toString() },
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!shop) {
        return res.status(404).send();
      }

      return res.send(shop);
    } catch (error) {
      return res.status(400).send();
    }
  }
);
