import mongoose from 'mongoose'
import Category from './category.js';
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "product name is required"],
    minlength: 3,
  },
  description: {
    type: String,
    required: [true, "description is required"],
    minlength: 10,
  },
  price: {
    type: Number,
    required: [true, "price  is required"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "category is required"],
  },
  images: [
    {
      public_id: String,
      url: String,
    }
  ],
  dicount: {

  },
  rating: {
    type: Number
  },
  reviews: []
})
const Product = mongoose.model("Product", productSchema);
export default Product;