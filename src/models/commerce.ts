import { Schema, Types, model } from 'mongoose';

/**
 * This interface is where the Account schema is based from
 */
interface CommerceInterface {
  name: string,
  products: Types.ObjectId[],
  locations: string[]
}


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
    },
  ],
  locations: [
    {
      type: String,
      trim: true,
    }
  ]
});

/**
 * The final model for the Account database
 */
export const Commerce = model<CommerceInterface>('Commerce', CommerceSchema);