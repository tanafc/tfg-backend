import { Schema, Types, model } from "mongoose";

interface ProductInterface {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  ingredients: string[];
  nutrients: Types.ObjectId;
  beverage: boolean;
  nutriScore: string;
}

const ProductSchema = new Schema<ProductInterface>({
  barcode: {
    type: String,
    unique: true,
    required: [true, "A barcode is required"],
    // match: [/^(?=.*0)[0-9]{12,13}$/, "Please, enter a valid UPC or EAN barcode"],
    trim: true,
  },
  name: {
    type: String,
    required: [true, "A name is required"],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "A brand is required"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "An image is required"],
    trim: true,
  },
  ingredients: [
    {
      type: String,
      required: [true, "Ingredients are required"],
      trim: true,
    },
  ],
  nutrients: {
    type: Schema.Types.ObjectId,
    ref: "Nutrients",
    required: true,
  },
  beverage: {
    type: Boolean,
    required: [true, "Indicate if it is a beverage"],
  },
  nutriScore: {
    type: String,
    enum: ["A", "B", "C", "D", "E", ""],
    trim: true,
  },
});

export const Product = model<ProductInterface>("Product", ProductSchema);
