import express from 'express';
const adminRouter = express.Router();
import { adminController } from '../controllers/adminController.js';

adminRouter.get('/', adminController.getProducts);
adminRouter.get('/find-product', adminController.getProductsByName);
adminRouter.get('/find-productId/:productId', adminController.getProductsById);
adminRouter.get('/product/:page', adminController.paginationProduct);
adminRouter.get('/product-stats', adminController.getProductStats);
adminRouter.get('/products-by-category', adminController.getProductByCategory);
adminRouter.post('/add-product', adminController.addProduct);
adminRouter.put('/update-product/:productId', adminController.updateProduct);
adminRouter.delete('/delete-product/:productId', adminController.deleteProduct);

export { adminRouter };