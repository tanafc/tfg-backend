import { expect } from "chai";
import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import { Shop } from "../src/models/shop";
import {
  adminUserToken,
  regularUserToken,
  setupDatabase,
  shopTwoId,
} from "./fixtures/db";

beforeEach(setupDatabase);

describe("POST /shops", () => {
  it("does NOT create a new shop without name", async () => {
    const newShop = {
      name: "",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newShop)
      .expect(400);

    const shop = await Shop.findOne({ name: "" });
    expect(shop).to.be.null;
  });

  it("creates a new shop in the database", async () => {
    const newShop = {
      name: "Dia",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newShop)
      .expect(201);

    const shop = await Shop.findOne({ name: "Dia" });
    expect(shop).not.to.be.null;
    expect(shop!.name).to.equal("Dia");
  });

  it("does NOT create a shop with the same name as other", async () => {
    const newShop = {
      name: "Alcampo",
    };

    await request(app)
      .post("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newShop)
      .expect(409);
  });
});

describe("GET /shops", () => {
  it("gets a shop stored in the database by its id", async () => {
    const response = await request(app)
      .get(`/shops/${shopTwoId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body).to.include({
      name: "Alcampo",
    });

    expect(response.body).to.have.property("products");
    expect(response.body).to.have.property("locations");
    expect(response.body.locations.length).to.be.equal(1);
    expect(response.body.locations[0]).to.include({
      latitude: 8,
      longitude: 8,
      location: "Santa Cruz",
    });
  });

  it("gets a shop stored in the database by its name", async () => {
    const response = await request(app)
      .get("/shops")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .query({ name: "Alcampo" })
      .expect(200);

    expect(response.body).to.include({
      name: "Alcampo",
    });

    expect(response.body).to.have.property("products");
    expect(response.body).to.have.property("locations");
    expect(response.body.locations.length).to.be.equal(1);
    expect(response.body.locations[0]).to.include({
      latitude: 8,
      longitude: 8,
      location: "Santa Cruz",
    });
  });
});

describe("PATCH /shops", () => {
  it("does NOT allow a user without the admin role to update a shop", async () => {
    const updates = {
      name: "Spar",
      locations: [{ latitude: 10, longitude: 10, location: "Santa Cruz" }],
    };

    await request(app)
      .patch("/shops")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(updates)
      .expect(401);

    const alcampoShop = await Shop.findOne({ name: "Alcampo" });
    expect(alcampoShop).not.to.be.null;

    const sparShop = await Shop.findOne({ name: "Spar" });
    expect(sparShop).to.be.null;
  });

  it("allows a user with the admin role to update a shop", async () => {
    const updates = {
      name: "Spar",
      locations: [{ latitude: 10, longitude: 10, location: "Santa Cruz" }],
    };

    const response = await request(app)
      .patch("/shops")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .send(updates)
      .expect(200);

    expect(response.body).to.include({
      name: "Spar",
    });
    expect(response.body).to.have.property("locations");
    expect(response.body.locations.length).to.be.equal(1);
    expect(response.body.locations[0]).to.include({
      latitude: 10,
      longitude: 10,
      location: "Santa Cruz",
    });

    const alcampoShop = await Shop.findOne({ name: "Alcampo" });
    expect(alcampoShop).to.be.null;

    const sparShop = await Shop.findOne({ name: "Spar" });
    expect(sparShop).not.to.be.null;
  });
});

describe("DELETE /shops", () => {
  it("does NOT allow a user without the admin role to delete a shop", async () => {
    await request(app)
      .delete("/shops")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const shop = await Shop.findOne({ name: "Alcampo" });
    expect(shop).not.to.be.null;
  });

  it("allows a user with the admin role to delete a shop", async () => {
    const response = await request(app)
      .delete("/shops")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    expect(response.body).to.include({
      name: "Alcampo",
    });
    expect(response.body).to.have.property("locations");
    expect(response.body.locations.length).to.be.equal(1);
    expect(response.body.locations[0]).to.include({
      latitude: 8,
      longitude: 8,
      location: "Santa Cruz",
    });

    const shop = await Shop.findOne({ name: "Alcampo" });
    expect(shop).to.be.null;
  });
});
