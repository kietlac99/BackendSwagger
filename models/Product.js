// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stockQuantity: Number,
}, { collection: 'Product' });

const Product = mongoose.model('Product', productSchema);

export { Product };
