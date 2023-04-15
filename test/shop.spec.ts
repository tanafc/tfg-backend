import { expect } from "chai";
import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import { Shop } from "../src/models/shop";
import { Location } from "../src/models/location";
import {
  adminUserToken,
  locationTwoId,
  productTwo,
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
    expect(shop!.locations).to.include(response.body.locations[0]);

    const location = await Location.findById(response.body.locations[0]);
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

describe("POST /shops/locations", () => {
  it("does NOT create a new location for a non-existent shop", async () => {
    const newLocation = {
      latitude: 12,
      longitude: 74,
      address: "Calle 4 La Orotava",
    };

    await request(app)
      .post("/shops/locations")
      .query({ name: "Don" })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newLocation)
      .expect(404);
  });

  it("posts a new location of a shop", async () => {
    const newLocation = {
      latitude: 12,
      longitude: 74,
      address: "Calle 4 La Orotava",
    };

    const response = await request(app)
      .post("/shops/locations")
      .query({ name: shopOne.name })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newLocation)
      .expect(201);

    const shop = await Shop.findById(shopOneId);
    expect(shop?.locations).to.include(response.body._id);

    const location = await Location.findById(response.body._id);
    expect(location).to.include({
      latitude: 12,
      longitude: 74,
      address: "Calle 4 La Orotava",
    });
  });
});

describe("GET /shops", () => {
  it("gets a shop stored in the database by its id", async () => {
    const response = await request(app)
      .get(`/shops/${shopTwoId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body).to.include({
      name: shopTwo.name,
    });

    expect(response.body.products).to.eql([
      { name: productTwo.name, barcode: productTwo.barcode },
    ]);

    expect(response.body.locations.length).to.be.equal(1);
    expect(response.body.locations[0]).to.include({
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

    expect(response.body).to.include({
      name: shopTwo.name,
    });

    expect(response.body.products).to.eql([
      { name: productTwo.name, barcode: productTwo.barcode },
    ]);

    expect(response.body.locations.length).to.be.equal(1);
    expect(response.body.locations[0]).to.include({
      latitude: 8,
      longitude: 8,
      address: "Santa Cruz",
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
  });
});

describe("DELETE /shops/locations/:id", () => {
  it("does NOT allow a user without the admin role to delete the location of a shop", async () => {
    await request(app)
      .delete(`/shops/locations/${locationTwoId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const location = await Location.findById(locationTwoId);
    expect(location).not.to.be.null;

    const shop = await Shop.findById(shopTwoId);
    expect(shop?.locations).to.include(locationTwoId);
  });

  it("allows a user with the admin role to delete the location of a shop", async () => {
    await request(app)
      .delete(`/shops/locations/${locationTwoId}`)
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    const location = await Location.findById(locationTwoId);
    expect(location).to.be.null;

    const shop = await Shop.findById(shopTwoId);
    expect(shop?.locations).to.not.include(locationTwoId);
  });
});

// describe("PATCH /shops", () => {
//   it("does NOT allow a user without the admin role to update a shop", async () => {
//     const updates = {
//       name: "Spar",
//       locations: [{ latitude: 10, longitude: 10, location: "Santa Cruz" }],
//     };

//     await request(app)
//       .patch("/shops")
//       .query({ name: "Alcampo" })
//       .set({ Authorization: `Bearer ${regularUserToken}` })
//       .send(updates)
//       .expect(401);

//     const alcampoShop = await Shop.findOne({ name: "Alcampo" });
//     expect(alcampoShop).not.to.be.null;

//     const sparShop = await Shop.findOne({ name: "Spar" });
//     expect(sparShop).to.be.null;
//   });

//   it("allows a user with the admin role to update a shop", async () => {
//     const updates = {
//       name: "Spar",
//       locations: [{ latitude: 10, longitude: 10, location: "Santa Cruz" }],
//     };

//     const response = await request(app)
//       .patch("/shops")
//       .query({ name: "Alcampo" })
//       .set({ Authorization: `Bearer ${adminUserToken}` })
//       .send(updates)
//       .expect(200);

//     expect(response.body).to.include({
//       name: "Spar",
//     });
//     expect(response.body).to.have.property("locations");
//     expect(response.body.locations.length).to.be.equal(1);
//     expect(response.body.locations[0]).to.include({
//       latitude: 10,
//       longitude: 10,
//       location: "Santa Cruz",
//     });

//     const alcampoShop = await Shop.findOne({ name: "Alcampo" });
//     expect(alcampoShop).to.be.null;

//     const sparShop = await Shop.findOne({ name: "Spar" });
//     expect(sparShop).not.to.be.null;
//   });
// });
