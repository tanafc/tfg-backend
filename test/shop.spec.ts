import * as request from "supertest";
import "../src/database/mongoose";
import app from "../src/app";
import { after, before } from "mocha";
import { Shop } from "../src/models/shop";
import { expect } from "chai";
import { Account } from "../src/models/account";

const testRegularAccount = {
  username: "shoptester",
  email: "test@test.es",
  password: "Testtest1",
};

const testAdminAccount = {
  username: "shopadmin",
  email: "test@test.es",
  password: "Testtest1",
  role: "admin",
};

let regularToken: string = "";
let adminToken: string = "";

afterEach(async () => {
  await Shop.deleteMany();
});

describe("POST /shop", () => {
  before(async () => {
    await request(app).post("/signup").send(testRegularAccount);
    await request(app)
      .post("/login")
      .send(testRegularAccount)
      .then((res) => {
        regularToken = res.body.accessToken;
      });
  });

  after(async () => {
    await Account.deleteMany();
  });

  it("does NOT create a new shop without name", async () => {
    const newShop = {
      name: "",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(400);
  });

  it("creates a new shop in the database", async () => {
    const newShop = {
      name: "Carrefour",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(201);
  });

  it("does NOT create a shop with the same name as other", async () => {
    const newShop = {
      name: "Alcampo",
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(409);
  });
});

describe("GET /shop", () => {
  before(async () => {
    await request(app).post("/signup").send(testRegularAccount);
    await request(app)
      .post("/login")
      .send(testRegularAccount)
      .then((res) => {
        regularToken = res.body.accessToken;
      });
  });

  after(async () => {
    await Account.deleteMany();
  });

  it("gets a shop stored in the database", async () => {
    const newShop = {
      name: "Alcampo",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .get("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .query({ name: "Alcampo" })
      .expect(200);
  });
});

describe("PATCH /shop", () => {
  before(async () => {
    await request(app).post("/signup").send(testRegularAccount);
    await request(app)
      .post("/login")
      .send(testRegularAccount)
      .then((res) => {
        regularToken = res.body.accessToken;
      });

    await request(app).post("/signup").send(testAdminAccount);
    await request(app)
      .post("/login")
      .send(testAdminAccount)
      .then((res) => {
        adminToken = res.body.accessToken;
      });
  });

  after(async () => {
    await Account.deleteMany();
  });

  it("does NOT allow a user without the admin role to update a shop", async () => {
    const newShop = {
      name: "Alcampo",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    const updates = {
      name: "Carrefour",
      locations: [{ latitude: 10, longitude: 10, location: "Santa Cruz" }],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .patch("/shop")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(updates)
      .expect(401);
  });

  it("allows a user with the admin role to update a shop", async () => {
    const newShop = {
      name: "Alcampo",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    const updates = {
      name: "Carrefour",
      locations: [{ latitude: 10, longitude: 10, location: "Santa Cruz" }],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .patch("/shop")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(updates)
      .expect(200)
      .then((res) => {
        expect(res.body.name).to.equal("Carrefour");
        expect(res.body.locations.length).to.equal(1);
        expect(res.body.locations[0]).to.include({
          latitude: 10,
          longitude: 10,
          location: "Santa Cruz"
        });
      });
  });
});

describe("DELETE /shop", () => {
  before(async () => {
    await request(app).post("/signup").send(testRegularAccount);
    await request(app)
      .post("/login")
      .send(testRegularAccount)
      .then((res) => {
        regularToken = res.body.accessToken;
      });

    await request(app).post("/signup").send(testAdminAccount);
    await request(app)
      .post("/login")
      .send(testAdminAccount)
      .then((res) => {
        adminToken = res.body.accessToken;
      });
  });

  after(async () => {
    await Account.deleteMany();
  });

  it("does NOT allow a user without the admin role to delete a shop", async () => {
    const newShop = {
      name: "Alcampo",
      locations: [
        { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${regularToken}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .delete("/shop")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${regularToken}` })
      .expect(401);
  });

  it("allows a user with the admin role to delete a shop", async () => {
    const newShop = {
      name: "Alcampo",
      locations: [
        { latitude: 9, longitude: 8, location: "Calle Vieja La Laguna" },
      ],
    };

    await request(app)
      .post("/shop")
      .set({ Authorization: `Bearer ${adminToken}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .delete("/shop")
      .query({ name: "Alcampo" })
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(200)
      .then((res) => {
        expect(res.body.name).to.equal("Alcampo");
        expect(res.body.locations.length).to.equal(1);
        expect(res.body.locations[0]).to.include({
          latitude: 9,
          longitude: 8,
          location: "Calle Vieja La Laguna"
        });
      });
  });
});
