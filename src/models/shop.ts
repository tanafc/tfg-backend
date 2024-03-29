import { Schema, Types, model } from "mongoose";

interface ShopInterface {
  name: string;
  products: Types.ObjectId[];
  location: Types.ObjectId;
}

const ShopSchema = new Schema<ShopInterface>({
  name: {
    type: String,
    unique: true,
    required: [true, "A name is required"],
    trim: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
  },
});

export const Shop = model<ShopInterface>("Shop", ShopSchema);
