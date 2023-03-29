import { Schema, Types, model } from 'mongoose';

/**
 * Interface for the geolocation of shops
 */
interface Location { 
  latitude: number,
  longitude: number,
  location: string 
}

/**
 * This interface is where the Account schema is based from
 */
interface ShopInterface {
  name: string,
  products: Types.ObjectId[],
  locations: Location[],
}


const LocationSchema = new Schema<Location>({
  latitude: {
    type: Number,
    required: true,
    min: [-90, "Latitude not valid"],
    max: [90, "Latitude not valid"]
  },
  longitude: {
    type: Number,
    required: true,
    min: [-180, "Longitude not valid"],
    max: [180, "Longitude not valid"]
  },
  location: {
    type: String,
  }
});


const ShopSchema = new Schema<ShopInterface>({
  name: {
    type: String,
    unique: true,
    required: [true, 'A name is required'],
    trim: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId, ref: 'Product',
      default: {}
    },
  ],
  locations: [
    {
      type: LocationSchema,
      default: {}
    }
  ]
});

/**
 * The final model for the Account database
 */
export const Shop = model<ShopInterface>('Shop', ShopSchema);