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
interface CommerceInterface {
  name: string,
  products: Types.ObjectId[],
  locations: Location[],
}


const LocationSchema = new Schema<Location>({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  }
});


const CommerceSchema = new Schema<CommerceInterface>({
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
export const Commerce = model<CommerceInterface>('Commerce', CommerceSchema);