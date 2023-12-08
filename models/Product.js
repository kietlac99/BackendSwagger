// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A name is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter a valid price']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please enter a valid quantity']
  },
}, { collection: 'ProductCL', timestamps: true });

const Product = mongoose.model('Product', productSchema);

export { Product };
