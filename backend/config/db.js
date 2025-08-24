import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()
export const Connectdb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database connected successfully")
    } catch (error) {
        console.error(`Database connection error: ${error.message}`)
        process.exit(1);
    }
}