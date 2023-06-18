import { expect } from "chai";
import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import { Location } from "../src/models/location";
import { Receipt } from "../src/models/receipt";
import { Shop } from "../src/models/shop";
import {
  adminUserToken,
  locationTwoId,
  productOne,
  productOneId,
  productThree,
  productThreeId,
  productTwo,
  productTwoId,
  receiptOfProductTwoId,
  regularUserId,
  regularUserToken,
  setupDatabase,
  shopOne,
  shopOneId,
  shopTwo,
  shopTwoId,
} from "./fixtures/db";

beforeEach(setupDatabase);

describe("POST /shops", () => {
  it("does NOT create a new shop without name", async () => {
    const newShop = {
      name: "",
      location: {
        latitude: 9,
        longitude: 10,
        address: "Calle Vieja La Laguna",
      },
    };

    await request(app)
      .post("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newShop)
      .expect(400);

    const shop = await Shop.findOne({ name: "" });
    expect(shop).to.be.null;
  });

  it("creates a new shop with a location in the database", async () => {
    const newShop = {
      name: "Dia",
      location: {
        latitude: 9,
        longitude: 10,
        address: "Calle Vieja La Laguna",
      },
    };

    const response = await request(app)
      .post("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newShop)
      .expect(201);

    const shop = await Shop.findOne({ name: "Dia" });
    expect(shop).not.to.be.null;
    expect(shop!.name).to.equal("Dia");

    const location = await Location.findById(response.body.location);
    expect(location).not.to.be.null;
    expect(location).to.include({
      latitude: 9,
      longitude: 10,
      address: "Calle Vieja La Laguna",
    });
  });

  it("does NOT create a shop with the same name as other", async () => {
    const newShop = {
      name: shopTwo.name,
      location: {
        latitude: 9,
        longitude: 10,
        address: "Calle Vieja La Laguna",
      },
    };

    await request(app)
      .post("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newShop)
      .expect(409);
  });
});

describe("POST /shops/products", () => {
  it("does NOT allow to post a product in a shop without the shop name", async () => {
    const response = await request(app)
      .post("/shops/products")
      .send({ barcode: productThree.barcode, price: 3.5 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(400);

    expect(response.body.error).to.equal(
      "A shop, barcode of a product, and price needs to be provided."
    );
  });

  it("does NOT allow to post a product in a shop without the barcode name", async () => {
    const response = await request(app)
      .post("/shops/products")
      .query({ name: shopOne.name })
      .send({ price: 3.5 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(400);

    expect(response.body.error).to.equal(
      "A shop, barcode of a product, and price needs to be provided."
    );
  });

  it("does NOT allow to post a product in a shop without price", async () => {
    const response = await request(app)
      .post("/shops/products")
      .query({ name: shopOne.name })
      .send({ barcode: productThree.barcode })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(400);

    expect(response.body.error).to.equal(
      "A shop, barcode of a product, and price needs to be provided."
    );
  });

  it("does NOT allow to post of a product in a non-existent shop", async () => {
    await request(app)
      .post("/shops/products")
      .query({ name: "dummy" })
      .send({ barcode: productThree.barcode, price: 3.5 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(404);
  });

  it("does NOT allow to post of a non-existent product in a shop", async () => {
    await request(app)
      .post("/shops/products")
      .query({ name: shopOne.name })
      .send({ barcode: "123123123", price: 3.5 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(404);
  });

  it("posts a product in a shop", async () => {
    await request(app)
      .post("/shops/products")
      .query({ name: shopOne.name })
      .send({ barcode: productThree.barcode, price: 6.8 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(201);

    const shop = await Shop.findById(shopOneId);
    expect(shop?.products).to.include(productThreeId);

    const receipt = await Receipt.findOne({
      shop: shopOneId,
      product: productThreeId,
    });
    expect(receipt).not.to.be.null;
    expect(receipt!.product).to.include(productThreeId);
    expect(receipt!.shop).to.include(shopOneId);
    expect(receipt!.price).to.equal(6.8);
    expect(receipt!.user).to.include(regularUserId);
  });
});

describe("GET /shops", () => {
  it("gets a shop stored in the database by its id", async () => {
    const response = await request(app)
      .get(`/shops/${shopTwoId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.name).to.equal(shopTwo.name);

    expect(response.body.products).to.eql([
      {
        name: productTwo.name,
        barcode: productTwo.barcode,
        brand: productTwo.brand,
      },
      {
        name: productThree.name,
        barcode: productThree.barcode,
        brand: productThree.brand,
      },
    ]);

    expect(response.body.location).to.include({
      latitude: 8,
      longitude: 8,
      address: "Santa Cruz",
    });
  });

  it("gets a shop stored in the database by its name", async () => {
    const response = await request(app)
      .get("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .query({ name: shopTwo.name })
      .expect(200);

    expect(response.body.name).to.equal(shopTwo.name);

    expect(response.body.products).to.eql([
      {
        name: productTwo.name,
        barcode: productTwo.barcode,
        brand: productTwo.brand,
      },
      {
        name: productThree.name,
        barcode: productThree.barcode,
        brand: productThree.brand,
      },
    ]);

    expect(response.body.location).to.include({
      latitude: 8,
      longitude: 8,
      address: "Santa Cruz",
    });
  });
});

describe("GET /shops-all", () => {
  it("gets shops with similar name", async () => {
    const response = await request(app)
      .get("/shops-all")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .query({ name: "Alca" })
      .expect(200);

    expect(response.body.shops.length).to.equal(1);

    expect(response.body.shops[0]).to.include({
      name: "Alcampo",
    });
  });

  it("returns all shops when no name is send", async () => {
    const response = await request(app)
      .get("/shops-all")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.shops.length).to.equal(2);
    expect(response.body.shops[0]).to.include({
      name: "Alcampo",
    });
    expect(response.body.shops[1]).to.include({
      name: "Carrefour",
    });
  });
});

describe("DELETE /shops", () => {
  it("does NOT allow a user without the admin role to delete a shop", async () => {
    await request(app)
      .delete("/shops")
      .query({ name: shopTwo.name })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const shop = await Shop.findOne({ name: shopTwo.name });
    expect(shop).not.to.be.null;
  });

  it("allows a user with the admin role to delete a shop", async () => {
    await request(app)
      .delete("/shops")
      .query({ name: shopTwo.name })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    const shop = await Shop.findById(shopTwoId);
    expect(shop).to.be.null;

    const location = await Location.findById(locationTwoId);
    expect(location).to.be.null;

    const receipt = await Receipt.findById(receiptOfProductTwoId);
    expect(receipt).to.be.null;
  });
});

describe("DELETE /shops/products", () => {
  it("does NOT allow the removal of a product in a shop without admin token", async () => {
    await request(app)
      .delete("/shops/products")
      .query({ name: shopOne.name })
      .send({ products: [productOne.barcode] })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const shop = await Shop.findById(shopOneId);
    expect(shop?.products).to.include(productOneId);

    const receipt = await Receipt.findOne({
      shop: shopOneId,
      product: productOneId,
    });
    expect(receipt).not.to.be.null;
    expect(receipt!.price).to.equal(3.4);
  });

  it("allows the removal of a product in a shop with admin token", async () => {
    await request(app)
      .delete("/shops/products")
      .query({ name: shopTwo.name })
      .send({ products: [productTwo.barcode] })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    const shop = await Shop.findById(shopTwoId);
    expect(shop?.products).to.not.include(productOneId);
    expect(shop?.products).to.include(productThreeId);

    const receiptOfProductTwo = await Receipt.findOne({
      shop: shopTwoId,
      product: productTwoId,
    });
    expect(receiptOfProductTwo).to.be.null;

    const receiptOfProductThree = await Receipt.findOne({
      shop: shopTwoId,
      product: productThreeId,
    });
    expect(receiptOfProductThree).not.to.be.null;
    expect(receiptOfProductThree!.price).to.equal(3.85);
  });
});

describe("PATCH /shops", () => {
  it("does NOT allow a user without the admin role to update the name of a shop", async () => {
    const update = {
      name: "Spar",
    };

    await request(app)
      .patch("/shops")
      .query({ name: shopTwo.name })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({ updates: update })
      .expect(401);

    const alcampoShop = await Shop.findOne({ name: shopTwo.name });
    expect(alcampoShop).not.to.be.null;

    const sparShop = await Shop.findOne({ name: "Spar" });
    expect(sparShop).to.be.null;
  });

  it("allows a user with the admin role to update the name of a shop", async () => {
    const update = {
      name: "Spar",
    };

    const response = await request(app)
      .patch("/shops")
      .query({ name: shopTwo.name })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .send({ updates: update })
      .expect(200);

    expect(response.body).to.include({
      name: "Spar",
    });

    const alcampoShop = await Shop.findOne({ name: "Alcampo" });
    expect(alcampoShop).to.be.null;

    const sparShop = await Shop.findOne({ name: "Spar" });
    expect(sparShop).not.to.be.null;
    expect(sparShop?.products).to.include(productTwoId);
  });
});
