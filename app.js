import express from 'express';
import redis from 'redis';
import morgan from 'morgan'
import { connectDB } from './db/db.js';
import { importData } from './data/auto-data.js';



const client = redis.createClient({
    url: 'redis://127.0.0.1:6379',
  });

client.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

await client.connect();

export { client };

const app = express();

app.use(express.json());

connectDB();


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
        securityDefinitions: {
          BearerAuth: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
              description: 'Enter your bearer token in the format **<token>**',
              scheme: 'bearer',
          }
        },
        security: [{ BearerAuth: [] }]
    },
    apis: ["./controllers/adminController.js", "./controllers/userController.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get('/ping', async (req, res) => { res.send('pong') })

// Start the server
const PORT = 3000;
const startServer = async() => {
  try {
      importData()
      
      app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
      });
  } catch (error) {
      console.error('Error starting the server: ', error)
  }
}

startServer();