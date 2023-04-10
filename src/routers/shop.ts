import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Shop } from "../models/shop";

export const shopRouter = express.Router();

shopRouter.get("/shops", jwt.authenticateToken, async (req, res) => {
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

    return res.send(shop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.get("/shops/:id", jwt.authenticateToken, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).send();
    }

    return res.send(shop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.post("/shops", jwt.authenticateToken, async (req, res) => {
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

    const newShop = new Shop(req.body);
    await newShop.save();

    return res.status(201).send({
      message: "Shop sucessfully created",
      shop,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.post("/shops/location", jwt.authenticateToken, async (req, res) => {
  const filter = req.body.name ? { name: req.body.name.toString() } : undefined;

  if (!filter) {
    return res.status(404).send({
      error: "The name of the shop needs to be provided",
    });
  }

  try {
    const shop = await Shop.findOne(filter);

    if (!shop) {
      return res.status(404).send({
        error: `No shops with name ${req.body.name} were found`,
      });
    }

    shop.locations.push(req.body.geolocation);
    await shop.save();

    return res.status(201).send({
      message: `New location added for shop ${shop.name}`,
      geolocation: req.body.geolocation,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

// Only for Admin role
shopRouter.delete("/shops", jwt.authenticateToken, async (req, res) => {
  const account = res.locals.auth;

  if (account.role !== "admin") {
    return res.status(401).send();
  }

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

    return res.send(shop);
  } catch (error) {
    return res.status(400).send();
  }
});

// Only for Admin role
shopRouter.patch("/shops", jwt.authenticateToken, async (req, res) => {
  const account = res.locals.auth;

  if (account.role !== "admin") {
    return res.status(401).send();
  }

  if (!req.query.name) {
    return res.status(400).send({
      error: "A name needs to be provided",
    });
  }

  const allowedUpdates = ["name", "products", "locations"];
  const actualUpdates = Object.keys(req.body);
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
      req.body,
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
});
