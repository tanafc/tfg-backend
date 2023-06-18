import * as express from "express";
import { authenticateToken } from "../middleware/authJwt";
import { authenticateRole } from "../middleware/authRole";
import { Product } from "../models/product";
import { Receipt } from "../models/receipt";
import ROLE from "../models/role";
import { Shop } from "../models/shop";

export const receiptRouter = express.Router();

receiptRouter.get("/receipts/:id", authenticateToken, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).send();
    }

    await receipt.populate({
      path: "shop",
      populate: [
        { path: "name" },
        { path: "location", select: "-_id latitude longitude" },
      ],
    });
    await receipt.populate("product", "name barcode");

    return res.send(receipt);
  } catch (error) {
    return res.status(400).send();
  }
});

receiptRouter.get("/newest-receipts", authenticateToken, async (req, res) => {
  const filter = req.query.product
    ? { barcode: req.query.product.toString() }
    : undefined;

  if (!filter) {
    res
      .status(400)
      .send({ error: "A barcode for a product needs to be provided" });
  }

  try {
    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).send();
    }

    const shops = await Shop.find({});

    const shopReceipts = await Promise.all(
      shops.map((shop) =>
        Receipt.findOne({ product: product._id, shop: shop._id })
          .sort("-_id")
          .populate({
            path: "shop",
            populate: [
              { path: "name" },
              { path: "location", select: "-_id latitude longitude" },
            ],
          })
          .populate("product", "name barcode")
      )
    );

    const newestReceipts = shopReceipts.filter((receipt) => receipt != null);

    return res.send({ receipts: newestReceipts });
  } catch (error) {
    return res.status(400).send();
  }
});

receiptRouter.get("/receipts", authenticateToken, async (req, res) => {
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
      .populate({
        path: "shop",
        populate: [
          { path: "name" },
          { path: "location", select: "-_id latitude longitude" },
        ],
      })
      .populate("product", "name barcode");

    return res.send({ receipts });
  } catch (error) {
    return res.status(400).send();
  }
});

receiptRouter.delete(
  "/receipts",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
    const filters = [
      "product",
      "shop",
      "sdate",
      "edate",
      "minprice",
      "maxprice",
    ];
    const deleteFrom = Object.keys(req.query);
    const isValidDelete = deleteFrom.every((filter) =>
      filters.includes(filter)
    );

    if (!isValidDelete || deleteFrom.length === 0) {
      return res.status(400).send({ error: "No valid queries were given." });
    }

    const filterShops = req.query.shop
      ? { name: req.query.shop.toString() }
      : {};

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

      return res.send({ message: `${result.deletedCount} receipt(s) deleted` });
    } catch (error) {
      return res.status(400).send();
    }
  }
);

receiptRouter.delete(
  "/receipts/:id",
  authenticateToken,
  authenticateRole(ROLE.ADMIN),
  async (req, res) => {
    try {
      const receipt = await Receipt.findByIdAndDelete(req.params.id)
        .populate({
          path: "shop",
          populate: [
            { path: "name" },
            { path: "location", select: "-_id latitude longitude" },
          ],
        })
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
