import express from 'express';
const userRouter = express.Router();
import { userController } from '../controllers/userController.js';

userRouter.get('/', userController.getProducts);
userRouter.post('/buy-product/:productId', userController.buyProduct);

export { userRouter };