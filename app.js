import mongoose from 'mongoose';
import express from 'express';
import redis from 'redis';

mongoose.connect('mongodb://127.0.0.1:27017/yourdatabase', { useNewUrlParser: true, useUnifiedTopology: true});
//const client = redis.createClient("redis://127.0.0.1:6379");

const app = express();

app.use(express.json());


// Admin route
import { adminRouter }  from './routes/admin.js'; 
app.use('/admin', adminRouter);

// User route
import { userRouter } from './routes/user.js';
app.use('/user', userRouter);


// Swagger Documentation
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Product API',
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./controllers/adminController.js", "./controllers/userController.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get('/ping', async (req, res) => { res.send('pong') })

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});