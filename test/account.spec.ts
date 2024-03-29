import { expect } from "chai";
import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import { generateAccessToken } from "../src/middleware/authJwt";
import { regularUserToken, setupDatabase } from "./fixtures/db";

beforeEach(setupDatabase);

describe("POST /signup", () => {
  it("creates a new account", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "john",
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(201);
  });

  it("does NOT create a new account without username", async () => {
    await request(app)
      .post("/signup")
      .send({
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(400);
  });

  it("should NOT create a new account with the same username", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "Lucas",
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(201);

    await request(app)
      .post("/signup")
      .send({
        username: "Lucas",
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(409);
  });

  it("should NOT create a new account without email", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "maria",
        role: "regular",
        password: "Johndoejohndoe1",
      })
      .expect(400);
  });

  it("should NOT create a new account without password of at least 8 characters", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "harid",
        role: "regular",
        email: "jhondoe@email.com",
        password: "Asd1234",
      })
      .then((res) => {
        expect(res.status).to.equal(400);
      });

    await request(app)
      .post("/signup")
      .send({
        username: "harid",
        role: "regular",
        email: "jhondoe@email.com",
        password: "Jo1qasaa",
      })
      .then((res) => {
        expect(res.status).to.equal(201);
      });
  });

  it("does NOT create an account with a password without uppercase", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "manan",
        role: "admin",
        email: "jhondoe@email.com",
        password: "johndoejohndoe1",
      })
      .expect(400);

    await request(app)
      .post("/signup")
      .send({
        username: "manan",
        role: "admin",
        email: "jhondoe@email.com",
        password: "1johndoejohndoE",
      })
      .expect(201);
  });

  it("does NOT create an account with a password without lowercase", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "menan",
        role: "admin",
        email: "jhondoe@email.com",
        password: "JOHNDOEJOHNDOE1",
      })
      .expect(400);

    await request(app)
      .post("/signup")
      .send({
        username: "menan",
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(201);
  });

  it("does NOT create an account with a password without a number", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "woman",
        role: "admin",
        email: "jhondoe@email.com",
        password: "JOHNDOEJOHNdoe",
      })
      .expect(400);

    await request(app)
      .post("/signup")
      .send({
        username: "woman",
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(201);
  });

  it("should only admit two roles", async () => {
    await request(app)
      .post("/signup")
      .send({
        username: "janed",
        role: "admin",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(201);

    await request(app)
      .post("/signup")
      .send({
        username: "keith",
        role: "regular",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(201);

    await request(app)
      .post("/signup")
      .send({
        username: "dummy",
        role: "dummy",
        email: "jhondoe@email.com",
        password: "Johndoejohndoe1",
      })
      .expect(400);
  });
});

describe("POST /login", () => {
  it("should NOT login a user without username", async () => {
    await request(app)
      .post("/login")
      .send({
        password: "johndoejohndoe",
      })
      .expect(400);
  });

  it("should NOT login a user without password", async () => {
    await request(app)
      .post("/login")
      .send({
        username: "regularuser",
      })
      .expect(400);
  });

  it("should NOT login a user that doesnt exist", async () => {
    await request(app)
      .post("/login")
      .send({
        username: "garrus",
        password: "Johndoejohndoe1",
      })
      .expect(404);
  });

  it("should successfully login a user account", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        username: "regularuser",
        password: "Testtest1",
      })
      .expect(201);

    expect(response.body).to.include({
      username: "regularuser",
      email: "test@test.es",
      role: "regular",
    });

    const token = generateAccessToken({
      username: "regularuser",
    });

    expect(response.body.accessToken).to.be.equal(token);
  });
});

describe("GET /account", () => {
  it("does NOT get the account information if not logged in", async () => {
    await request(app)
      .get("/account")
      .set({ Authorization: `Bearer ` })
      .expect(401);
  });

  it("gets the account information when logged in", async () => {
    const response = await request(app)
      .get("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

      expect(response.body).to.include({
        username: "regularuser",
        email: "test@test.es",
        role: "regular",
      });
  });
});

describe("PATCH /account", () => {
  it("does NOT allow an invalid change in the account", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          role: "admin",
        },
      })
      .then((res) => {
        expect(res.status).to.be.equal(400);
        expect(res.body.error).to.be.equal(
          "Invalid update: username, email and password are the only changes allowed."
        );
      });
  });

  it("does NOT allow an invalid change of the username", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          username: "nul",
        },
      })
      .then((res) => {
        expect(res.status).to.be.equal(400);
      });
  });

  it("does NOT allow an invalid change of the email", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          email: "nul",
        },
      })
      .then((res) => {
        expect(res.status).to.be.equal(400);
      });
  });

  it("does NOT allow an invalid change of the password", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          password: "nul",
        },
      })
      .then((res) => {
        expect(res.status).to.be.equal(400);
      });
  });

  it("allows the change of the username", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          username: "tali2",
        },
      })
      .then((res) => {
        expect(res.status).to.be.equal(200);
        expect(res.body.username).to.be.equal("tali2");
      });
  });

  it("allows the change of the email", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          email: "test2@test.es",
        },
      })
      .then((res) => {
        expect(res.status).to.be.equal(200);
        expect(res.body.email).to.be.equal("test2@test.es");
      });
  });

  it("allows the change of the password", async () => {
    await request(app)
      .patch("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        updates: {
          password: "Testtest2",
        },
      })
      .then(async (res) => {
        expect(res.status).to.be.equal(200);
        await request(app)
          .post("/login")
          .send({
            username: "regularuser",
            email: "test@test.es",
            password: "Testtest2",
          })
          .expect(201);
      });
  });
});

describe("DELETE /account", () => {
  it("does NOT delete an account without the correct password given", async () => {
    await request(app)
      .delete("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        password: "IncorrectPassword1",
      })
      .expect(401);
  });

  it("deletes an account correctly when the password is given", async () => {
    await request(app)
      .delete("/account")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send({
        password: "Testtest1",
      })
      .then((res) => {
        expect(res.status).to.be.equal(200);
        expect(res.body.message).to.be.equal("Account successfully deleted");
      });
  });
});
