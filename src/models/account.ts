import { Schema, Types, model } from "mongoose";
import { isValidEmail, isValidUsername } from "../utils/validateAccount";

interface AccountInterface {
  username: string;
  email: string;
  password: string;
  role: string;
  receipts: Types.ObjectId[];
}

const AccountSchema = new Schema<AccountInterface>({
  username: {
    type: String,
    unique: true,
    required: [true, "A username is required"],
    validate: [isValidUsername, "Please, enter a valid username"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "An email address is required"],
    validate: [isValidEmail, "Please, fill a valid email address"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "A password is required"],
    trim: true,
  },
  role: {
    type: String,
    required: [true, "A role is required"],
    trim: true,
    enum: ["regular", "admin"],
    default: "regular",
  },
  receipts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Receipt",
    },
  ],
});

export const Account = model<AccountInterface>("Account", AccountSchema);
