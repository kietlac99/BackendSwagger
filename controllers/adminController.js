import { Product } from '../models/Product.js';
import redis from 'redis';
const client = redis.createClient();

const adminController = {

  /**
   * @swagger
   * components:
   *   schemas:
   *    Product:
   *        type: object
   *        required:
   *          - name
   *          - price
   *          - stockQuantity
   *        properties:
   *          name:
   *            type: string
   *            description: Product name
   *          price:
   *            type: float
   *            description: Product price
   *          stockQuantity: 
   *            type: integer
   *            description: quantity of the product
   *        example:
   *          name: PS6
   *          price: 500
   *          stockQuantity: 100
   */

  /**
   * @swagger
   * tags:
   *  name: Admin
   *  description: The products managing API
   */

  /**
   * @swagger
   * /admin:
   *  get:
   *    summary: Returns the list of all the products
   *    tags: [Admin]
   *    responses:
   *      200:
   *        description: The list of the products
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Product'
   */

  getProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.json({ success: true, products });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  /**
   * @swagger
   * /admin/add-product:
   *  post:
   *    summary: Create a new product
   *    tags: [Admin]
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Product'
   *    responses:
   *      200:
   *        description: The product was successfully created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product'
   *      500:
   *        description: Some server
   */

  addProduct: async (req, res) => {
    try {
      const { name, price, stockQuantity } = req.body;
      const newProduct = new Product({
        name,
        price,
        stockQuantity,
      });
      await newProduct.save();

      res.status(201).json({ success: true, message: 'Product added successfully' });
    } catch (error) {
      console.log("error: ",error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  /**
   * @swagger
   * /admin/update-product/{productId}:
   *  put:
   *    summary: Update a product
   *    tags: [Admin]
   *    parameters:
   *      - in: path
   *        name: productId
   *        required: true
   *        description: ID of the product to update
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Product'
   *    responses:
   *      200:
   *        description: The product was successfully updated
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product'
   *      404:
   *        description: Product not found
   *      500:
   *        description: Internal Server Error
   */

  updateProduct: async (req, res) => {
    try {
      const productId = req.params.productId;
      const { name, price, stockQuantity } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { name, price, stockQuantity },
        { new: true } // Return the modified document
      );

      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({ success: true, product: updatedProduct, message: 'Product updated successfully' });
    } catch (error) {
      console.log("error: ", error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  /**
   * @swagger
   * /admin/delete-product/{productId}:
   *  delete:
   *    summary: Delete a product
   *    tags: [Admin]
   *    parameters:
   *      - in: path
   *        name: productId
   *        required: true
   *        description: ID of the product to delete
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: The product was successfully deleted
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                  description: Indicates whether the operation was successful
   *                message:
   *                  type: string
   *                  description: A message indicating the result of the operation
   *      404:
   *        description: Product not found
   *      500:
   *        description: Internal Server Error
   */

  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.productId;
      await Product.findByIdAndDelete(productId);

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  
};

export { adminController };
