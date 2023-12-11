import { Product } from '../models/Product.js';
import { client } from '../app.js';
import { userHttp } from '../utils/usersAPI.js';

const adminController = {

  /**
   * @swagger
   * components:
   *   schemas:
   *    User:
   *        type: object
   *        required:
   *          - userName
   *          - password
   *          - email
   *        properties:
   *          userName:
   *            type: string
   *            description: User name
   *          password:
   *            type: string
   *            description: user password
   *          email:
   *            type: string
   *            description: user email
   *        example:
   *          userName: kietlac
   *          password: 12345Lac
   *          email: kietlac@gmail.com
   *    Product:
   *        type: object
   *        required:
   *          - name
   *          - category
   *          - price
   *          - stockQuantity
   *        properties:
   *          name:
   *            type: string
   *            description: Product name
   *          category:
   *            type: string
   *            description: Product category
   *          price:
   *            type: float
   *            description: Product price
   *          stockQuantity: 
   *            type: integer
   *            description: quantity of the product
   *        example:
   *          name: PS6
   *          category: gaming
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

      res.json({ success: true, totalProduct: products.length, products });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  },

  /**
   * @swagger
   * /admin/find-productId/{productId}:
   *  get:
   *    summary: Find a product by Id
   *    tags: [Admin]
   *    parameters:
   *      - in: path
   *        name: productId
   *        required: true
   *        description: Id of the product to find
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: the product was found
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product'
   *      404:
   *        description: Product not found
   *      500:
   *        description: Internal Server Error
   */

  getProductsById: async (req, res) => {
    try {
      const cacheKey = `product:${req.params.productId}`;
      const a = await client.get(cacheKey);
      
      console.log(a);
    
      if ( a == null)
      {
        const productId = req.params.productId; 
        const findProduct = await Product.findById(productId);

        if (!findProduct) {
          return res.status(404).json({success: false, message: 'Product not found!' });
        }

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
   * /admin/find-product:
   *  get:
   *    summary: Find a product by name
   *    tags: [Admin]
   *    parameters:
   *      - in: query
   *        name: productName
   *        required: true
   *        description: Name of the product to find
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: the product was found
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
      const productName = req.query.productName; 

      if (!productName) {
        return res.status(404).json({success: false, message: 'Product name is required in query parameter'});
      }

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
   * /admin/product/{page}:
   *  get:
   *    summary: Go to a directed page
   *    tags: [Admin]
   *    parameters:
   *      - in: path
   *        name: Page number
   *        required: true
   *        description: enter page number to direct to that page
   *        schema:
   *          type: integer
   *    responses:
   *      200:
   *        description: Go to a page successfully
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
   *                  description: A message indicating a result of the operation
   *      400:
   *        description: Page not found
   *      500:
   *        description: Internal server error
   */ 
  //pagination
  paginationProduct: async (req, res) => {
    try {
      let perPage = 16; // số lượng sản phẩm xuất hiện trên 1 page
      let page = req.params.page || 1

      const products = await Product
        .find()
        .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec();
      const count = Math.ceil(await(Product.countDocuments()) / perPage);// đếm có bao nhiêu trang

      res.json({ success: true, product: products, totalPage: count, message: 'Product updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

    /**
   * @swagger
   * /admin/product-stats:
   *  get:
   *    summary: Get products stats
   *    tags: [Admin]
   *    responses:
   *      200:
   *        description: Products stats found successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product'
   *      404:
   *        description: Product not found
   */

  getProductStats: async (req, res) => {
    try {
      const stats = await Product.aggregate([
        { $match: {stockQuantity: {$gte: 50}}},
        { $group: {
            _id: '$category',
            avgQuantity: { $avg: '$stockQuantity'},
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            priceTotal: { $sum: '$price' },
            productCount: { $sum: 1 },
        }},
        { $sort: { minPrice: 1}},
        { $match: {maxPrice: {$gte: 99.47}}},
      ]);
      
      res.status(200).json({
        status: 'success',
        count: stats.length,
        data: {
          stats
        }
      })
    } catch(err) {
      res.status(404).json({
        status: "fail",
        message: err.message,
      })
    }
  },

  /**
   * @swagger
   * /admin/products-by-category:
   *  get:
   *    summary: Find products by category
   *    tags: [Admin]
   *    parameters:
   *      - in: query
   *        name: productCategory
   *        required: true
   *        description: find product by category
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Products stats found successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product'
   *      404:
   *        description: Product not found
   */

  getProductByCategory : async (req, res) => {
    try {
      const productCategory = req.query.productCategory;
      const products = await Product.aggregate([
        { $match: {category: productCategory}},
        { $group: {
          _id: productCategory,
          productCount: { $sum: 1 },
          products: {$push: '$name'},
        }},
        {$addFields: {category: "$_id"}},
        {$project: {_id: 0}},
      ]);


      res.status(200).json({
        status: 'success',
        count: products.length,
        data: {
          products
        }
      })
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err.message,
      })
    }
  },

  /**
   * @swagger
   * /admin/users:
   *  get:
   *    summary: Return the list of all the users
   *    tags: [Admin]
   *    responses:
   *      200:
   *        description: The list of the users
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#components/schemas/User'
   */

  getUsers: async(req, res) => {
    await userHttp.get('/admin/users')
    .then((data) => {
      res.status(200).json(data.data)
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    });
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
      const { name, category, price, stockQuantity } = req.body;
      const newProduct = new Product({
        name,
        category,
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
   * /admin/add-user:
   *  post:
   *    summary: Create a new user
   *    tags: [Admin]
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *    responses:
   *      200:
   *        description: The user was successfully created
   *        content:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *      500:
   *        description: Some server
   */

  addUser: async (req, res) => {
    await userHttp.post('/admin/add-user', req.body)
    .then(({data}) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log(error.toJSON());
      res.status(500).json({
        error: 'Internal server error'
      })
    });
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
      const { name, category, price, stockQuantity } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { name, category, price, stockQuantity },
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
