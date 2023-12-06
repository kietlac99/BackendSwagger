import express from 'express';
const adminRouter = express.Router();
import { adminController } from '../controllers/adminController.js';

adminRouter.get('/', adminController.getProducts);
adminRouter.post('/add-product', adminController.addProduct);
adminRouter.put('/update-product/:productId', adminController.updateProduct);
adminRouter.delete('/delete-product/:productId', adminController.deleteProduct);

export { adminRouter };