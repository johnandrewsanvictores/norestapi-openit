import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDbB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        return true;
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err.message);
        throw err;
    }
}

export default connectDbB;