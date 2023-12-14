import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'A category is required']
    }
}, {collection: 'Category', timestamps: true}) ;

const Category = mongoose.model('Category', categorySchema)

export { Category }