import { Schema, Types, model } from 'mongoose';


/**
 * Interface for Updates
 */
interface UpdateInterface {
  price: number,
  date: Date,
  shop: Types.ObjectId,
  user: Types.ObjectId,
}


const UpdateSchema = new Schema<UpdateInterface>({
  price: {
    type: Number,
    required: [true, 'A price is required'],
  },
  date: {
    type: Date,
    required: [true, 'A date is required'],
  },
  shop: {
    type: Schema.Types.ObjectId, ref: 'Shop',
    required: [true, 'A shop is required'],
  },
  user: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: [true, 'A user is required'],
  }
});

/**
 * The final model for the Product database
 */
export const Update = model<UpdateInterface>('Update', UpdateSchema);