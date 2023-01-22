import { Schema, model } from 'mongoose';


/**
 * Interface for Updates
 */
interface UpdateInterface {
  price: number,
  date: Date,
  location: string,
  user: string,
}

/**
 * Interface for Nutrients
 */
interface NutrientsInterface {
  energy: number,
  totalFat: number,
  saturatedFat: number,
  totalCarbohydrates: number,
  sugars: number,
  protein: number,
  salt: number,
  sodium: number,
  fibre: number,
  perFruitVeg: number,
}

/**
 * Interface for Products
 */
interface ProductInterface {
  barcode: string,
  name: string,
  brand: string,
  image: string,
  record: UpdateInterface[],
  ingredients: string[],
  nutrients: NutrientsInterface,
  beverage: boolean,
  nutriScore: string,
}


const ProductSchema = new Schema<ProductInterface>({
  barcode: {
    type: String,
    unique: true,
    required: [true, 'A barcode is required'],
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'A name is required'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'A brand is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'An image is required'],
    trim: true,
  },
  record: [
    {
      type: {},
    },
  ],
  ingredients: [
    {
      type: String,
      required: [true, 'Ingredients are required'],
      trim: true,
    },
  ],
  nutrients: {
    type: {},
  },
  beverage: {
    type: Boolean,
    required: [true, 'Indicate if it is a beverage'],
  },
  nutriScore: {
    type: String,
    enum: [
      'A', 'B', 'C', 'D', 'E'
    ],
    trim: true,
  }
});

/**
 * The final model for the Product database
 */
export const Product = model<ProductInterface>('Product', ProductSchema);