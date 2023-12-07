import express from 'express';
const adminRouter = express.Router();
import { adminController } from '../controllers/adminController.js';

adminRouter.get('/', adminController.getProducts);
adminRouter.get('/find-product/:productName', adminController.getProductsByName);
adminRouter.post('/add-product', adminController.addProduct);
adminRouter.put('/update-product/:productId', adminController.updateProduct);
adminRouter.delete('/delete-product/:productId', adminController.deleteProduct);

export { adminRouter };