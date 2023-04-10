import mongoose from "mongoose";
import { hashPassword } from "../../src/utils/hashPassword";
import { Account } from "../../src/models/account";
import { Shop } from "../../src/models/shop";
import { generateAccessToken } from "../../src/middleware/authJwt";

export const regularUserId = new mongoose.Types.ObjectId();

export const regularUserToken = generateAccessToken({
  username: "regularuser",
});

export const regularUser = {
  _id: regularUserId,
  username: "regularuser",
  email: "test@test.es",
  password: hashPassword("Testtest1"),
  role: "regular",
};

export const adminUserId = new mongoose.Types.ObjectId();

export const adminUserToken = generateAccessToken({
  username: "adminuser",
});

export const adminUser = {
  _id: adminUserId,
  username: "adminuser",
  email: "test@test.es",
  password: hashPassword("Testtest1"),
  role: "admin",
};

export const shopOne = {
  _id: new mongoose.Types.ObjectId(),
  name: "Carrefour",
  locations: [
    { latitude: 9, longitude: 10, location: "Calle Vieja La Laguna" },
  ],
  products: [],
};

export const shopTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: "Alcampo",
  locations: [{ latitude: 8, longitude: 8, location: "Santa Cruz" }],
  products: [],
};

export const setupDatabase = async () => {
  await Account.deleteMany();
  await Shop.deleteMany();

  await new Account(adminUser).save();
  await new Account(regularUser).save();
  await new Shop(shopOne).save();
  await new Shop(shopTwo).save();
};
