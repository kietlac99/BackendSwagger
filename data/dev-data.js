import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../db/db.js';
dotenv.config();
import { Product } from '../models/Product.js';

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8'));

// const users = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));




//seed or import Data into DB
const importData = async() => {
    try {
        await Product.create(products);
        console.log('Data seeded successfully....');
    } catch (error) {
        console.log(error);
        process.exit();
    }
}

//delete Data in DB
const deleteData = async() => {
    try {
        await Product.deleteMany();
        console.log('Data successfully deleted');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);