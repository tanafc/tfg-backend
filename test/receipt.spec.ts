import { expect } from "chai";
import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";
import {
  adminUserToken,
  productOne,
  productOneId,
  productThree,
  productThreeId,
  productTwo,
  receiptOfProductOneId,
  receiptOfProductThreeId,
  receiptOfProductTwoId,
  regularUserToken,
  shopOne,
  shopOneId,
  shopTwo,
  shopTwoId,
} from "./fixtures/db";
import { Receipt } from "../src/models/receipt";

describe("GET /receipts/:id", () => {
  it("gets a receipt by its id", async () => {
    const response = await request(app)
      .get(`/receipts/${receiptOfProductOneId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body).to.include({
      price: 3.4,
      date: "2023-04-12T13:40:29.431Z",
    });

    expect(response.body.shop).to.include({
      _id: shopOneId.toString(),
      name: shopOne.name,
    });

    expect(response.body.product).to.include({
      _id: productOneId.toString(),
      name: productOne.name,
      barcode: productOne.barcode,
    });
  });
});

describe("GET /receipts", () => {
  it("gets the receipts of a determined product in a single shop", async () => {
    const response = await request(app)
      .get("/receipts")
      .query({ shop: shopTwo.name, product: productTwo.barcode })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.receipts.length).to.equal(1);

    expect(response.body.receipts[0]).to.include({
      price: 2.1,
      date: "2023-05-12T13:40:29.431Z",
    });

    expect(response.body.receipts[0].product).to.include({
      barcode: "712345767801",
      name: "Oreo Original",
    });

    expect(response.body.receipts[0].shop).to.include({
      name: "Alcampo",
    });
  });

  it("gets the receipts of products in a single shop", async () => {
    const response = await request(app)
      .get("/receipts")
      .query({ shop: shopTwo.name })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.receipts.length).to.equal(2);

    expect(response.body.receipts[0]).to.include({
      price: 3.85,
      date: "2023-06-12T13:40:29.431Z",
    });

    expect(response.body.receipts[0].product).to.include({
      barcode: "712345760818",
      name: "Doritos Nacho Cheese",
    });

    expect(response.body.receipts[0].shop).to.include({
      name: "Alcampo",
    });

    expect(response.body.receipts[1]).to.include({
      price: 2.1,
      date: "2023-05-12T13:40:29.431Z",
    });

    expect(response.body.receipts[1].product).to.include({
      barcode: "712345767801",
      name: "Oreo Original",
    });

    expect(response.body.receipts[1].shop).to.include({
      name: "Alcampo",
    });
  });

  it("gets the receipts of a determined product in all shops available", async () => {
    const response = await request(app)
      .get("/receipts")
      .query({ product: productOne.barcode })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.receipts.length).to.equal(1);

    expect(response.body.receipts[0]).to.include({
      price: 3.4,
      date: "2023-04-12T13:40:29.431Z",
    });

    expect(response.body.receipts[0].product).to.include({
      barcode: "712345760891",
      name: "Doritos Original",
    });

    expect(response.body.receipts[0].shop).to.include({
      _id: shopOneId.toString(),
      name: "Carrefour",
    });
  });

  it("gets the receipts between a range of prices", async () => {
    const response = await request(app)
      .get("/receipts")
      .query({ minprice: 3.1, maxprice: 4.2 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.receipts.length).to.equal(2);

    expect(response.body.receipts[0]).to.include({
      price: 3.85,
      date: "2023-06-12T13:40:29.431Z",
    });

    expect(response.body.receipts[0].product).to.include({
      _id: productThreeId.toString(),
      barcode: productThree.barcode,
      name: productThree.name,
    });

    expect(response.body.receipts[0].shop).to.include({
      _id: shopTwoId.toString(),
      name: shopTwo.name,
    });

    expect(response.body.receipts[1]).to.include({
      price: 3.4,
      date: "2023-04-12T13:40:29.431Z",
    });

    expect(response.body.receipts[1].product).to.include({
      _id: productOneId.toString(),
      barcode: productOne.barcode,
      name: productOne.name,
    });

    expect(response.body.receipts[1].shop).to.include({
      _id: shopOneId.toString(),
      name: shopOne.name,
    });
  });

  it("gets the receipts between a range of dates", async () => {
    const response = await request(app)
      .get("/receipts")
      .query({ sdate: "2023-04-12", edate: "2023-06-12" })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.receipts.length).to.equal(2);

    expect(response.body.receipts[0]).to.include({
      price: 2.1,
      date: "2023-05-12T13:40:29.431Z",
    });
    expect(response.body.receipts[0].product.name).to.equal(productTwo.name);
    expect(response.body.receipts[0].shop.name).to.equal(shopTwo.name);

    expect(response.body.receipts[1]).to.include({
      price: 3.4,
      date: "2023-04-12T13:40:29.431Z",
    });
    expect(response.body.receipts[1].product.name).to.equal(productOne.name);
    expect(response.body.receipts[1].shop.name).to.equal(shopOne.name);
  });

  it("returns a limited number of documents", async () => {
    const response = await request(app)
      .get("/receipts")
      .query({ limit: 2 })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(200);

    expect(response.body.receipts.length).to.equal(2);
    expect(response.body.receipts[0]._id).to.include(receiptOfProductThreeId);
    expect(response.body.receipts[1]._id).to.include(receiptOfProductTwoId);
  });
});

describe("DELETE /receipts/:id", () => {
  it("does NOT allow a regular user to delete a receipt by its id", async () => {
    await request(app)
      .delete(`/receipts/${receiptOfProductOneId}`)
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const receipt = await Receipt.findById(receiptOfProductOneId);
    expect(receipt).not.to.be.null;
  });

  it("does allows an admin user to delete a receipt by its id", async () => {
    await request(app)
      .delete(`/receipts/${receiptOfProductOneId}`)
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    const receipt = await Receipt.findById(receiptOfProductOneId);
    expect(receipt).to.be.null;
  });
});

describe("DELETE /receipts", () => {
  it("does NOT allow a regular user to delete receipts", async () => {
    const response = await request(app)
      .delete("/receipts")
      .query({ shop: shopTwo.name, product: productTwo.barcode })
      .set({ Authorization: `Bearer ${regularUserToken}` })
      .expect(401);

    const receipt = await Receipt.findById(receiptOfProductTwoId);
    expect(receipt).not.to.be.null;
  });

  it("deletes the receipt of a determined product in a single shop", async () => {
    const response = await request(app)
      .delete("/receipts")
      .query({ shop: shopTwo.name, product: productTwo.barcode })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    expect(response.body.message).to.equal("1 receipt(s) deleted");

    const receipt = await Receipt.findById(receiptOfProductTwoId);
    expect(receipt).to.be.null;
  });

  it("deletes the receipts of products in a single shop", async () => {
    const response = await request(app)
      .delete("/receipts")
      .query({ shop: shopTwo.name })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    expect(response.body.message).to.equal("2 receipt(s) deleted");

    const receiptOne = await Receipt.findById(receiptOfProductTwoId);
    expect(receiptOne).to.be.null;

    const receiptTwo = await Receipt.findById(receiptOfProductThreeId);
    expect(receiptTwo).to.be.null;
  });

  it("deletes the receipts of a determined product in all shops available", async () => {
    const response = await request(app)
      .delete("/receipts")
      .query({ product: productOne.barcode })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    expect(response.body.message).to.equal("1 receipt(s) deleted");

    const receipt = await Receipt.findById(receiptOfProductOneId);
    expect(receipt).to.be.null;
  });

  it("deletes the receipts between a range of prices", async () => {
    const response = await request(app)
      .delete("/receipts")
      .query({ minprice: 3.4, maxprice: 4.2 })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    expect(response.body.message).to.equal("2 receipt(s) deleted");

    const receiptOne = await Receipt.findById(receiptOfProductOneId);
    expect(receiptOne).to.be.null;

    const receiptTwo = await Receipt.findById(receiptOfProductTwoId);
    expect(receiptTwo).not.to.be.null;

    const receiptThree = await Receipt.findById(receiptOfProductThreeId);
    expect(receiptThree).to.be.null;
  });

  it("deletes the receipts between a range of dates", async () => {
    const response = await request(app)
      .delete("/receipts")
      .query({ sdate: "2023-05-12", edate: "2023-07-12" })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(200);

    expect(response.body.message).to.equal("2 receipt(s) deleted");

    const receiptOne = await Receipt.findById(receiptOfProductOneId);
    expect(receiptOne).not.to.be.null;

    const receiptTwo = await Receipt.findById(receiptOfProductTwoId);
    expect(receiptTwo).to.be.null;

    const receiptThree = await Receipt.findById(receiptOfProductThreeId);
    expect(receiptThree).to.be.null;
  });

  it("does NOT delete receipts if no valid params are given", async () => {
    const responseOne = await request(app)
      .delete("/receipts")
      .query({})
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(400);

    expect(responseOne.body.error).to.equal("No valid queries were given.");

    const responseTwo = await request(app)
      .delete("/receipts")
      .query({ dummy: 2 })
      .set({ Authorization: `Bearer ${adminUserToken}` })
      .expect(400);

    expect(responseTwo.body.error).to.equal("No valid queries were given.");

    const receiptOne = await Receipt.findById(receiptOfProductOneId);
    expect(receiptOne).not.to.be.null;

    const receiptTwo = await Receipt.findById(receiptOfProductTwoId);
    expect(receiptTwo).not.to.be.null;

    const receiptThree = await Receipt.findById(receiptOfProductThreeId);
    expect(receiptThree).not.to.be.null;
  });
});
