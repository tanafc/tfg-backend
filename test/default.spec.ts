import * as request from "supertest";
import app from "../src/app";
import "../src/database/mongoose";

describe("Non-specified routes", () => {
  it("returns an appropriate response for all non-specified routes", async () => {
    await request(app).get("/dummy").expect(501);
  });
});
