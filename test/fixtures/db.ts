import mongoose from "mongoose";
import { generateAccessToken } from "../../src/middleware/authJwt";
import { Account } from "../../src/models/account";
import { Nutrients } from "../../src/models/nutrients";
import { Product } from "../../src/models/product";
import { Shop } from "../../src/models/shop";
import { Update } from "../../src/models/update";
import { hashPassword } from "../../src/utils/hashPassword";

export const regularUserId = new mongoose.Types.ObjectId();
export const adminUserId = new mongoose.Types.ObjectId();
export const shopOneId = new mongoose.Types.ObjectId();
export const shopTwoId = new mongoose.Types.ObjectId();
export const updateOfProductOneId = new mongoose.Types.ObjectId();
export const updateOfProductTwoId = new mongoose.Types.ObjectId();
export const nutrientsOfProductOneId = new mongoose.Types.ObjectId();
export const nutrientsOfProductTwoId = new mongoose.Types.ObjectId();
export const productOneId = new mongoose.Types.ObjectId();
export const productTwoId = new mongoose.Types.ObjectId();

export const regularUserToken = generateAccessToken({
  username: "regularuser",
});

export const adminUserToken = generateAccessToken({
  username: "adminuser",
});

export const regularUser = {
  _id: regularUserId,
  username: "regularuser",
  email: "test@test.es",
  password: hashPassword("Testtest1"),
  role: "regular",
  products: [productOneId],
};

export const adminUser = {
  _id: adminUserId,
  username: "adminuser",
  email: "test@test.es",
  password: hashPassword("Testtest1"),
  role: "admin",
  products: [productTwoId],
};

export const shopOne = {
  _id: new mongoose.Types.ObjectId(),
  name: "Carrefour",
  locations: [
    {
      _id: new mongoose.Types.ObjectId(),
      latitude: 9,
      longitude: 10,
      location: "Calle Vieja La Laguna",
    },
  ],
  products: [productOneId],
};

export const shopTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: "Alcampo",
  locations: [
    {
      _id: new mongoose.Types.ObjectId(),
      latitude: 8,
      longitude: 8,
      location: "Santa Cruz",
    },
  ],
  products: [productTwoId],
};

export const updateOfProductOne = {
  _id: updateOfProductOneId,
  price: 3.4,
  date: Date.now(),
  shop: shopOneId,
  user: regularUserId,
};

export const updateOfProductTwo = {
  _id: updateOfProductTwoId,
  price: 2.1,
  date: Date.now(),
  shop: shopTwoId,
  user: adminUserId,
};

export const nutrientsOfProductOne = {
  _id: nutrientsOfProductOneId,
  energy: 497,
  totalFat: 25.8,
  saturatedFat: 3.1,
  totalCarbohydrates: 56.9,
  totalSugars: 2.3,
  protein: 6.6,
  sodium: 0.97,
  fibre: 4.8,
};

export const nutrientsOfProductTwo = {
  _id: nutrientsOfProductTwoId,
  energy: 476,
  totalFat: 20,
  saturatedFat: 5.4,
  totalCarbohydrates: 68,
  totalSugars: 38,
  protein: 5.3,
  sodium: 0.73,
  fibre: 2.7,
};

export const productOne = {
  _id: productOneId,
  barcode: "712345760891",
  name: "Doritos Original",
  brand: "Doritos",
  image: "null",
  record: [updateOfProductOneId],
  ingredients: [
    "maíz",
    "aceite vegetal",
    "maltodrextrina",
    "sal",
    "queso cheddar",
    "suero de leche",
  ],
  nutrients: nutrientsOfProductOne,
  beverage: false,
  nutriScore: "D",
};

export const productTwo = {
  _id: productTwoId,
  barcode: "712345767801",
  name: "Oreo Original",
  brand: "Oreo",
  image: "null",
  record: [updateOfProductTwoId],
  ingredients: [
    "harina de trigo",
    "grasa de palma",
    "azucar",
    "aceite de nabina",
  ],
  nutrients: nutrientsOfProductTwo,
  beverage: false,
  nutriScore: "C",
};

export const setupDatabase = async () => {
  await Account.deleteMany();
  await Shop.deleteMany();
  await Product.deleteMany();
  await Nutrients.deleteMany();
  await Update.deleteMany();

  await new Account(adminUser).save();
  await new Account(regularUser).save();
  await new Shop(shopOne).save();
  await new Shop(shopTwo).save();
  await new Product(productOne).save();
  await new Product(productTwo).save();
  await new Nutrients(nutrientsOfProductOne).save();
  await new Nutrients(nutrientsOfProductTwo).save();
  await new Update(updateOfProductOne).save();
  await new Update(updateOfProductTwo).save();
};
