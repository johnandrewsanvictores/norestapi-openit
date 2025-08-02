import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDbB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    }catch (err) {
        console.log('Error connecting to MongoDB' + err);
        process.exit(1);
    }
}

export default connectDbB;