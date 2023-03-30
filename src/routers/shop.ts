import * as express from "express";
import * as jwt from "../middleware/authJwt";
import { Shop } from "../models/shop";

export const shopRouter = express.Router();

shopRouter.get("/shop", jwt.authenticateToken, (req, res) => {
  const filter = req.query.name
    ? { name: req.query.name.toString() }
    : undefined;
  if (!filter) {
    res.status(404).send("A name for a shop needs to be provided");
  } else {
    Shop.findOne(filter)
      .then(async (shop) => {
        if (!shop) {
          res.status(404).send({
            error: "No shop was found",
          });
        } else {
          res.send(shop);
        }
      })
      .catch(() => {
        res.status(500).send();
      });
  }
});

shopRouter.get("/shop/:id", jwt.authenticateToken, (req, res) => {
  Shop.findById(req.params.id)
    .then((shop) => {
      if (!shop) {
        res.status(404).send({
          error: "No shops were found",
        });
      } else {
        res.send(shop);
      }
    })
    .catch(() => {
      res.status(500).send();
    });
});

shopRouter.post("/shop", jwt.authenticateToken, (req, res) => {
  const filter = req.body.name ? { name: req.body.name.toString() } : undefined;

  if (!filter) {
    res.status(400).send({
      error: "A name for a shop needs to be provided.",
    });
  } else {
    Shop.findOne(filter).then((shop) => {
      if (shop) {
        res.status(404).send({
          error: `The supermarket ${shop.name} already exists.`,
        });
      } else {
        const newShop = new Shop(req.body);
        newShop
          .save()
          .then((shop) => {
            res.status(201).send({
              message: "Shop sucessfully created",
              shop,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send();
          });
      }
    });
  }
});

shopRouter.post("/shop/location", jwt.authenticateToken, async (req, res) => {
  const filter = req.body.name ? { name: req.body.name.toString() } : undefined;

  if (!filter) {
    return res.status(404).send({
      error: "The name of the shop needs to be provided",
    });
  }

  const shop = await Shop.findOne(filter);

  if (!shop) {
    return res.status(404).send({
      error: `No shops with name ${req.body.name} were found`,
    });
  }

  const geoLocation = {
    latitude: req.body.latitude ?? undefined,
    longitude: req.body.longitude ?? undefined,
    location: req.body.location ?? undefined,
  };

  if (!(geoLocation.latitude && geoLocation.longitude)) {
    return res.status(400).send({
      error: `A location needs to have a latitude and longitude, but it was not provided.`,
    });
  }

  shop.locations.push(geoLocation);
  shop
    .save()
    .then(() => {
      return res.status(201).send({
        message: "A new location was added",
        shop,
      });
    })
    .catch(() => {
      return res.status(400).send();
    });
  return;
});

// Only for Admin role
shopRouter.delete("/shop", jwt.authenticateToken, async (req, res) => { 
  if (!req.query.name) {
    return res.status(400).send({
      error: "A name needs to be provided"
    });
  }
  try {
    const shop = await Shop.findOneAndDelete({name: req.query.name.toString()})

    if (!shop) {
      return res.status(404).send();
    }

    return res.send(shop)

  } catch(error) {
    return res.status(400).send();
  }
});

// Only for Admin role
shopRouter.patch("/shop", jwt.authenticateToken, async (req, res) => {
  if (!req.query.name) {
    return res.status(400).send({
      error: "A name needs to be provided"
    });
  }
  const allowedUpdates = ['name', 'products', 'locations'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: "Update is not permitted",
    });
  }

  try {
    const shop = await Shop.findOneAndUpdate({name: req.query.name.toString()}, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!shop) {
      return res.status(404).send();
    }

    return res.send(shop)
  } catch (error) {
    return res.status(400).send()
  }
});

