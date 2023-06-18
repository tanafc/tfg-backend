import { Schema, Types, model } from "mongoose";

interface ReceiptInterface {
  price: number;
  date: Date;
  product: Types.ObjectId;
  shop: Types.ObjectId;
  user: Types.ObjectId;
}

const ReceiptSchema = new Schema<ReceiptInterface>({
  price: {
    type: Number,
    required: [true, "A price is required"],
  },
  date: {
    type: Date,
    required: [true, "A date is required"],
  },
  product: {
    type: Schema.Types.ObjectId,
    required: [true, "A product is required"],
    ref: "Product",
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    required: [true, "A shop is required"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A user is required"],
  },
});

export const Receipt = model<ReceiptInterface>("Receipt", ReceiptSchema);
