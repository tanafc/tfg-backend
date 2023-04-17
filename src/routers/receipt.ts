import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Receipt } from "../models/receipt";
import { Shop } from "../models/shop";
import { Product } from "../models/product";

export const receiptRouter = express.Router();

receiptRouter.get("/receipts/:id", jwt.authenticateToken, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).send();
    }

    await receipt.populate("shop", "name");
    await receipt.populate("product", "name barcode");

    return res.send(receipt);
  } catch (error) {
    return res.status(400).send();
  }
});

receiptRouter.get("/receipts", jwt.authenticateToken, async (req, res) => {
  const filterShops = req.query.shop ? { name: req.query.shop.toString() } : {};

  const filterProducts = req.query.product
    ? { barcode: req.query.product.toString() }
    : {};

  const filterDate =
    req.query.sdate && req.query.edate
      ? { date: { $gte: req.query.sdate, $lte: req.query.edate } }
      : {};

  const filterPrice =
    req.query.minprice && req.query.maxprice
      ? { price: { $gte: req.query.minprice, $lte: req.query.maxprice } }
      : {};

  const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
  
  const skip = req.query.skip ? parseInt(req.query.skip.toString()) : 0;

  try {
    const shop = await Shop.findOne(filterShops);
    const product = await Product.findOne(filterProducts);

    const searchShop = req.query.shop ? { shop: shop?._id } : {};
    const searchProduct = req.query.product ? { product: product?._id } : {};

    const receipts = await Receipt.find(
      {
        ...searchShop,
        ...searchProduct,
        ...filterDate,
        ...filterPrice,
      },
      "-__v -user"
    )
      .sort("-date")
      .limit(limit)
      .skip(skip)
      .populate("shop", "name")
      .populate("product", "name barcode");

    return res.send({ receipts });
  } catch (error) {
    return res.status(400).send();
  }
});

receiptRouter.delete("/receipts", jwt.authenticateToken, async (req, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(401).send();
  }

  const filters = ["product", "shop", "sdate", "edate", "minprice", "maxprice"];
  const deleteFrom = Object.keys(req.query);
  const isValidDelete = deleteFrom.every((filter) => filters.includes(filter));
  
  if (!isValidDelete || (deleteFrom.length === 0)) {
    return res.status(400).send({error: "No valid queries were given."});
  }

  const filterShops = req.query.shop ? { name: req.query.shop.toString() } : {};

  const filterProducts = req.query.product
    ? { barcode: req.query.product.toString() }
    : {};

  const filterDate =
    req.query.sdate && req.query.edate
      ? { date: { $gte: req.query.sdate, $lte: req.query.edate } }
      : {};

  const filterPrice =
    req.query.minprice && req.query.maxprice
      ? { price: { $gte: req.query.minprice, $lte: req.query.maxprice } }
      : {};

  try {
    const shop = await Shop.findOne(filterShops);
    const product = await Product.findOne(filterProducts);

    const searchShop = req.query.shop ? { shop: shop?._id } : {};
    const searchProduct = req.query.product ? { product: product?._id } : {};

    const result = await Receipt.deleteMany({
      ...searchShop,
      ...searchProduct,
      ...filterDate,
      ...filterPrice,
    });

    return res.send({message: `${result.deletedCount} receipt(s) deleted`});
  } catch (error) {
    return res.status(400).send();
  }
});

receiptRouter.delete(
  "/receipts/:id",
  jwt.authenticateToken,
  async (req, res) => {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(401).send();
    }

    try {
      const receipt = await Receipt.findByIdAndDelete(req.params.id)
        .populate("shop", "name")
        .populate("product", "name barcode");

      if (!receipt) {
        return res.status(404).send();
      }

      return res.send(receipt);
    } catch (error) {
      return res.status(400).send();
    }
  }
);
