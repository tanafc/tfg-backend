import { expect } from "chai";
import mongoose from "mongoose";
import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import { Nutrients } from "../src/models/nutrients";
import { Product } from "../src/models/product";
import { Receipt } from "../src/models/receipt";
import { Shop } from "../src/models/shop";
import {
  adminUserToken,
  nutrientsOfProductOne,
  nutrientsOfProductOneId,
  productOne,
  productOneId,
  productTwoId,
  receiptOfProductOne,
  regularUserToken,
  setupDatabase,
  shopOneId,
} from "./fixtures/db";

beforeEach(setupDatabase);

describe("POST /products", () => {
  it("stores a new product in the database", async () => {
    const newProduct = {
      barcode: "712345767890",
      name: "Doritos Tex-Mex",
      brand: "Doritos",
      image: "null",
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
        salt: 0.97,
        fibre: 4.8,
      },
      beverage: false,
      nutriScore: "D",
    };

    await request(app)
      .post("/products")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newProduct)
      .expect(201);

    const product = await Product.findOne({ barcode: "712345767890" });
    expect(product).not.to.be.null;
    expect(product).to.include({
      barcode: "712345767890",
      name: "Doritos Tex-Mex",
      brand: "Doritos",
    });
  });

  it("does NOT store a new product with the same barcode", async () => {
    const newProduct = {
      barcode: "712345760891",
      name: "Munchitos Original",
      brand: "Matutano",
      image: "null",
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
        salt: 0.73,
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

    expect(response.body.error).to.equal(
      "A product with barcode 712345760891 was already found"
    );

    const product = await Product.findOne({ barcode: "712345760891" });
    expect(product).not.to.be.null;
    expect(product!.name).not.to.equal("Munchitos Original");
  });

  it("does NOT store a new product without the barcode", async () => {
    const newProduct = {
      name: "Munchitos Original",
      brand: "Matutano",
      image: "null",
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
        salt: 0.73,
        fibre: 2.7,
      },
      beverage: false,
      nutriScore: "D",
    };

    await request(app)
      .post("/products")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .send(newProduct)
      .expect(400);

    const product = await Product.findOne({ name: "Munchitos Original" });
    expect(product).to.be.null;
  });
});

describe("GET /products", () => {
  it("gets a new product by its id", async () => {
    const response = await request(app)
      .get(`/products/${productTwoId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body).to.include({
      barcode: "712345767801",
      name: "Oreo Original",
      brand: "Oreo",
      image: "null",
      beverage: false,
      nutriScore: "C",
    });

    expect(response.body.ingredients).to.eql([
      "harina de trigo",
      "grasa de palma",
      "azucar",
      "aceite de nabina",
    ]);

    expect(response.body.nutrients).to.include({
      energy: 476,
      totalFat: 20,
      saturatedFat: 5.4,
      totalCarbohydrates: 68,
      totalSugars: 38,
      protein: 5.3,
      salt: 0.73,
      fibre: 2.7,
    });
  });

  it("gets a new product by its barcode", async () => {
    const response = await request(app)
      .get("/products")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .query({ barcode: "712345767801" })
      .expect(200);

    expect(response.body).to.include({
      barcode: "712345767801",
      name: "Oreo Original",
      brand: "Oreo",
      image: "null",
      beverage: false,
      nutriScore: "C",
    });

    expect(response.body.ingredients).to.eql([
      "harina de trigo",
      "grasa de palma",
      "azucar",
      "aceite de nabina",
    ]);

    expect(response.body.nutrients).to.include({
      energy: 476,
      totalFat: 20,
      saturatedFat: 5.4,
      totalCarbohydrates: 68,
      totalSugars: 38,
      protein: 5.3,
      salt: 0.73,
      fibre: 2.7,
    });
  });
});

describe("GET /products-all", () => {
  it("gets products with similar name", async () => {
    const response = await request(app)
      .get("/products-all")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .query({ name: "dori" })
      .expect(200);

    expect(response.body.products.length).to.equal(2);

    expect(response.body.products[0]).to.include({
      barcode: "712345760891",
      name: "Doritos Original",
      brand: "Doritos",
      image: "null",
    });

    expect(response.body.products[1]).to.include({
      barcode: "712345760818",
      name: "Doritos Nacho Cheese",
      brand: "Doritos",
      image: "null",
    });
  });

  it("returns empty when no similarities are found", async () => {
    const response = await request(app)
      .get("/products-all")
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .query({ name: "abra" })
      .expect(200);

    expect(response.body.products.length).to.equal(0);
    expect(response.body.products).to.eql([]);
  });
});

describe("DELETE /products", () => {
  it("successfully deletes a product in the database with an admin token", async () => {
    await request(app)
      .delete("/products")
      .query({ barcode: "712345760891" })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    const product = await Product.findById(productOneId);
    expect(product).to.be.null;

    const nutrients = await Nutrients.findById(nutrientsOfProductOne);
    expect(nutrients).to.be.null;

    const shop = await Shop.findById(shopOneId);
    expect(shop?.products).to.not.include(productOneId);

    const receipt = await Receipt.findById(receiptOfProductOne);
    expect(receipt).to.be.null;
  });

  it("does NOT delete a product in the database with a regular token", async () => {
    await request(app)
      .delete("/products")
      .query({ barcode: "712345760891" })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const product = await Product.findById(productOneId);
    expect(product).to.not.be.null;
    expect(product!.barcode).to.equal("712345760891");

    const nutrients = await Nutrients.findById(nutrientsOfProductOne);
    expect(nutrients).not.to.be.null;

    const shop = await Shop.findById(shopOneId);
    expect(shop?.products).to.include(productOneId);

    const receipt = await Receipt.findById(receiptOfProductOne);
    expect(receipt).not.to.be.null;
  });
});

describe("PATCH /products", () => {
  it("does NOT allow the update of products with a regular token", async () => {
    const update = {
      name: "Doritos Drink",
      brand: "New Doritos",
      image: "qiwecfo23",
      ingredients: [
        "agua carbonatada",
        "jarabe de alta fructosa",
        "color caramelo",
        "ácido fosfórico",
        "sucralosa",
      ],
      nutrients: {
        energy: 509,
        totalFat: 28.8,
        saturatedFat: 5.2,
        totalCarbohydrates: 59.9,
        totalSugars: 2.6,
        protein: 6.8,
        salt: 1,
        fibre: 4.8,
        iron: 2,
        calcium: 3.09,
        cholesterol: 9.5,
      },
      beverage: true,
      nutriScore: "E",
    };

    await request(app)
      .patch("/products")
      .query({ barcode: productOne.barcode })
      .send(update)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const product = await Product.findOne({ barcode: productOne.barcode });
    expect(product?.name).to.equal(productOne.name);
    expect(product?.brand).to.equal(productOne.brand);
    expect(product?.image).to.equal(productOne.image);
    expect(product?.ingredients).to.eql(productOne.ingredients);
    expect(product?.beverage).to.equal(productOne.beverage);
    expect(product?.nutriScore).to.equal(productOne.nutriScore);

    const nutrients = await Nutrients.findById(nutrientsOfProductOneId);
    expect(nutrients).to.deep.include(nutrientsOfProductOne);
  });

  it("allows the update of products with admin token", async () => {
    const update = {
      name: "Doritos Drink",
      brand: "New Doritos",
      image: "qiwecfo23",
      ingredients: [
        "agua carbonatada",
        "jarabe de alta fructosa",
        "color caramelo",
        "ácido fosfórico",
        "sucralosa",
      ],
      nutrients: {
        energy: 509,
        totalFat: 28.8,
        saturatedFat: 5.2,
        totalCarbohydrates: 59.9,
        totalSugars: 2.6,
        protein: 6.8,
        salt: 1,
        fibre: 4.8,
        iron: 2,
        calcium: 3.09,
        cholesterol: 9.5,
      },
      beverage: true,
      nutriScore: "E",
    };

    await request(app)
      .patch("/products")
      .query({ barcode: productOne.barcode })
      .send({ updates: update })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    const product = await Product.findOne({ barcode: productOne.barcode });
    expect(product?.name).to.equal(update.name);
    expect(product?.brand).to.equal(update.brand);
    expect(product?.image).to.equal(update.image);
    expect(product?.ingredients).to.eql(update.ingredients);
    expect(product?.beverage).to.equal(update.beverage);
    expect(product?.nutriScore).to.equal(update.nutriScore);

    const nutrients = await Nutrients.findById(nutrientsOfProductOneId);
    expect(nutrients).to.deep.include(update.nutrients);
  });

  it("does NOT allow the update of an invalid attribute", async () => {
    const update = {
      _id: new mongoose.Types.ObjectId(),
    };

    const response = await request(app)
      .patch("/products")
      .query({ barcode: productOne.barcode })
      .send({ updates: update })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(400);

    expect(response.body.error).to.equal(
      "Invalid update: name, brand, image, ingredients, nutrients, beverage and nutriScore are the only changes allowed."
    );
  });
});
