import { Product } from '../models/Product.js';
import redis from 'redis';
const client = redis.createClient();

const userController = {
  /**
   * @swagger
   * tags:
   *  name: User
   *  description: The products managing API
   */
  
  /**
   * @swagger
   * /user:
   *  get:
   *    summary: Returns the list of all the products
   *    tags: [User]
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
     
          // If data is not in cache, fetch from MongoDB and store in cache
          const products = await Product.find();
          
          res.json({ success: true, products, source: 'Database' });
        
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  /**
   * @swagger
   * /user/buy-product/{productId}:
   *  post:
   *    summary: Buy a product
   *    tags: [User]
   *    parameters:
   *      - in: path
   *        name: productId
   *        schema:
   *          type: string
   *        required: true
   *        description: The ID of the product to buy
   *    responses:
   *      200:
   *        description: Product purchased successfully
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                message:
   *                  type: string
   *      404:
   *        description: Product not found
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                message:
   *                  type: string
   *      400:
   *        description: Product out of stock
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                success:
   *                  type: boolean
   *                message:
   *                  type: string
   *      500:
   *        description: Internal Server Error
   */

  buyProduct: async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Check if the product is in stock
      if (product.stockQuantity <= 0) {
        return res.status(400).json({ success: false, message: 'Product out of stock' });
      }

      // Deduct one from the stockQuantity
      product.stockQuantity -= 1;

      // Save the updated product to the database
      await product.save();

      res.json({ success: true, message: 'Product purchased successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },
};

export { userController };
