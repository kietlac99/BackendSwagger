import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8'));

// const users = JSON.parse(fs.readFileSync(`${__dirname}/data.json`, 'utf-8'));


//seed or import Data into DB
const importData = async() => {
    try {
        const builkOperations = products.map(product => ({
            updateOne: {
                filter: { name: product.name },
                update: { $set: product },
                upsert: true
            }
        }))
        await Product.bulkWrite(builkOperations);
        console.log('Data seeded successfully....');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


console.log(process.argv);
export { importData }