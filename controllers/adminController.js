import { Product } from '../models/Product.js';
import { client } from '../app.js';

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
      const keys = await client.sendCommand(["keys","*"]);
      console.log(keys); // ["aXF","x9U","lOk",...]

      const products = await Product.find();
      res.json({ success: true, products });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  /**
   * @swagger
   * /admin/find-product/{productName}:
   *  get:
   *    summary: Find a product by name
   *    tags: [Admin]
   *    parameters:
   *      - in: path
   *        name: productName
   *        required: true
   *        description: Name of the product to find
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: the product was successfully updated
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product'
   *      404:
   *        description: Product not found
   *      500:
   *        description: Internal Server Error
   */

  getProductsByName: async (req, res) => {
    try {
      const productName = req.params.productName; 
      const findProduct = await Product.findOne({name: productName});
      

      if (!findProduct) {
        return res.status(404).json({success: false, message: 'Product not found!' });
      }

      const cacheKey = `product:${findProduct._id}`;
      const a = await client.get(cacheKey);
      
      if ( a == null)
      {
        res.json({ success: true, findProduct, source: 'Mongo'});
        client.setEx(`product:${findProduct._id}`, 300, JSON.stringify(findProduct), (err, reply) => {
          if (err) {
            console.error('Error saving product to Redis:', err);
          } else {
            console.log('Product saved to Redis:', reply);
          }
        });
      } else {
        res.json({ success: true, a, source: 'Cache'});
      }
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

      
        // Sử dụng client.setex để đặt giá trị với hạn chế thời gian tồn tại (TTL)
        client.setEx(`product:${newProduct._id}`, 300, JSON.stringify(newProduct), (err, reply) => {
          if (err) {
            console.error('Error saving product to Redis:', err);
          } else {
            console.log('Product saved to Redis:', reply);
          }
        });
      

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

      const cacheKey = `product:${productId}`;
      const a = await client.get(cacheKey);

      if (a == null){
        client.setEx(`product:${productId}`, 300, JSON.stringify(updatedProduct), (err, reply) => {
          if (err) {
            console.error('Error saving product to Redis:', err);
          } else {
            console.log('Product saved to Redis:', reply);
          }
        });
      } else {
        client.del(cacheKey);
        console.log("Product delete successfully!");

        client.setEx(`product:${productId}`, 300, JSON.stringify(updatedProduct), (err, reply) => {
          if (err) {
            console.error('Error saving product to Redis:', err);
          } else {
            console.log('Product saved to Redis:', reply);
          }
        });
      }

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
      
      const cacheKey = `product:${productId}`;
      const a = await client.get(cacheKey);

      if (a != null) {
        client.del(cacheKey);
        console.log("Product delete successfully!");
      }
      else{
        console.log("Product not found in cache!");
      }

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  
};

export { adminController };
