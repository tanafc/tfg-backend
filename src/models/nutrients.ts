import { Schema, Types, model } from "mongoose";

interface NutrientsInterface {
  product: Types.ObjectId;
  energy: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  totalCarbohydrates: number;
  totalSugars: number;
  addedSugars: number;
  protein: number;
  salt: number;
  sodium: number;
  fibre: number;
  perFruitVeg: number;
  cholesterol: number;
  dVitamin: number;
  calcium: number;
  iron: number;
  potassium: number;
}

const NutrientsSchema = new Schema<NutrientsInterface>({
  product: {
    type: Schema.Types.ObjectId,
    required: [true, "A product is required"],
    ref: "Product",
  },
  energy: {
    type: Number,
    required: true,
  },
  totalFat: {
    type: Number,
    required: true,
  },
  saturatedFat: {
    type: Number,
    required: true,
  },
  transFat: {
    type: Number,
  },
  totalCarbohydrates: {
    type: Number,
    required: true,
  },
  totalSugars: {
    type: Number,
    required: true,
  },
  addedSugars: {
    type: Number,
  },
  protein: {
    type: Number,
    required: true,
  },
  salt: {
    type: Number,
    required: true,
  },
  sodium: {
    type: Number,
  },
  fibre: {
    type: Number,
  },
  perFruitVeg: {
    type: Number,
  },
  cholesterol: {
    type: Number,
  },
  dVitamin: {
    type: Number,
  },
  calcium: {
    type: Number,
  },
  iron: {
    type: Number,
  },
  potassium: {
    type: Number,
  },
});

export const Nutrients = model<NutrientsInterface>(
  "Nutrients",
  NutrientsSchema
);
