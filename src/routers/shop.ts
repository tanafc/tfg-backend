import * as express from "express";
import mongoose from "mongoose";
import * as jwt from "../middleware/authJwt";
import { Location } from "../models/location";
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

    await shop.populate("products", "-_id name barcode");
    await shop.populate("locations", "-shop");

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

    await shop.populate("products", "-_id name barcode");
    await shop.populate("locations", "-shop");

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

    const newShopId = new mongoose.Types.ObjectId();

    const newLocation = new Location({
      ...req.body.location,
      shop: newShopId
    });

    const newShop = new Shop({
      _id: newShopId,
      name: req.body.name,
      locations: [newLocation._id],
    });

    await newLocation.save();
    await newShop.save();

    return res.status(201).send(newShop);
  } catch (error) {
    return res.status(400).send(error);
  }
});

shopRouter.post("/shops/locations", jwt.authenticateToken, async (req, res) => {
  const filter = req.query.name
    ? { name: req.query.name.toString() }
    : undefined;

  if (!filter) {
    return res.status(404).send({
      error: "The name of the shop needs to be provided",
    });
  }

  try {
    const shop = await Shop.findOne(filter);

    if (!shop) {
      return res.status(404).send({
        error: `No shop with name ${req.body.name} was found`,
      });
    }

    const location = new Location({
      ...req.body,
      shop: shop._id
    });

    shop.locations.push(location._id);

    await shop.save();
    await location.save();

    return res.status(201).send(location);
  } catch (error) {
    return res.status(400).send(error);
  }
});

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

    await Location.deleteMany({ _id: { $in: shop.locations } });

    return res.send(shop);
  } catch (error) {
    return res.status(400).send();
  }
});

shopRouter.delete(
  "/shops/locations/:id",
  jwt.authenticateToken,
  async (req, res) => {
    const account = res.locals.auth;

    if (account.role !== "admin") {
      return res.status(401).send();
    }

    if (!req.params.id) {
      return res.status(400).send({
        error: "An id of a location needs to be provided",
      });
    }

    try {
      const location = await Location.findByIdAndDelete(req.params.id);

      if (!location) {
        return res.status(404).send();
      }

      await Shop.findByIdAndUpdate(location.shop, {
        $pull: { locations: location._id },
      });

      return res.send(location);
    } catch (error) {
      return res.status(400).send();
    }
  }
);

// shopRouter.patch("/shops", jwt.authenticateToken, async (req, res) => {
//   const account = res.locals.auth;

//   if (account.role !== "admin") {
//     return res.status(401).send();
//   }

//   if (!req.query.name) {
//     return res.status(400).send({
//       error: "A name needs to be provided",
//     });
//   }

//   const allowedUpdates = ["name", "products", "locations"];
//   const actualUpdates = Object.keys(req.body);
//   const isValidUpdate = actualUpdates.every((update) =>
//     allowedUpdates.includes(update)
//   );

//   if (!isValidUpdate) {
//     return res.status(400).send({
//       error: "Update is not permitted",
//     });
//   }

//   try {
//     const shop = await Shop.findOneAndUpdate(
//       { name: req.query.name.toString() },
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!shop) {
//       return res.status(404).send();
//     }

//     return res.send(shop);
//   } catch (error) {
//     return res.status(400).send();
//   }
// });
