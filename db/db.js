import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const connectDB = async() => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yourdatabase', {
            useNewUrlParser: true,
            useUnifiedTopology:true,
        });
        console.log("MongoDB connection Established...");
    } catch (error) {
        console.error(error.message);

        process.exit(1);
    }
}

export { connectDB };