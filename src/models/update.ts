import { Schema, Types, model } from 'mongoose';


/**
 * Interface for Updates
 */
interface UpdateInterface {
  price: number,
  date: Date,
  location: string,
  commerce: Types.ObjectId,
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
  location: {
    type: String,
    required: [true, 'A location is required'],
  },
  commerce: {
    type: Schema.Types.ObjectId, ref: 'Commerce',
    required: [true, 'A commerce is required'],
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