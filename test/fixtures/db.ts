import mongoose from "mongoose";
import { generateAccessToken } from "../../src/middleware/authJwt";
import { Account } from "../../src/models/account";
import { Location } from "../../src/models/location";
import { Nutrients } from "../../src/models/nutrients";
import { Product } from "../../src/models/product";
import { Receipt } from "../../src/models/receipt";
import { Shop } from "../../src/models/shop";
import { hashPassword } from "../../src/utils/hashPassword";

export const regularUserId = new mongoose.Types.ObjectId();
export const adminUserId = new mongoose.Types.ObjectId();
export const locationOneId = new mongoose.Types.ObjectId();
export const locationTwoId = new mongoose.Types.ObjectId();
export const shopOneId = new mongoose.Types.ObjectId();
export const shopTwoId = new mongoose.Types.ObjectId();
export const receiptOfProductOneId = new mongoose.Types.ObjectId();
export const receiptOfProductTwoId = new mongoose.Types.ObjectId();
export const receiptOfProductThreeId = new mongoose.Types.ObjectId();
export const nutrientsOfProductOneId = new mongoose.Types.ObjectId();
export const nutrientsOfProductTwoId = new mongoose.Types.ObjectId();
export const nutrientsOfProductThreeId = new mongoose.Types.ObjectId();
export const productOneId = new mongoose.Types.ObjectId();
export const productTwoId = new mongoose.Types.ObjectId();
export const productThreeId = new mongoose.Types.ObjectId();

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
};

export const adminUser = {
  _id: adminUserId,
  username: "adminuser",
  email: "test@test.es",
  password: hashPassword("Testtest1"),
  role: "admin",
};

export const locationOne = {
  _id: locationOneId,
  shop: shopOneId,
  latitude: 9,
  longitude: 10,
  address: "Calle Vieja La Laguna",
};

export const locationTwo = {
  _id: locationTwoId,
  shop: shopTwoId,
  latitude: 8,
  longitude: 8,
  address: "Santa Cruz",
};

export const shopOne = {
  _id: shopOneId,
  name: "Carrefour",
  location: locationOne,
  products: [productOneId],
};

export const shopTwo = {
  _id: shopTwoId,
  name: "Alcampo",
  location: locationTwo,
  products: [productTwoId, productThreeId],
};

export const receiptOfProductOne = {
  _id: receiptOfProductOneId,
  price: 3.4,
  date: "2023-04-12T13:40:29.431Z",
  product: productOneId,
  shop: shopOneId,
  user: regularUserId,
};

export const receiptOfProductTwo = {
  _id: receiptOfProductTwoId,
  price: 2.1,
  date: "2023-05-12T13:40:29.431Z",
  product: productTwoId,
  shop: shopTwoId,
  user: adminUserId,
};

export const receiptOfProductThree = {
  _id: receiptOfProductThreeId,
  price: 3.85,
  date: "2023-06-12T13:40:29.431Z",
  product: productThreeId,
  shop: shopTwoId,
  user: adminUserId,
};

export const nutrientsOfProductOne = {
  _id: nutrientsOfProductOneId,
  product: productOneId,
  energy: 497,
  totalFat: 25.8,
  saturatedFat: 3.1,
  totalCarbohydrates: 56.9,
  totalSugars: 2.3,
  protein: 6.6,
  salt: 0.97,
  fibre: 4.8,
};

export const nutrientsOfProductTwo = {
  _id: nutrientsOfProductTwoId,
  product: productTwoId,
  energy: 476,
  totalFat: 20,
  saturatedFat: 5.4,
  totalCarbohydrates: 68,
  totalSugars: 38,
  protein: 5.3,
  salt: 0.73,
  fibre: 2.7,
};

export const nutrientsOfProductThree = {
  _id: nutrientsOfProductThreeId,
  product: productThreeId,
  energy: 509,
  totalFat: 28.8,
  saturatedFat: 5.2,
  totalCarbohydrates: 59.9,
  totalSugars: 2.6,
  protein: 6.8,
  salt: 1,
  fibre: 4.8,
};

export const productOne = {
  _id: productOneId,
  barcode: "712345760891",
  name: "Doritos Original",
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

export const productThree = {
  _id: productThreeId,
  barcode: "712345760818",
  name: "Doritos Nacho Cheese",
  brand: "Doritos",
  image: "null",
  ingredients: [
    "maíz",
    "aceite vegetal",
    "aceite de colza",
    "acido lácteo",
    "puré de ajo",
    "maltodrextrina",
    "sal",
    "queso cheddar",
    "suero de leche",
  ],
  nutrients: nutrientsOfProductThree,
  beverage: false,
  nutriScore: "B",
};

export const setupDatabase = async () => {
  await Account.deleteMany();
  await Location.deleteMany();
  await Shop.deleteMany();
  await Product.deleteMany();
  await Nutrients.deleteMany();
  await Receipt.deleteMany();

  await new Account(adminUser).save();
  await new Account(regularUser).save();
  await new Location(locationOne).save();
  await new Location(locationTwo).save();
  await new Shop(shopOne).save();
  await new Shop(shopTwo).save();
  await new Product(productOne).save();
  await new Product(productTwo).save();
  await new Product(productThree).save();
  await new Nutrients(nutrientsOfProductOne).save();
  await new Nutrients(nutrientsOfProductTwo).save();
  await new Nutrients(nutrientsOfProductThree).save();
  await new Receipt(receiptOfProductOne).save();
  await new Receipt(receiptOfProductTwo).save();
  await new Receipt(receiptOfProductThree).save();
};
