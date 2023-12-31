import express from 'express';
const adminRouter = express.Router();
import { adminController } from '../controllers/adminController.js';

adminRouter.get('/', adminController.getProducts);
adminRouter.get('/find-product', adminController.getProductsByName);
adminRouter.get('/find-productId/:productId', adminController.getProductsById);
adminRouter.get('/product/:page', adminController.paginationProduct);
adminRouter.get('/product-stats', adminController.getProductStats);
adminRouter.get('/products-by-category', adminController.getProductByCategory);
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/category', adminController.getCategoryInfo);
adminRouter.get('/search-product', adminController.getSearchResults);
adminRouter.post('/add-product', adminController.addProduct);
adminRouter.post('/add-user', adminController.addUser);
adminRouter.post('/add-category', adminController.addCategory);
adminRouter.put('/update-product/:productId', adminController.updateProduct);
adminRouter.delete('/delete-product/:productId', adminController.deleteProduct);

export { adminRouter };