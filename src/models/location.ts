import { Schema, Types, model } from "mongoose";

interface LocationInterface {
  shop: Types.ObjectId;
  latitude: number;
  longitude: number;
  address: string;
}

const LocationSchema = new Schema<LocationInterface>({
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  latitude: {
    type: Number,
    required: true,
    min: [-90, "Latitude not valid"],
    max: [90, "Latitude not valid"],
  },
  longitude: {
    type: Number,
    required: true,
    min: [-180, "Longitude not valid"],
    max: [180, "Longitude not valid"],
  },
  address: {
    type: String,
  },
});

export const Location = model<LocationInterface>("Location", LocationSchema);
