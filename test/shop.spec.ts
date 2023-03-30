import * as request from "supertest";
import "../src/database/mongoose";
import app from "../src/app";
import { after, before } from "mocha";
import { Shop } from "../src/models/shop";
import { Account } from "../src/models/account";

const testAccount = {
  username: "shoptester",
  email: "test@test.es",
  password: "Testtest1",
};

let token: string = "";

before(async () => {
  await request(app).post("/signup").send(testAccount);
  await request(app)
    .post("/login")
    .send(testAccount)
    .then((res) => {
      token = res.body.accessToken;
    });
});

after(async () => {
  //   await request(app)
  //     .delete("/account")
  //     .set({ Authorization: `Bearer ${token}` })
  //     .send(testAccount);
  Account.deleteMany();
});

describe("POST /shop", () => {
  afterEach(async () => {
    await Shop.deleteMany();
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
      .set({ Authorization: `Bearer ${token}` })
      .send(newShop)
      .expect(201);
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
      .set({ Authorization: `Bearer ${token}` })
      .send(newShop)
      .expect(201);

    await request(app)
      .get("/shop")
      .set({ Authorization: `Bearer ${token}` })
      .query({ name: "Alcampo" })
      .expect(200);
  });
});
