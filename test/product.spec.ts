import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import { regularUserToken, setupDatabase } from "./fixtures/db";
import { expect } from "chai";

beforeEach(setupDatabase);

describe("POST /products", () => {
  it("stores a new product in the database", async () => {
    const newProduct = {
      barcode: "712345767890",
      name: "Doritos Tex-Mex",
      brand: "Doritos",
      image: "null",
      price: 3.4,
      shop: "Alcampo",
      ingredients: [
        "maíz",
        "aceite vegetal",
        "maltodrextrina",
        "sal",
        "queso cheddar",
        "suero de leche",
      ],
      nutrients: {
        energy: 497,
        totalFat: 25.8,
        saturatedFat: 3.1,
        totalCarbohydrates: 56.9,
        totalSugars: 2.3,
        protein: 6.6,
        sodium: 0.97,
        fibre: 4.8,
      },
      beverage: false,
      nutriScore: "D",
    };

    const response = await request(app)
      .post("/products")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newProduct)
      .expect(201);

    expect(response.body).to.include({
      barcode: "712345767890",
      name: "Doritos Tex-Mex",
      brand: "Doritos",
      image: "null",
    });
  });

  it("does NOT store a new product with the same barcode", async () => {
    const newProduct = {
      barcode: "712345760891",
      name: "Munchitos Original",
      brand: "Matutano",
      image: "null",
      price: 1.47,
      shop: "Carrefour",
      ingredients: [
        "harina de trigo",
        "grasa de palma",
        "azucar",
        "aceite de nabina",
      ],
      nutrients: {
        energy: 476,
        totalFat: 20,
        saturatedFat: 5.4,
        totalCarbohydrates: 68,
        totalSugars: 38,
        protein: 5.3,
        sodium: 0.73,
        fibre: 2.7,
      },
      beverage: false,
      nutriScore: "D",
    };

    const response = await request(app)
      .post("/products")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newProduct)
      .expect(409);

    expect(response.body.error).to.be.equal(
      "A product with barcode 712345760891 was already found"
    );
  });
});
